// scripts/update-figma-tokens.js
/**
 * Sync design tokens from a Figma file and write them as a JSON file.
 *
 * Usage:
 *   FIGMA_TOKEN=your_pat node scripts/update-figma-tokens.js <FIGMA_FILE_ID>
 *
 * The script fetches the file's "styles" section, extracts colors and
 * text style information, and writes a JSON file to `src/generated/figma-tokens.json`.
 *
 * The resulting JSON can be imported in the app (e.g. via a fetch or
 * dynamic import) and used to set CSS custom properties or populate a design
 * system.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
if (!FIGMA_TOKEN) {
  console.error('Error: FIGMA_TOKEN environment variable not set.');
  process.exit(1);
}

const [, , fileId] = process.argv;
if (!fileId) {
  console.error('Usage: node scripts/update-figma-tokens.js <FIGMA_FILE_ID>');
  process.exit(1);
}

const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${fileId}`,
  method: 'GET',
  headers: {
    'X-Figma-Token': FIGMA_TOKEN,
    'Accept': 'application/json',
  },
};

function fetchFigmaFile() {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Figma API error ${res.statusCode}: ${data}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function extractTokens(figmaData) {
  const tokens = { colors: {}, textStyles: {} };
  const styles = figmaData?.styles || {};
  // Colors are stored under style type "FILL"
  for (const [styleId, style] of Object.entries(styles)) {
    if (style.styleType === 'FILL' && style.description) {
      // The description often contains a hex value; fallback to raw paints.
      const paint = style?.meta?.fills?.[0];
      if (paint && paint.type === 'SOLID') {
        const { r, g, b, a = 1 } = paint.color;
        const hex = `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
        tokens.colors[style.name] = { hex, opacity: a };
      }
    }
    if (style.styleType === 'TEXT') {
      tokens.textStyles[style.name] = style;
    }
  }
  return tokens;
}

async function main() {
  try {
    const figmaData = await fetchFigmaFile();
    const tokens = extractTokens(figmaData);
    const outDir = path.resolve(__dirname, '../src/generated');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'figma-tokens.json');
    fs.writeFileSync(outPath, JSON.stringify(tokens, null, 2), 'utf-8');
    console.log(`✅ Tokens written to ${outPath}`);
  } catch (err) {
    console.error('❌ Failed to sync tokens:', err.message);
    process.exit(1);
  }
}

main();
