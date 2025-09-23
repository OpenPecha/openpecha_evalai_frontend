export interface PromptTemplate {
    id: string;
    template_name: string;
    username: string;
    template: string;
    text: string;
    from_language: string;
    to_language: string;
    created_at: string;
    updated_at: string;
    template_text?: string; // Keep for backward compatibility
    template_score?: number; // Keep for backward compatibility
  }
  
  export type CreateTemplateV2 = {
    template_name: string;
    username: string;
    template: string;
    challenge_id: string;
  };