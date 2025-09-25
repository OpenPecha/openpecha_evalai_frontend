import type { CreateTemplateV2, PromptTemplate, TemplateResponse } from "@/types/template";
import { getAuthHeaders } from "../lib/auth";

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || "https://eval-api.pecha.tools";

export async function getAllTemplates(challenge_id: string, page:number): Promise<TemplateResponse> {
    try {
        const res = await fetch(`${API_BASE_URL}/template_v2/all?challenge_id=${challenge_id}&page_number=${page}`, {
            method: 'GET',
            headers: {
              'accept': 'application/json'
            }
          });
        const data = await res.json();
        console.log("template data ::: ", data);
        return data;
    } catch (error) {
      console.error("Error fetching all templates:", error);
      throw error;
    }
  }


  // GET: single template by ID
export async function getPromptTemplate(id: string): Promise<PromptTemplate> {
  try {
    const res = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    const data = await res.json();
    return data;
    // For now, return mock data
    
  } catch (error) {
    console.error("Error fetching prompt template:", error);
    throw error;
  }
}

// POST: create new template
export async function createPromptTemplate(
    username: string,
    templateName: string,
    promptText: string
  ): Promise<PromptTemplate> {
    console.log('Creating template for user:', username);
    console.log('Template name:', templateName);
    console.log('Prompt text:', promptText);
    try {
      const res = await fetch(`${API_BASE_URL}/templates/create`, {
        method: 'POST',
        headers: {
          "Content-Type": 'application/json'
        },
        body: JSON.stringify({
          template_name: templateName,
          username: username,
          template_text: promptText
        })
      });
  
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error creating prompt template:", error);
      throw error;
    }
  }


// POST: create new template v2
  export async function createPromptTemplateV2(body: CreateTemplateV2) {
    try {
      const headers = await getAuthHeaders("json");
      const res = await fetch(`${API_BASE_URL}/template_v2/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
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

// DELETE: delete template v2
export async function deleteTemplate(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders("json");
    const res = await fetch(`${API_BASE_URL}/template_v2/delete/${id}`, {
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

