import type { ArenaChallenge, ArenaChallengeRequest, ArenaChallengeQuery } from "../types/arena_challenge";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_SERVER_URL || "https://eval-api.pecha.tools";

export const arenaApi = {
   // Get a specific challenge by query parameters
  getFilteredChallenge: async (query: ArenaChallengeQuery): Promise<ArenaChallenge[]> => {
    try {
      const params = new URLSearchParams();
      if (query.from_language) params.append('from_language', query.from_language);
      if (query.to_language) params.append('to_language', query.to_language);
      if (query.text) params.append('text', query.text);
      if (query.challenge_name) params.append('challenge_name', query.challenge_name);

      const response = await fetch(`${API_BASE_URL}/arena_challenge/?${params}`, {
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
      console.error('Error fetching challenge:', error);
      throw error;
    }
    
  },

  // get all challenges
  getChallenges: async (): Promise<ArenaChallenge[]> => {

    try {
      const response = await fetch(`${API_BASE_URL}/arena_challenge`, {
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

  // create a new challenge
  createChallenge: async (challengeData: ArenaChallengeRequest): Promise<ArenaChallenge> => {
    try {
      const response = await fetch(`${API_BASE_URL}/arena_challenge/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
};
