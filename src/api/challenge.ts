import type {
  Challenge,
  Category,
  Submission,
  UserSubmission,
  SubmissionRequest,
  SubmissionResponse,
  LeaderboardResult,
  LeaderboardEntry,
  ChallengeCreateRequest,
  ChallengeUpdateRequest,
  CategoryCreateRequest,
  ApiResponse,
  PaginatedResponse,
} from "../types/challenge";

// API Base URL
const API_BASE_URL =
  import.meta.env.VITE_SERVER_URL || "https://eval-api.pecha.tools";

// Helper function to get access token (should be set by AuthWrapper)
let getAccessTokenSilently: (() => Promise<string>) | null = null;

export const setAuthTokenGetter = (tokenGetter: () => Promise<string>) => {
  getAccessTokenSilently = tokenGetter;
};

// Helper function to get auth headers
const getAuthHeaders = async (
  contentType: "json" | "multipart" = "json"
): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {};

  // Only set Content-Type for JSON requests, FormData will set it automatically for multipart
  if (contentType === "json") {
    headers["Content-Type"] = "application/json";
  }

  if (getAccessTokenSilently) {
    try {
      const token = await getAccessTokenSilently();
      headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.warn("Failed to get access token:", error);
    }
  }

  return headers;
};

// Mock submissions data (keeping for now until submission endpoints are available)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockSubmissions: { [key: string]: Submission[] } = {
  "8caa7bc5-b688-4f0d-9721-9ad2d994e213": [
    {
      id: "1",
      challengeId: "8caa7bc5-b688-4f0d-9721-9ad2d994e213",
      modelName: "TibetanOCR-v2.1",
      teamName: "Team Alpha",
      cer: 0.045,
      accuracy: 0.955,
      f1Score: 0.962,
      submissionDate: "2024-01-15T10:30:00Z",
      rank: 1,
      status: "evaluated",
      fileName: "ocr_results_v2.json",
      fileSize: 2048,
    },
  ],
};

