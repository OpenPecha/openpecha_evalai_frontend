// API Base URL
const API_BASE_URL = import.meta.env.VITE_SERVER_URL || "https://eval-api.pecha.tools";

// Types for tools API
export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number | null;
  link: string;
  demo: string;
  icon: string;
}

export interface ToolsResponse {
  success: boolean;
  data: Tool[];
  count: number;
}

/**
 * Get the list of available tools from Pecha Studio
 * Public endpoint, no authentication required
 */
export async function getTools(): Promise<ToolsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/tools/`, {
      method: "GET",
      headers: {
        "accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ToolsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching tools:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch tools"
    );
  }
}

// Export the tools API object for consistency with other API modules
export const toolsApi = {
  getTools,
};
