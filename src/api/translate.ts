import type { SuggestResponse, TranslateRequest, VoteRequest, TranslationLeaderboardResponse } from "../types/translate";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_SERVER_URL || "https://eval-api.pecha.tools";

// Helper function to get access token (should be set by AuthWrapper)
let getAccessTokenSilently: (() => Promise<string>) | null = null;

export const setTranslateAuthTokenGetter = (tokenGetter: () => Promise<string>) => {
  getAccessTokenSilently = tokenGetter;
};

// Helper function to get auth headers
const getAuthHeaders = async (includeAuth = true): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    "accept": "application/json",
    "Content-Type": "application/json",
  };

  if (includeAuth && getAccessTokenSilently) {
    try {
      const token = await getAccessTokenSilently();
      headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.warn("Failed to get access token:", error);
    }
  }

  return headers;
};

/**
 * Get suggested models for translation comparison
 * This endpoint is public and doesn't require authentication
 */
export async function suggestModels(token?: string): Promise<SuggestResponse> {
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

    // Add timestamp to prevent caching
    const url = new URL(`${API_BASE_URL}/translate/suggest_model`);
    url.searchParams.append('_t', Date.now().toString());

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
 * Vote on a model's translation quality
 * Requires authentication
 */
export async function voteModel(
  modelId: string,
  score: number,
  token: string
): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    
    // Override with provided token if available
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const body: VoteRequest = { score: score as VoteRequest['score'] };

    const response = await fetch(
      `${API_BASE_URL}/translate/vote/${encodeURIComponent(modelId)}`,
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

// Export the translate API object for consistency with other API modules
export const translateApi = {
  suggestModels,
  streamTranslate,
  voteModel,
  getTranslationLeaderboard,
};
