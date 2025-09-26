export interface UserDetail {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  picture: string;
  role: string;
}

export interface TemplateDetail {
  id: string;
  template_name: string;
  user_id: string;
  template: string;
  challenge_id: string;
  text_category: string;
  challenge_name: string;
  from_language: string;
  to_language: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}


export interface TemplateResponse {
  total_count: number;
  items: TemplateDetail[];
}

export interface Template {
    id: string;
    template_name: string;
    username: string;
    template: string;
    text_category: string;
    from_language: string;
    to_language: string;
    created_at: string;
    updated_at: string;
    template_text?: string; // Keep for backward compatibility
    template_score?: number; // Keep for backward compatibility
  }
  
  export type CreateTemplateV2 = {
    id?: string; // Optional for create operations, required for update operations
    template_name: string;
    template: string;
    challenge_id: string;
  };