// API functions
export const challengeApi = {
  // Get all challenges
  getChallenges: async (): Promise<ApiResponse<Challenge[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/list`, {
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Challenge[] = await response.json();

      return {
        data,
        message: "Challenges fetched successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error fetching challenges:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch challenges"
      );
    }
  },

  // Get challenge by ID
  getChallengeById: async (
    id: string
  ): Promise<ApiResponse<Challenge | null>> => {
    try {
      // First get all challenges, then find the specific one
      // (assuming there's no direct endpoint for single challenge)
      const response = await fetch(`${API_BASE_URL}/challenges/list`, {
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const challenges: Challenge[] = await response.json();
      const challenge = challenges.find((c) => c.id === id);

      return {
        data: challenge || null,
        message: challenge ? "Challenge found" : "Challenge not found",
        success: !!challenge,
      };
    } catch (error) {
      console.error("Error fetching challenge:", error);
      return {
        data: null,
        message: "Failed to fetch challenge",
        success: false,
      };
    }
  },

  // Get current user's submissions
  getUserSubmissions: async (): Promise<ApiResponse<UserSubmission[]>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/submissions/my`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const submissions: UserSubmission[] = await response.json();

      return {
        data: submissions,
        message: "User submissions fetched successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error fetching user submissions:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch user submissions"
      );
    }
  },

  // Get leaderboard for a challenge using the new endpoint
  getLeaderboard: async (
    challengeId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<LeaderboardEntry>> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/results/challenge/${challengeId}`,
        {
          headers: {
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const challengeResults: LeaderboardResult[] = await response.json();

      // Group results by submission_id
      const submissionGroups: { [key: string]: LeaderboardResult[] } = {};
      challengeResults.forEach((result) => {
        const submissionId = result.submission_id;
        if (!submissionGroups[submissionId]) {
          submissionGroups[submissionId] = [];
        }
        submissionGroups[submissionId].push(result);
      });

      // Convert to LeaderboardEntry format
      const leaderboardEntries: LeaderboardEntry[] = Object.values(
        submissionGroups
      ).map((results) => {
        const firstResult = results[0];
        const submission = firstResult.submission;

        // Aggregate metrics for this submission
        const metrics: { [key: string]: number } = {};
        results.forEach((result) => {
          metrics[result.type] = result.score;
        });

        return {
          submission_id: submission.id,
          model_name: submission.model.name,
          user_id: submission.user_id,
          description: submission.description,
          created_at: submission.created_at,
          metrics,
        };
      });

      // Sort by primary metric (CER if available, otherwise first metric)
      const sortedEntries = [...leaderboardEntries].sort(
        (a: LeaderboardEntry, b: LeaderboardEntry) => {
          const aScore =
            a.metrics.CER ?? a.metrics[Object.keys(a.metrics)[0]] ?? Infinity;
          const bScore =
            b.metrics.CER ?? b.metrics[Object.keys(b.metrics)[0]] ?? Infinity;
          return aScore - bScore; // Lower is better for CER
        }
      );

      // Add rank
      sortedEntries.forEach((entry: LeaderboardEntry, index: number) => {
        entry.rank = index + 1;
      });

      // Paginate
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = sortedEntries.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        pagination: {
          page,
          limit,
          total: sortedEntries.length,
          totalPages: Math.ceil(sortedEntries.length / limit),
        },
        message: "Leaderboard fetched successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      // Fallback to empty result
      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
        message: "Failed to fetch leaderboard",
        success: false,
      };
    }
  },

  // Submit to challenge
  submitToChallenge: async (
    submission: SubmissionRequest
  ): Promise<ApiResponse<SubmissionResponse>> => {
    try {
      const formData = new FormData();

      // Add all fields to FormData
      formData.append("file", submission.file);
      formData.append("model_name", submission.model_name);
      formData.append("challenge_id", submission.challenge_id);
      formData.append("description", submission.description);

      // Get headers without Content-Type (let browser set it for FormData)
      const headers: Record<string, string> = {};

      if (getAccessTokenSilently) {
        try {
          const token = await getAccessTokenSilently();
          headers.Authorization = `Bearer ${token}`;
        } catch (error) {
          console.warn("Failed to get access token:", error);
        }
      }

      const response = await fetch(
        `${API_BASE_URL}/submissions/create-submission`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        // Try to parse error response body for detailed error message
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.detail && typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (errorData.message && typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // If parsing fails, keep the generic error message
          console.warn("Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      return {
        data: result,
        message: "Submission successful! Your results are being processed.",
        success: true,
      };
    } catch (error) {
      console.error("Error submitting to challenge:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to submit to challenge"
      );
    }
  },

  // Get all categories
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const categories: Category[] = await response.json();

      return {
        data: categories,
        message: "Categories fetched successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch categories"
      );
    }
  },

  // Create new category
  createCategory: async (
    categoryData: CategoryCreateRequest
  ): Promise<ApiResponse<Category>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/categories/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        // Try to parse error response body for detailed error message
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.detail && typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (errorData.message && typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // If parsing fails, keep the generic error message
          console.warn("Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const newCategory: Category = await response.json();

      return {
        data: newCategory,
        message: "Category created successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error creating category:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to create category"
      );
    }
  },

  // Create new challenge
  createChallenge: async (
    challengeData: ChallengeCreateRequest
  ): Promise<ApiResponse<Challenge>> => {
    try {
      const formData = new FormData();

      // Add all fields to FormData
      formData.append("title", challengeData.title);
      formData.append("category_id", challengeData.category_id);
      formData.append("image_uri", challengeData.image_uri);
      formData.append("description", challengeData.description);
      formData.append("status", challengeData.status);

      // Add ground truth file if provided
      if (challengeData.ground_truth_file) {
        formData.append("ground_truth_file", challengeData.ground_truth_file);
      }

      // Get headers without Content-Type (let browser set it for FormData)
      const headers: Record<string, string> = {};

      if (getAccessTokenSilently) {
        try {
          const token = await getAccessTokenSilently();
          headers.Authorization = `Bearer ${token}`;
        } catch (error) {
          console.warn("Failed to get access token:", error);
        }
      }

      const response = await fetch(`${API_BASE_URL}/challenges/create`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        // Try to parse error response body for detailed error message
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.detail && typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          } else if (errorData.message && typeof errorData.message === 'string') {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // If parsing fails, keep the generic error message
          console.warn("Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const newChallenge: Challenge = await response.json();

      return {
        data: newChallenge,
        message: "Challenge created successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error creating challenge:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to create challenge"
      );
    }
  },

  // Get all submissions
  getAllSubmissions: async (): Promise<ApiResponse<SubmissionResponse[]>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/submissions`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const submissions = await response.json();

      return {
        data: submissions,
        message: "Submissions fetched successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error fetching submissions:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch submissions"
      );
    }
  },

  // Get my submissions
  getMySubmissions: async (): Promise<ApiResponse<SubmissionResponse[]>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/submissions/my`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const submissions = await response.json();

      return {
        data: submissions,
        message: "My submissions fetched successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error fetching my submissions:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch my submissions"
      );
    }
  },

  // Get submission by ID
  getSubmissionById: async (
    submissionId: string
  ): Promise<ApiResponse<SubmissionResponse>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/submissions/${submissionId}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const submission = await response.json();

      return {
        data: submission,
        message: "Submission fetched successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error fetching submission:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch submission"
      );
    }
  },

  // Delete submission by ID
  deleteSubmission: async (
    submissionId: string
  ): Promise<ApiResponse<boolean>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/submissions/${submissionId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        data: true,
        message: "Submission deleted successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error deleting submission:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to delete submission"
      );
    }
  },

  // Get leaderboard results (deprecated - use individual challenge endpoints)
  getLeaderboardResults: async (): Promise<
    ApiResponse<LeaderboardResult[]>
  > => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/results/leaderboard`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();

      return {
        data: results,
        message: "Leaderboard results fetched successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error fetching leaderboard results:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch leaderboard results"
      );
    }
  },

  // Get all leaderboard data and process it for display (deprecated - use individual challenge endpoints)
  getAllLeaderboards: async (): Promise<
    ApiResponse<{ [challengeId: string]: LeaderboardEntry[] }>
  > => {
    console.warn(
      "getAllLeaderboards is deprecated. Use individual challenge endpoints via useAllLeaderboards hook instead."
    );

    // Return empty data to avoid breaking existing code
    return {
      data: {},
      message: "Function deprecated - use individual challenge endpoints",
      success: false,
    };
  },

  // Update challenge
  updateChallenge: async (
    challengeId: string,
    updateData: ChallengeUpdateRequest
  ): Promise<ApiResponse<Challenge>> => {
    try {
      const headers = await getAuthHeaders("multipart");

      // Create FormData for multipart upload
      const formData = new FormData();

      // Only append fields that are provided
      if (updateData.title !== undefined) {
        formData.append("title", updateData.title);
      }
      if (updateData.category_id !== undefined) {
        formData.append("category_id", updateData.category_id);
      }
      if (updateData.image_uri !== undefined) {
        formData.append("image_uri", updateData.image_uri);
      }
      if (updateData.description !== undefined) {
        formData.append("description", updateData.description);
      }
      if (updateData.status !== undefined) {
        formData.append("status", updateData.status);
      }
      if (updateData.ground_truth_file) {
        formData.append("ground_truth_file", updateData.ground_truth_file);
      }

      const response = await fetch(
        `${API_BASE_URL}/challenges/update/${challengeId}`,
        {
          method: "PATCH",
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedChallenge: Challenge = await response.json();

      return {
        data: updatedChallenge,
        message: "Challenge updated successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error updating challenge:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to update challenge"
      );
    }
  },

  // Delete challenge
  deleteChallenge: async (
    challengeId: string
  ): Promise<ApiResponse<boolean>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE_URL}/challenges/remove/${challengeId}`,
        {
          method: "DELETE",
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        data: true,
        message: "Challenge deleted successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error deleting challenge:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to delete challenge"
      );
    }
  },
};
