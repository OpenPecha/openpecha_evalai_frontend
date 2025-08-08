import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Trash2, AlertTriangle } from "lucide-react";
import { useCurrentUser } from "../hooks/useUsers";
import {
  useCategories,
  useChallenge,
  useUpdateChallenge,
  useDeleteChallenge,
} from "../hooks/useChallenges";
import type { ChallengeUpdateRequest } from "../types/challenge";

const EditChallenge = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { data: currentUserData } = useCurrentUser();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  const { data: challengeData, isLoading: challengeLoading } = useChallenge(
    challengeId || ""
  );
  const updateChallengeMutation = useUpdateChallenge();
  const deleteChallengeMutation = useDeleteChallenge();

  const [formData, setFormData] = useState<ChallengeUpdateRequest>({
    title: "",
    category_id: "",
    image_uri: "",
    description: "",
    status: "upcoming",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const user = currentUserData?.data;
  const categories = categoriesData?.data || [];
  const challenge = challengeData?.data;

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Populate form when challenge data loads
  useEffect(() => {
    if (challenge) {
      setFormData({
        title: challenge.title,
        category_id: challenge.category_id,
        image_uri: challenge.image_uri || "",
        description: challenge.description,
        status: challenge.status,
      });
    }
  }, [challenge]);

  // Track changes
  useEffect(() => {
    if (challenge) {
      const hasFormChanges =
        formData.title !== challenge.title ||
        formData.category_id !== challenge.category_id ||
        formData.image_uri !== (challenge.image_uri || "") ||
        formData.description !== challenge.description ||
        formData.status !== challenge.status;
      setHasChanges(hasFormChanges);
    }
  }, [formData, challenge]);

  if (!challengeId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
            Invalid Challenge
          </h1>
          <p className="text-red-700 dark:text-red-300">
            No challenge ID provided.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
            Access Denied
          </h1>
          <p className="text-red-700 dark:text-red-300">
            You need admin privileges to edit challenges.
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category_id || !formData.description) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await updateChallengeMutation.mutateAsync({
        challengeId,
        updateData: formData,
      });
      navigate(`/leaderboard/${challengeId}`); // Redirect to challenge leaderboard
    } catch (error) {
      console.error("Failed to update challenge:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteChallengeMutation.mutateAsync(challengeId);
      navigate("/"); // Redirect to home after deletion
    } catch (error) {
      console.error("Failed to delete challenge:", error);
    }
  };

  if (challengeLoading || categoriesLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 h-8 w-48 mb-6"></div>
          <div className="space-y-4">
            <div className="bg-gray-200 dark:bg-gray-700 h-12 w-full"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-12 w-full"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-32 w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
            Challenge Not Found
          </h1>
          <p className="text-red-700 dark:text-red-300">
            The challenge you're trying to edit doesn't exist.
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/leaderboard/${challengeId}`}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Challenge
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Edit Challenge
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update challenge information (excluding the ground truth file)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Challenge Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter challenge title"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Category *
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Image URI */}
          <div>
            <label
              htmlFor="image_uri"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Challenge Image URL
            </label>
            <input
              type="url"
              id="image_uri"
              name="image_uri"
              value={formData.image_uri}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the challenge objectives, rules, and evaluation criteria"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            {/* Delete Button */}
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Challenge
            </button>

            {/* Save Buttons */}
            <div className="flex space-x-4">
              <Link
                to={`/leaderboard/${challengeId}`}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={updateChallengeMutation.isPending || !hasChanges}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
              >
                {updateChallengeMutation.isPending && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <Save className="w-4 h-4" />
                <span>
                  {updateChallengeMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </span>
              </button>
            </div>
          </div>
        </form>

        {/* Success/Error Messages */}
        {updateChallengeMutation.isSuccess && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-400">
              Challenge updated successfully!
            </p>
          </div>
        )}

        {updateChallengeMutation.isError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-400">
              {updateChallengeMutation.error instanceof Error
                ? updateChallengeMutation.error.message
                : "Failed to update challenge. Please try again."}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Challenge
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this challenge? This action cannot
              be undone and will remove all associated submissions and results.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteChallengeMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {deleteChallengeMutation.isPending && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>
                  {deleteChallengeMutation.isPending ? "Deleting..." : "Delete"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditChallenge;
