import type { CreateTemplateV2, PromptTemplate } from "@/types/template";

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || "https://eval-api.pecha.tools";

export async function getPromptTemplates(username: string, challenge_id: string): Promise<PromptTemplate[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/template_v2/user/${username}?challenge_id=${challenge_id}`, {
            method: 'GET',
            headers: {
              'accept': 'application/json'
            }
          });
        const data = await res.json();
        return data;
    } catch (error) {
      console.error("Error fetching prompt templates:", error);
      throw error;
    }
  }
  
  export async function getAllPromptTemplates(): Promise<PromptTemplate[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/templates`, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching all prompt templates:", error);
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
    console.log("Creating template v2:", body);
    const res = await fetch(`${API_BASE_URL}/template_v2/create`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  
    if (!res.ok) {
      const errorText = await res.text().catch(() => res.statusText);
      throw new Error(`Failed to create template v2: ${res.status} ${errorText}`);
    }
  
    return res.json();
  }
  