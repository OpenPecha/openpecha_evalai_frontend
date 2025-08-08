// User types for the application

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate: string;
  lastLoginDate?: string;
  isActive: boolean;
  emailVerified: boolean;
  role: "user" | "admin" | "moderator";
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
    challengeUpdates: boolean;
    submissionResults: boolean;
    leaderboardChanges: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showEmail: boolean;
    showStats: boolean;
  };
}

export interface UserStats {
  totalSubmissions: number;
  activeChallenges: number;
  completedChallenges: number;
  bestRanking: number | null;
  averageRanking: number | null;
  totalPoints: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedDate: string;
  category: "submission" | "ranking" | "challenge" | "special";
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate: string;
  stats: UserStats;
  recentSubmissions: UserSubmission[];
  achievements: Achievement[];
}

export interface UserSubmission {
  id: string;
  challengeId: string;
  challengeTitle: string;
  modelName: string;
  teamName: string;
  rank: number | null;
  score: number;
  submissionDate: string;
  status: "processing" | "evaluated" | "failed";
}

export interface UserUpdateRequest {
  name?: string;
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
}

export interface UserPreferencesUpdateRequest {
  theme?: "light" | "dark" | "system";
  notifications?: {
    email?: boolean;
    push?: boolean;
    challengeUpdates?: boolean;
    submissionResults?: boolean;
    leaderboardChanges?: boolean;
  };
  privacy?: {
    profileVisible?: boolean;
    showEmail?: boolean;
    showStats?: boolean;
  };
}

export interface UserSearchFilters {
  search?: string;
  role?: "user" | "admin" | "moderator";
  isActive?: boolean;
  sortBy?: "name" | "joinedDate" | "totalSubmissions" | "bestRanking";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface UserListItem {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  totalSubmissions: number;
  bestRanking: number | null;
  joinedDate: string;
  isActive: boolean;
}

export interface UserNotification {
  id: string;
  userId: string;
  type:
    | "challenge_update"
    | "submission_result"
    | "leaderboard_change"
    | "achievement"
    | "general";
  title: string;
  message: string;
  isRead: boolean;
  createdDate: string;
  actionUrl?: string;
}

// Removed UserActivity interface as it's not currently used in the API
// Can be added back when activity tracking is implemented
