// Arena API types
export interface ArenaChallenge {
    id: string;
    text: string;
    from_language: string;
    to_language: string;
    challenge_name: string;
  }
  
  export interface ArenaChallengeRequest {
    text: string;
    from_language: string;
    to_language: string;
    challenge_name: string;
  }
  
  export interface ArenaChallengeQuery {
    from_language: string;
    to_language: string;
    text: string;
    challenge_name: string;
  }

  export interface ArenaRanking {
    challenge_details: {
      challenge_name: string;
      text: string;
      from_language: string;
      to_language: string;
    };
    arena_ranking: Array<{
      template_name: string;
      model_name: string;
      elo_rating: number;
    }>;
  }