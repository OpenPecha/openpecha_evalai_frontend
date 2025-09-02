import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Upload, X, Check, AlertCircle } from "lucide-react";
import { useCurrentUser } from "../hooks/useUsers";
import {
  useCategories,
  useCreateChallenge,
  useCreateCategory,
} from "../hooks/useChallenges";
import type { ChallengeCreateRequest } from "../types/challenge";

const CreateChallenge = () => {
  const navigate = useNavigate();
  const { data: currentUserData } = useCurrentUser();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  const createChallengeMutation = useCreateChallenge();
  const createCategoryMutation = useCreateCategory();
  const [formData, setFormData] = useState<ChallengeCreateRequest>({
    title: "",
    category_id: "",
    image_uri: "",
    description: "",
    status: "upcoming",
    ground_truth_file: undefined,
  });

  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [challengeError, setChallengeError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const user = currentUserData?.data;
  const categories = categoriesData?.data || [];

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
            Access Denied
          </h1>
          <p className="text-red-700 dark:text-red-300">
            You need admin privileges to create challenges.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (challengeError) setChallengeError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData((prev) => ({ ...prev, ground_truth_file: file }));
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setCategoryError(""); // Clear previous errors

    try {
      const result = await createCategoryMutation.mutateAsync({
        name: newCategoryName.trim(),
      });

      // Select the newly created category
      setFormData((prev) => ({ ...prev, category_id: result.data.id }));
      setNewCategoryName("");
      setShowNewCategoryForm(false);
    } catch (error) {
      let errorMessage = "Failed to create category. Please try again.";
      
      // Extract error message from different error formats
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle API response errors with detail property
        if ('detail' in error && typeof error.detail === 'string') {
          errorMessage = error.detail;
        } else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      
      setCategoryError(errorMessage);
      console.error("Failed to create category:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category_id || !formData.description) {
      setChallengeError("Please fill in all required fields");
      return;
    }

    setChallengeError(""); // Clear previous errors

    try {
      await createChallengeMutation.mutateAsync(formData);
      navigate("/"); // Redirect to home page after successful creation
    } catch (error) {
      let errorMessage = "Failed to create challenge. Please try again.";
      
      // Extract error message from different error formats
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle API response errors with detail property
        if ('detail' in error && typeof error.detail === 'string') {
          errorMessage = error.detail;
        } else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      
      setChallengeError(errorMessage);
      console.error("Failed to create challenge:", error);
    }
  };
  const removeFile = () => {
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, ground_truth_file: undefined }));
  };

  if (categoriesLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="bg-neutral-200 dark:bg-neutral-700 h-8 w-48 mb-6"></div>
          <div className="space-y-4">
            <div className="bg-neutral-200 dark:bg-neutral-700 h-12 w-full"></div>
            <div className="bg-neutral-200 dark:bg-neutral-700 h-12 w-full"></div>
            <div className="bg-neutral-200 dark:bg-neutral-700 h-32 w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Create New Challenge
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Create a new challenge for participants to compete in
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              Challenge Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter challenge title"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              Category *
            </label>
            <div className="flex space-x-2">
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* New Category Form */}
            {showNewCategoryForm && (
              <div className="mt-3 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => {
                      setNewCategoryName(e.target.value);
                      if (categoryError) setCategoryError("");
                    }}
                    placeholder="New category name"
                    className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={
                      createCategoryMutation.isPending ||
                      !newCategoryName.trim()
                    }
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-neutral-400 transition-colors flex items-center"
                  >
                    {createCategoryMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategoryForm(false);
                      setNewCategoryName("");
                    }}
                    className="px-3 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors flex items-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Category Creation Error */}
                {categoryError && (
                  <div className="mt-2 flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                    <p className="text-sm text-red-800 dark:text-red-400">{categoryError}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Image URI */}
          <div>
            <label
              htmlFor="image_uri"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              Challenge Image URL
            </label>
            <input
              type="url"
              id="image_uri"
              name="image_uri"
              value={formData.image_uri}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the challenge objectives, rules, and evaluation criteria"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Ground Truth File */}
          <div>
            <label
              htmlFor="ground_truth_file"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              Ground Truth File (Optional)
            </label>

            {selectedFile ? (
              <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg border border-neutral-300 dark:border-neutral-600">
                <div className="flex items-center space-x-3">
                  <Upload className="w-5 h-5 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="ground_truth_file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".json,.txt,.csv"
                />
                <label
                  htmlFor="ground_truth_file"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Click to upload ground truth file
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                    JSON, TXT, or CSV files only
                  </p>
                </label>
              </div>
            )}
          </div>
          {/* Challenge Creation Error */}
          {challengeError && (
            <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-800 dark:text-red-400">{challengeError}</p>
            </div>
          )}
          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createChallengeMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {createChallengeMutation.isPending && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>
                {createChallengeMutation.isPending
                  ? "Creating..."
                  : "Create Challenge"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChallenge;
