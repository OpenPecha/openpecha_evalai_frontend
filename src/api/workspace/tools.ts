import { getAuthHeaders } from "@/lib/auth";


const server_url = import.meta.env.VITE_SERVER_URL;

export const fetchTools = async () => {
  const getHeaders= await getAuthHeaders("json");
  try {
    const url = server_url+"/workspace/tools";
    const response = await fetch(
      url,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          ...getHeaders,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tools: ${response.statusText}`);
    }
    const data=await response.json()

      // Remove "coming soon" tools
      if (data?.data) {
        return data.data.filter(
          (l) => !l.name?.trim().toLowerCase().includes("coming soon")
        );
      }
    return [];
  } catch (error) {
    console.error("Error fetching tools:", error);
    throw error;
  }
};
