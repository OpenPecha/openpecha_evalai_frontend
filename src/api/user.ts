import type { User, UserProfile, UserUpdateRequest } from "../types/user";
import type { ApiResponse } from "../types/challenge";

// Helper function to get access token (should be called from components with Auth0 context)
let getAccessTokenSilently: (() => Promise<string>) | null = null;

export const setAuthTokenGetter = (tokenGetter: () => Promise<string>) => {
  getAccessTokenSilently = tokenGetter;
};

// Helper function to get auth headers
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

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

// API Base URL
const API_BASE_URL =
  import.meta.env.VITE_SERVER_URL || "https://eval-api.pecha.tools";

// API functions
export const userApi = {
  // Get current user profile
  getCurrentUser: async (): Promise<ApiResponse<User | null>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          return {
            data: null,
            message: "Unauthorized - Please log in",
            success: false,
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const user: User = await response.json();

      return {
        data: user,
        message: "User profile fetched successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch user profile"
      );
    }
  },

  // Get user by ID (matches your backend endpoint)
  getUserProfile: async (
    userId: string
  ): Promise<ApiResponse<UserProfile | null>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            data: null,
            message: "User not found",
            success: false,
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userProfile: UserProfile = await response.json();

      return {
        data: userProfile,
        message: "User profile fetched successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return {
        data: null,
        message: "Failed to fetch user profile",
        success: false,
      };
    }
  },

  // Update current user (matches your backend endpoint)
  updateUserProfile: async (
    updates: UserUpdateRequest
  ): Promise<ApiResponse<User>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedUser: User = await response.json();

      return {
        data: updatedUser,
        message: "Profile updated successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  },

  // Create new user (matches your backend endpoint)
  createUser: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/users/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newUser: User = await response.json();

      return {
        data: newUser,
        message: "User created successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to create user"
      );
    }
  },

  // List all users (matches your backend endpoint)
  listUsers: async (): Promise<ApiResponse<User[]>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const users: User[] = await response.json();

      return {
        data: users,
        message: "Users fetched successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch users"
      );
    }
  },

  // Delete current user account
  deleteUserAccount: async (): Promise<ApiResponse<boolean>> => {
    try {
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        data: true,
        message: "Account deleted successfully",
        success: true,
      };
    } catch (error) {
      console.error("Error deleting user account:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to delete account"
      );
    }
  },
};
