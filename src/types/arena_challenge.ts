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