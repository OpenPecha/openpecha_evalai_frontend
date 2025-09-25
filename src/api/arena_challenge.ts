import { getAuthHeaders } from "../lib/auth";
import type { ArenaChallenge, ArenaChallengeRequest, ArenaChallengeQuery, ArenaRanking, ArenaChallengeResponse } from "../types/arena_challenge";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_SERVER_URL || "https://eval-api.pecha.tools";

export const arenaApi = {
   // Get challenges with filtering, search, and pagination
  getChallengesWithPagination: async (query: ArenaChallengeQuery & { page_number?: number }): Promise<ArenaChallengeResponse> => {
    try {
      const headers = await getAuthHeaders("json");
      const params = new URLSearchParams();
      if (query.from_language) params.append('from_language', query.from_language);
      if (query.to_language) params.append('to_language', query.to_language);
      if (query.text_category_id) params.append('text_category_id', query.text_category_id);
      if (query.challenge_name) params.append('challenge_name', query.challenge_name);
      if (query.page_number) params.append('page_number', query.page_number.toString());

      const response = await fetch(`${API_BASE_URL}/arena_challenge/?${params}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  },

   // Get a specific challenge by query parameters (legacy - keeping for backward compatibility)
  getFilteredChallenge: async (query: ArenaChallengeQuery): Promise<ArenaChallenge[]> => {
    const response = await arenaApi.getChallengesWithPagination(query);
    return response.items;
  },

  // get all challenges
  getChallenges: async (): Promise<ArenaChallenge[]> => {

    try {
      const response = await fetch(`${API_BASE_URL}/arena_challenge/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
    
  },

  // get all categories
  getCategories: async (): Promise<{id: string, name: string}[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/text_category`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  },
  // create a new challenge
  createChallenge: async (challengeData: ArenaChallengeRequest): Promise<ArenaChallenge> => {
    try {
      const headers = await getAuthHeaders("json");
      const response = await fetch(`${API_BASE_URL}/arena_challenge/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(challengeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
    
  },

  // Get all the arena challenges rankings
  getAllArenaRankings: async (): Promise<ArenaRanking[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/arena_ranking/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching arena rankings:', error);
      throw error;
    }
  },

  // Get arena ranking by challenge ID with optional ranking type
  getArenaRankingById: async (challengeId: string, rankingBy?: 'combined' | 'template' | 'model'): Promise<any> => {
    try {
      const params = new URLSearchParams();
      if (rankingBy) {
        params.append('ranking_by', rankingBy);
      }
      
      const queryString = params.toString();
      const url = `${API_BASE_URL}/arena_ranking/${challengeId}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching arena ranking:', error);
      throw error;
    }
  },
};
