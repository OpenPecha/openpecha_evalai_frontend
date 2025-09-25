import type { SuggestResponse, TranslateRequest, VoteRequest, TranslationLeaderboardResponse, UserVoteLeaderboardResponse, ModelVoteLeaderboardResponse } from "../types/translate";
import { getAuthHeaders as getCentralAuthHeaders, setAuthTokenGetter } from "../lib/auth";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_SERVER_URL || "https://eval-api.pecha.tools";

// Export the centralized auth token setter with the original name for backward compatibility
export const setTranslateAuthTokenGetter = setAuthTokenGetter;

// Helper function to get auth headers with accept header for translate API
const getAuthHeaders = async (includeAuth = true): Promise<Record<string, string>> => {
  const headers = await getCentralAuthHeaders("json", includeAuth);
  headers.accept = "application/json"; // Add accept header specific to translate API
  return headers;
};

/**
 * Get suggested models for translation comparison
 * This endpoint is public and doesn't require authentication
 */
export async function suggestModels(token?: string, sourceText?: string): Promise<SuggestResponse> {
  try {
    const headers: Record<string, string> = {
      "accept": "application/json",
      // Prevent caching to ensure fresh suggestions
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    };

    // Add auth header if token is provided
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp to prevent caching and source text for filtering
    const url = new URL(`${API_BASE_URL}/translate/suggest_model`);
    url.searchParams.append('_t', Date.now().toString());
    
    // Add source text parameter if provided
    if (sourceText?.trim()) {
      url.searchParams.append('source_text', sourceText.trim());
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SuggestResponse = await response.json();
    console.log('Fresh model suggestions received:', data);
    return data;
  } catch (error) {
    console.error("Error fetching suggested models:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch suggested models"
    );
  }
}

/**
 * Stream translation from a specific model
 * Requires authentication
 */
export async function streamTranslate(
  modelId: string,
  body: TranslateRequest,
  token: string,
  signal: AbortSignal
): Promise<Response> {
  try {
    const headers: Record<string, string> = {
      "accept": "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(
      `${API_BASE_URL}/translate/stream?model=${encodeURIComponent(modelId)}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error; // Re-throw abort errors as-is
    }
    console.error("Error streaming translation:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to stream translation"
    );
  }
}

/**
 * Stream translation from two specific models simultaneously
 * Uses a single job ID for both streams to ensure proper session tracking
 * Requires authentication
 */
export async function streamDualTranslate(
  modelA: string,
  modelB: string,
  targetLanguage: string,
  body: TranslateRequest,
  token: string,
  signal: AbortSignal
): Promise<Response> {
  try {
    const headers: Record<string, string> = {
      "accept": "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const dualRequest = {
      ...body,
      models: [modelA, modelB],
      target_language: targetLanguage,
    };


    const response = await fetch(
      `${API_BASE_URL}/translate/dual-stream`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(dualRequest),
        signal,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error; // Re-throw abort errors as-is
    }
    console.error("Error streaming dual translation:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to stream dual translation"
    );
  }
}

/**
 * Vote on translation models
 * Requires authentication
 */
export async function voteModel(
  translationOutput1Id: string,
  translationOutput2Id: string,
  winnerChoice: "output1" | "output2" | "tie" | "neither",
  responseTimeMs: number,
  token: string,
  comment?: string
): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    
    // Override with provided token if available
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const body: VoteRequest = { 
      translation_output1_id: translationOutput1Id,
      translation_output2_id: translationOutput2Id,
      winner_choice: winnerChoice,
      response_time_ms: responseTimeMs,
      comment: comment
    };

    console.log(`FRONTEND: Voting on outputs: ${translationOutput1Id} vs ${translationOutput2Id}, choice: ${winnerChoice}`);

    const response = await fetch(
      `${API_BASE_URL}/translate/vote`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Vote endpoint might return empty response
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      await response.json(); // Consume response if it's JSON
    }
  } catch (error) {
    console.error("Error voting on model:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to vote on model"
    );
  }
}

/**
 * Get translation model leaderboard scores
 * Public endpoint, no authentication required
 */
export async function getTranslationLeaderboard(): Promise<TranslationLeaderboardResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/translate/score`, {
      method: "GET",
      headers: {
        "accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TranslationLeaderboardResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching translation leaderboard:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch translation leaderboard"
    );
  }
}

/**
 * Get user vote leaderboard showing users ranked by their vote count
 * Public endpoint, no authentication required
 */
export async function getUserVoteLeaderboard(): Promise<UserVoteLeaderboardResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/translate/user-vote-leaderboard`, {
      method: "GET",
      headers: {
        "accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: UserVoteLeaderboardResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user vote leaderboard:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch user vote leaderboard"
    );
  }
}

/**
 * Get model vote leaderboard showing models ranked by their vote scores
 * Scores calculated as: clear wins (1 point) + ties (0.5 points)
 * Public endpoint, no authentication required
 */
export async function getModelVoteLeaderboard(): Promise<ModelVoteLeaderboardResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/translate/model-vote-leaderboard`, {
      method: "GET",
      headers: {
        "accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ModelVoteLeaderboardResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching model vote leaderboard:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch model vote leaderboard"
    );
  }
}

// Export the translate API object for consistency with other API modules
export const translateApi = {
  suggestModels,
  streamTranslate,
  streamDualTranslate,
  voteModel,
  getTranslationLeaderboard,
  getUserVoteLeaderboard,
  getModelVoteLeaderboard,
};


/**
 * Translate using v2 API endpoint
 */
export async function translateV2(
  templateId: string | null,
  challengeId: string,
  input_text: string,
): Promise<any> {
  try {
    const body = {
      template_id: templateId || null,
      challenge_id: challengeId,
      input_text: input_text,
    };

    const response = await fetch(`${API_BASE_URL}/arena/translate/`, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error calling translate v2:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to translate v2"
    );
  }
}

/** vote on translation v2 */
export async function updateBattleWinner(
  battleResultId: string,
  id1: string,
  id2: string,
  result: string
): Promise<any> {
  try {
    const body = {
      battle_result_id: battleResultId,
      id_1: id1,
      id_2: id2,
      result: result,
    };


    const headers = await getAuthHeaders(true);

    const response = await fetch(`${API_BASE_URL}/translate_v2/update_battle_winner`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating battle winner:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update battle winner"
    );
  }
}

