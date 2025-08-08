export interface Category {
  id: string;
  name: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  image_uri: string;
  category_id: string;
  created_by: string;
  ground_truth: string;
  status: "active" | "completed" | "upcoming";
  created_at: string;
  updated_at: string;
  category: Category;
  // Keep some legacy fields for backward compatibility
  name?: string;
  startDate?: string;
  endDate?: string;
  totalSubmissions?: number;
  maxSubmissionsPerTeam?: number;
  evaluationMetric?: string;
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
  file: File;
  model_name: string;
  challenge_id: string;
  description: string;
}

export interface ChallengeCreateRequest {
  title: string;
  category_id: string;
  image_uri: string;
  description: string;
  status: "active" | "completed" | "upcoming";
  ground_truth_file?: File;
}

export interface ChallengeUpdateRequest {
  title?: string;
  category_id?: string;
  image_uri?: string;
  description?: string;
  status?: "active" | "completed" | "upcoming";
  ground_truth_file?: File;
}

export interface CategoryCreateRequest {
  name: string;
}

export interface SubmissionResponse {
  id: string;
  user_id: string;
  model_name: string;
  challenge_id: string;
  description: string;
  file_path: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Model {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface SubmissionDetail {
  id: string;
  user_id: string;
  model_id: string;
  description: string;
  dataset_url: string;
  created_at: string;
  updated_at: string;
  model: Model;
}

export interface LeaderboardResult {
  id: string;
  type: "CER" | "WER" | "BLEU" | "ACCURACY" | string;
  user_id: string;
  submission_id: string;
  score: number;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  submission: SubmissionDetail;
}

export interface LeaderboardEntry {
  submission_id: string;
  model_name: string;
  user_id: string;
  description: string;
  created_at: string;
  metrics: {
    [key: string]: number; // CER, WER, etc.
  };
  rank?: number;
}

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
