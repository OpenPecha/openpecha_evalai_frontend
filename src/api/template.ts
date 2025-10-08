import type { CreateTemplateV2, TemplateResponse } from "@/types/template";
import { getAuthHeaders } from "../lib/auth";
import { removeEmojisFromContent } from "../utils/emojiUtils";

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || "https://eval-api.pecha.tools";

export async function getAllTemplates(challenge_id: string, page: number, creator_id?: string): Promise<TemplateResponse> {
  try {
    const headers = await getAuthHeaders("json");
    const params = new URLSearchParams({
      challenge_id,
      page_number: page.toString()
    });
    
    if (creator_id) {
      params.append('creator_id', creator_id);
    }
    const response = await fetch(`${API_BASE_URL}/arena/template?${params.toString()}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all templates:", error);
    throw error;
  }
}


  // GET: single template by ID
export async function getPromptTemplate(id: string): Promise<any> {
  try {
    const headers = await getAuthHeaders("json");
    const res = await fetch(`${API_BASE_URL}/arena/template/${id}`, {
      method: 'GET',
      headers,
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching prompt template:", error);
    throw error;
  }
}



// POST: create new template v2
  export async function createPromptTemplate(body: CreateTemplateV2) {
    try {
      const headers = await getAuthHeaders("json");
      
      // Ensure template content is clean (no emojis) before sending to backend
      const cleanBody = {
        ...body,
        template: removeEmojisFromContent(body.template)
      };
      
      const res = await fetch(`${API_BASE_URL}/arena/template/`, {
        method: "POST",
        headers,
        body: JSON.stringify(cleanBody),
      });
    
      if (!res.ok) {
        const errorText = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to create template v2: ${res.status} ${errorText}`);
      }
    
      const data = await res.json();
      return data;
  } catch (error) {
    console.error("Error creating prompt template v2:", error);
    throw error;
    }
  }
// PUT: update template v2
export async function updateTemplate(id: string, body: CreateTemplateV2): Promise<any> {
  try {
    const headers = await getAuthHeaders("json");
    
    // Ensure template content is clean (no emojis) before sending to backend
    const cleanBody = {
      ...body,
      template: removeEmojisFromContent(body.template)
    };
    
    const res = await fetch(`${API_BASE_URL}/arena/template/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(cleanBody),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      throw new Error(`Failed to update template: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error updating template:", error);
    throw error;
  }
}


// DELETE: delete template v2
export async function deleteTemplate(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders("json");
    const res = await fetch(`${API_BASE_URL}/arena/template/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      throw new Error(`Failed to delete template: ${res.status} ${errorText}`);
    }
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
}

