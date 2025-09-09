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
  target_language?: string;
}

export interface VoteRequest {
  translation_output1_id: string;
  translation_output2_id: string;
  winner_choice: "output1" | "output2" | "tie" | "neither";
  response_time_ms: number;
}

export interface ModelStreamState {
  data: string;
  isStreaming: boolean;
  error: string | null;
  isComplete: boolean;
  translationOutputId?: string;
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

// Default translate prompt
export const DEFAULT_TRANSLATE_PROMPT = "";

// Supported target languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'bo', name: 'Tibetan', flag: '🏔️' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

// Helper function to create a translation prompt with target language
export const createTranslatePrompt = (targetLanguage: string): string => {
  return `Translate the following text to ${targetLanguage} accurately while preserving meaning and context:`;
};

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
