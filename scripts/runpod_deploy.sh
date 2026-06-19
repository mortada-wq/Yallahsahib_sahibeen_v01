#!/usr/bin/env bash
# scripts/runpod_deploy.sh
# ------------------------------------------------------------
# Deploy the Yalla Sahib app to RunPod (container-based GPU/CPU endpoints)
# ------------------------------------------------------------
# Prerequisites:
#   1. Docker (or podman) installed and logged in to your container registry.
#   2. A RunPod API key (RUNPOD_API_KEY) – you can generate it in the RunPod console.
#   3. A container registry account (Docker Hub, GitHub Packages, GitLab Registry, etc.).
#      – Ensure you have an account name (REGISTRY_USER) and a repository name (REPO_NAME).
#   4. The Dockerfile in the project builds a production image exposing port 5173.
#
# Usage:
#   REGISTRY_USER=myuser REPO_NAME=yalla-sahib IMAGE_TAG=latest ./scripts/runpod_deploy.sh
#   # Optionally set RUNPOD_API_KEY in the environment before running.
#
# The script performs the following steps:
#   1. Build the Docker image.
#   2. Tag the image for the chosen registry.
#   3. Push the image.
#   4. Create (or update) a RunPod endpoint using the RunPod API.
# ------------------------------------------------------------
set -euo pipefail

# ---- Configurable variables (can be overridden via env) ----
REGISTRY="docker.io"               # default Docker Hub registry
REGISTRY_USER="${REGISTRY_USER:-}" # e.g., mydockeruser
REPO_NAME="${REPO_NAME:-yalla-sahib}"   # repository name
IMAGE_TAG="${IMAGE_TAG:-latest}"   # Docker tag
FULL_IMAGE="${REGISTRY}/${REGISTRY_USER}/${REPO_NAME}:${IMAGE_TAG}"

# RunPod specifics
RUNPOD_ENDPOINT_NAME="${RUNPOD_ENDPOINT_NAME:-yalla-sahib-endpoint}"   # name of the endpoint
RUNPOD_GPU_TYPE="${RUNPOD_GPU_TYPE:-NVIDIA_T4}"   # GPU type (or "cpu" for CPU-only)
RUNPOD_GPU_COUNT="${RUNPOD_GPU_COUNT:-1}"       # number of GPUs
RUNPOD_CPU_CORES="${RUNPOD_CPU_CORES:-4}"       # CPU cores (used for CPU endpoints)
RUNPOD_MEMORY_GB="${RUNPOD_MEMORY_GB:-16}"      # RAM in GB
RUNPOD_DISK_GB="${RUNPOD_DISK_GB:-30}"          # Disk size in GB
RUNPOD_MAX_CONCURRENCY="${RUNPOD_MAX_CONCURRENCY:-1}" # max simultaneous requests
RUNPOD_API_KEY="${RUNPOD_API_KEY:?Missing RUNPOD_API_KEY env var}"

# ------------------------------------------------------------
# 1️⃣ Build the Docker image
# ------------------------------------------------------------
echo "▶ Building Docker image ${FULL_IMAGE}..."
docker build -t "${FULL_IMAGE}" .

# 2️⃣ Push the image to the registry
# ------------------------------------------------------------
if [[ -z "${REGISTRY_USER}" ]]; then
  echo "⚠️  REGISTRY_USER is not set – the image will be tagged as ${FULL_IMAGE} but may not be pushable to a public repo."
else
  echo "▶ Pushing image to ${FULL_IMAGE}..."
  docker push "${FULL_IMAGE}"
fi

# 3️⃣ Create/Update RunPod endpoint via API
# ------------------------------------------------------------
# Helper: perform a POST request with JSON payload
api_post() {
  local url=$1
  local data=$2
  curl -s -X POST "${url}" \
    -H "Authorization: Bearer ${RUNPOD_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "${data}"
}

# Prepare payload (JSON)
read -r -d '' PAYLOAD <<EOF
{
  "name": "${RUNPOD_ENDPOINT_NAME}",
  "gpu_type": "${RUNPOD_GPU_TYPE}",
  "gpu_count": ${RUNPOD_GPU_COUNT},
  "container_image": "${FULL_IMAGE}",
  "docker_args": {
    "env": [
      "PORT=5173",
      "HOST=0.0.0.0"
    ]
  },
  "min_vram": 0,
  "max_vram": 0,
  "disk_space": ${RUNPOD_DISK_GB},
  "cpu_cores": ${RUNPOD_CPU_CORES},
  "memory": ${RUNPOD_MEMORY_GB},
  "max_concurrent_requests": ${RUNPOD_MAX_CONCURRENCY}
}
EOF

# Check if endpoint already exists (list endpoints and grep by name)
EXISTING=$(curl -s -H "Authorization: Bearer ${RUNPOD_API_KEY}" https://api.runpod.io/v2/endpoints | jq -r ".data[] | select(.name==\"${RUNPOD_ENDPOINT_NAME}\") | .id")

if [[ -n "${EXISTING}" ]]; then
  echo "▶ Updating existing RunPod endpoint ID ${EXISTING}..."
  RESPONSE=$(curl -s -X PATCH "https://api.runpod.io/v2/endpoints/${EXISTING}" \
    -H "Authorization: Bearer ${RUNPOD_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "${PAYLOAD}")
else
  echo "▶ Creating new RunPod endpoint ${RUNPOD_ENDPOINT_NAME}..."
  RESPONSE=$(api_post "https://api.runpod.io/v2/endpoints" "${PAYLOAD}")
fi

# Pretty‑print the response (requires jq)
if command -v jq >/dev/null 2>&1; then
  echo "Response:" | jq . <<<"${RESPONSE}"
else
  echo "Response: ${RESPONSE}"
fi

echo "✅ RunPod deployment script finished."
