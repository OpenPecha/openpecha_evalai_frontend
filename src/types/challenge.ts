export interface Challenge {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "active" | "completed" | "upcoming";
  startDate: string;
  endDate: string;
  totalSubmissions: number;
  maxSubmissionsPerTeam: number;
  evaluationMetric: string;
}

export interface Submission {
  id: string;
  challengeId: string;
  modelName: string;
  teamName: string;
  cer: number;
  accuracy?: number;
  f1Score?: number;
  submissionDate: string;
  rank: number;
  status: "processing" | "evaluated" | "failed";
  fileName: string;
  fileSize: number;
}

export interface SubmissionRequest {
  challengeId: string;
  modelName: string;
  teamName: string;
  description?: string;
  file: File;
}

export type LeaderboardEntry = Submission;

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}
