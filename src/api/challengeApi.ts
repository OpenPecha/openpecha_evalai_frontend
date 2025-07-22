import type {
  Challenge,
  Submission,
  SubmissionRequest,
  ApiResponse,
  PaginatedResponse,
} from "../types/challenge";

// Mock data
const mockChallenges: Challenge[] = [
  {
    id: "ocr-tibetan",
    name: "Tibetan OCR Challenge",
    description:
      "Optical Character Recognition for Tibetan texts using traditional manuscripts and printed documents",
    category: "OCR",
    status: "active",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    totalSubmissions: 15,
    maxSubmissionsPerTeam: 5,
    evaluationMetric: "Character Error Rate (CER)",
  },
  {
    id: "nlp-sentiment",
    name: "Sentiment Analysis Challenge",
    description:
      "Analyze sentiment in Tibetan and English texts from social media and literature",
    category: "NLP",
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-04-15",
    totalSubmissions: 8,
    maxSubmissionsPerTeam: 3,
    evaluationMetric: "F1 Score",
  },
  {
    id: "translation-en-bo",
    name: "English-Tibetan Translation",
    description:
      "Machine translation between English and Tibetan for various domains including literature and technical texts",
    category: "Translation",
    status: "active",
    startDate: "2024-02-01",
    endDate: "2024-05-01",
    totalSubmissions: 3,
    maxSubmissionsPerTeam: 2,
    evaluationMetric: "BLEU Score",
  },
  {
    id: "text-classification",
    name: "Text Classification Challenge",
    description:
      "Classify Tibetan texts into predefined categories including religious, historical, and contemporary topics",
    category: "Classification",
    status: "upcoming",
    startDate: "2024-03-01",
    endDate: "2024-06-01",
    totalSubmissions: 0,
    maxSubmissionsPerTeam: 4,
    evaluationMetric: "Accuracy",
  },
  {
    id: "ner-tibetan",
    name: "Named Entity Recognition",
    description:
      "Identify and classify named entities in Tibetan texts including persons, places, and organizations",
    category: "NLP",
    status: "upcoming",
    startDate: "2024-03-15",
    endDate: "2024-06-15",
    totalSubmissions: 0,
    maxSubmissionsPerTeam: 3,
    evaluationMetric: "F1 Score",
  },
];

const mockSubmissions: { [key: string]: Submission[] } = {
  "ocr-tibetan": [
    {
      id: "1",
      challengeId: "ocr-tibetan",
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
    {
      id: "2",
      challengeId: "ocr-tibetan",
      modelName: "DeepTibetan",
      teamName: "Team Beta",
      cer: 0.052,
      accuracy: 0.948,
      f1Score: 0.951,
      submissionDate: "2024-01-14T15:45:00Z",
      rank: 2,
      status: "evaluated",
      fileName: "deep_tibetan_results.json",
      fileSize: 1856,
    },
    {
      id: "3",
      challengeId: "ocr-tibetan",
      modelName: "OCR-Master",
      teamName: "Team Gamma",
      cer: 0.061,
      accuracy: 0.939,
      f1Score: 0.943,
      submissionDate: "2024-01-13T09:20:00Z",
      rank: 3,
      status: "evaluated",
      fileName: "ocr_master_output.json",
      fileSize: 2234,
    },
    {
      id: "4",
      challengeId: "ocr-tibetan",
      modelName: "TextReader-Pro",
      teamName: "Team Delta",
      cer: 0.078,
      accuracy: 0.922,
      f1Score: 0.928,
      submissionDate: "2024-01-12T14:10:00Z",
      rank: 4,
      status: "evaluated",
      fileName: "textreader_results.json",
      fileSize: 1923,
    },
    {
      id: "5",
      challengeId: "ocr-tibetan",
      modelName: "Vision-Tibetan",
      teamName: "Team Epsilon",
      cer: 0.089,
      accuracy: 0.911,
      f1Score: 0.917,
      submissionDate: "2024-01-16T11:30:00Z",
      rank: 5,
      status: "processing",
      fileName: "vision_tibetan_v1.json",
      fileSize: 2156,
    },
  ],
  "nlp-sentiment": [
    {
      id: "6",
      challengeId: "nlp-sentiment",
      modelName: "SentiBERT-Ti",
      teamName: "NLP Masters",
      cer: 0.089,
      accuracy: 0.911,
      f1Score: 0.918,
      submissionDate: "2024-01-16T08:20:00Z",
      rank: 1,
      status: "evaluated",
      fileName: "sentibert_results.json",
      fileSize: 1567,
    },
    {
      id: "7",
      challengeId: "nlp-sentiment",
      modelName: "EmotionAI",
      teamName: "Sentiment Squad",
      cer: 0.095,
      accuracy: 0.905,
      f1Score: 0.912,
      submissionDate: "2024-01-15T16:45:00Z",
      rank: 2,
      status: "evaluated",
      fileName: "emotion_ai_output.json",
      fileSize: 1345,
    },
  ],
  "translation-en-bo": [
    {
      id: "8",
      challengeId: "translation-en-bo",
      modelName: "TransTibetan-v3",
      teamName: "Translators Inc",
      cer: 0.123,
      accuracy: 0.877,
      f1Score: 0.884,
      submissionDate: "2024-01-17T12:15:00Z",
      rank: 1,
      status: "evaluated",
      fileName: "trans_tibetan_results.json",
      fileSize: 3456,
    },
  ],
};

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API functions
export const challengeApi = {
  // Get all challenges
  getChallenges: async (): Promise<ApiResponse<Challenge[]>> => {
    await delay(800);
    return {
      data: mockChallenges,
      message: "Challenges fetched successfully",
      success: true,
    };
  },

  // Get challenge by ID
  getChallengeById: async (
    id: string
  ): Promise<ApiResponse<Challenge | null>> => {
    await delay(500);
    const challenge = mockChallenges.find((c) => c.id === id);
    return {
      data: challenge || null,
      message: challenge ? "Challenge found" : "Challenge not found",
      success: !!challenge,
    };
  },

  // Get leaderboard for a challenge
  getLeaderboard: async (
    challengeId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Submission>> => {
    await delay(600);
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
    await delay(2000); // Simulate file upload and processing

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
    await delay(400);
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
    await delay(300);

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
