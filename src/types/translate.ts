// Types for the dual-model translate workflow

export interface SuggestResponse {
  model_a: string | null;
  model_b: string | null;
  selection_method?: string | null;
  total_models_considered?: number | null;
  note?: string | null;
}

export interface TranslateRequest {
  text: string;
  prompt: string;
}

export interface VoteRequest {
  score: 1 | 2 | 3 | 4 | 5;
}

export interface ModelStreamState {
  data: string;
  isStreaming: boolean;
  error: string | null;
  isComplete: boolean;
}

export interface TranslateSession {
  id: string;
  inputText: string;
  modelA: {
    id: string;
    name: string;
    content: string;
    isStreaming: boolean;
    error: string | null;
    isComplete: boolean;
  };
  modelB: {
    id: string;
    name: string;
    content: string;
    isStreaming: boolean;
    error: string | null;
    isComplete: boolean;
  };
  selectedModel: string | null;
  score: number | null;
  voted: boolean;
  timestamp: Date;
  selectionMethod?: string;
}

export interface StreamChunk {
  content: string;
  timestamp: number;
}

// Default fallback models
export const DEFAULT_MODELS = ['gpt-4', 'gemini-1.0-pro'] as const;

// Translation leaderboard types
export interface TranslationModelScore {
  model_version: string;
  provider: string;
  total_votes: number;
  average_score: number;
  score_percentage: number;
  score_breakdown: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
}

export interface TranslationLeaderboardResponse {
  leaderboard: TranslationModelScore[];
}
