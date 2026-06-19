// Types for AI provider abstraction

export interface AiPlanRequest {
  notes: string;
  description: string;
  projectId?: string;
  model?: string; // optional override per request
}

export interface AiPlanResponse {
  plan: {
    tasks: string[];
    wireframes: string[];
    accessibility: string[];
  };
}

export interface AiSuggestRequest {
  content: string;
  filename?: string;
  model?: string;
}

export interface AiSuggestResponse {
  suggestions: string[];
}

export interface AiProvider {
  generatePlan(request: AiPlanRequest): Promise<AiPlanResponse>;
  getSuggestions(request: AiSuggestRequest): Promise<AiSuggestResponse>;
}
