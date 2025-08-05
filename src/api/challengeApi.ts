import type {
  Challenge,
  Submission,
  SubmissionRequest,
  ApiResponse,
  PaginatedResponse,
} from "../types/challenge";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_SERVER_URL;

// Mock submissions data (keeping for now until submission endpoints are available)
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

  // Get leaderboard for a challenge
  getLeaderboard: async (
    challengeId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Submission>> => {
    const submissions = mockSubmissions[challengeId] || [];

    // Sort by rank
    const sortedSubmissions = [...submissions].sort((a, b) => a.rank - b.rank);

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = sortedSubmissions.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: submissions.length,
        totalPages: Math.ceil(submissions.length / limit),
      },
      message: "Leaderboard fetched successfully",
      success: true,
    };
  },

  // Submit to challenge
  submitToChallenge: async (
    submission: SubmissionRequest
  ): Promise<ApiResponse<Submission>> => {
    // Simulate file upload and processing

    // Simulate random success/failure for demo
    const success = Math.random() > 0.1; // 90% success rate

    if (!success) {
      throw new Error(
        "Submission failed. Please check your file format and try again."
      );
    }

    // Create mock submission
    const newSubmission: Submission = {
      id: Date.now().toString(),
      challengeId: submission.challengeId,
      modelName: submission.modelName,
      teamName: submission.teamName,
      cer: Math.random() * 0.2, // Random CER between 0-0.2
      accuracy: 0.8 + Math.random() * 0.2, // Random accuracy between 0.8-1.0
      f1Score: 0.8 + Math.random() * 0.2, // Random F1 between 0.8-1.0
      submissionDate: new Date().toISOString(),
      rank: 0, // Will be calculated server-side
      status: "processing",
      fileName: submission.file.name,
      fileSize: submission.file.size,
    };

    return {
      data: newSubmission,
      message: "Submission successful! Your results are being processed.",
      success: true,
    };
  },

  // Get user's submissions for a challenge
  getUserSubmissions: async (
    challengeId: string,
    teamName?: string
  ): Promise<ApiResponse<Submission[]>> => {
    const submissions = mockSubmissions[challengeId] || [];

    const filteredSubmissions = teamName
      ? submissions.filter((s) => s.teamName === teamName)
      : submissions;

    return {
      data: filteredSubmissions,
      message: "User submissions fetched successfully",
      success: true,
    };
  },

  // Get submission by ID
  getSubmissionById: async (
    id: string
  ): Promise<ApiResponse<Submission | null>> => {
    // Search through all submissions
    for (const challengeSubmissions of Object.values(mockSubmissions)) {
      const submission = challengeSubmissions.find((s) => s.id === id);
      if (submission) {
        return {
          data: submission,
          message: "Submission found",
          success: true,
        };
      }
    }

    return {
      data: null,
      message: "Submission not found",
      success: false,
    };
  },
};
