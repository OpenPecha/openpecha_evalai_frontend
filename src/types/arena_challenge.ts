// Arena API types
export interface ArenaChallenge {
    id: string;
    text_category: string;
    from_language: string;
    to_language: string;
    challenge_name: string;
  }
  
  export interface ArenaChallengeRequest {
    text_category_id: string;
    from_language: string;
    to_language: string;
    challenge_name: string;
  }
  
  export interface ArenaChallengeQuery {
    from_language: string;
    to_language: string;
    text_category_id: string;
    challenge_name: string;
  }

  export interface ArenaRanking {
    challenge_details: {
      challenge_id: string;
      challenge_name: string;
      text_category: string;
      from_language: string;
      to_language: string;
    };
    arena_ranking: Array<{
      template_name: string;
      model_name: string;
      elo_rating: number;
    }>;
  }