import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertCircle,
  FileText,
  Info,
} from "lucide-react";
import { useChallenge, useSubmitToChallenge } from "../hooks/useChallenges";
import { useAuth } from "../auth/use-auth-hook";

const Submission = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const {
    data: challengeResponse,
    isLoading: challengeLoading,
    error: challengeError,
  } = useChallenge(challengeId || "");

  const submitMutation = useSubmitToChallenge();

  const challenge = challengeResponse?.data;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modelName, setModelName] = useState("");
  const [description, setDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file.type === "application/json") {
      setSelectedFile(file);
    } else {
      alert("Please select a valid JSON file");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!isAuthenticated) {
      const shouldLogin = window.confirm(
        "You need to be logged in to submit to challenges. Would you like to login now?"
      );
      if (shouldLogin) {
        login(false); // Redirect to login
      }
      return;
    }

    if (
      !selectedFile ||
      !modelName.trim() ||
      !description.trim() ||
      !challengeId
    ) {
      alert("Please fill in all required fields and select a file");
      return;
    }

    try {
      await submitMutation.mutateAsync({
        file: selectedFile,
        model_name: modelName.trim(),
        challenge_id: challengeId,
        description: description.trim(),
      });

      // Reset form
      setSelectedFile(null);
      setModelName("");
      setDescription("");

      // Navigate to leaderboard after successful submission
      setTimeout(() => {
        navigate(`/leaderboard/${challengeId}`);
      }, 2000);
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  if (challengeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading challenge details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (challengeError || !challenge) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Challenges
            </Link>
          </div>
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                Error Loading Challenge
              </h2>
              <p className="text-red-600 dark:text-red-400">
                {!challenge
                  ? "Challenge not found."
                  : "Failed to load challenge details. Please try again later."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (challenge.status !== "active") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Challenges
            </Link>
          </div>
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                Submissions Not Available
              </h2>
              <p className="text-yellow-700">
                This challenge is currently {challenge.status}.
                {challenge.status === "upcoming" &&
                  challenge.startDate &&
                  ` Submissions will open on ${new Date(
                    challenge.startDate
                  ).toLocaleDateString()}.`}
                {challenge.status === "completed" &&
                  challenge.endDate &&
                  ` Submissions closed on ${new Date(
                    challenge.endDate
                  ).toLocaleDateString()}.`}
              </p>
              <Link
                to={`/leaderboard/${challengeId}`}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-0">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-600 text-white px-6 py-6">
            <h1 className="text-2xl font-bold mb-2">
              Submit to {challenge.title || challenge.name}
            </h1>
            <p className="text-green-100">
              Upload your model's results in JSON format
            </p>
            <div className="mt-3 text-sm text-green-100">
              <p>
                Evaluation Metric: {challenge.evaluationMetric || "Performance"}
              </p>
              <p>
                Max Submissions:{" "}
                {challenge.maxSubmissionsPerTeam || "Unlimited"} per team
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Challenge Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-400">
                    Challenge Information
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    {challenge.description}
                  </p>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    <span>
                      Created:{" "}
                      {challenge.created_at
                        ? new Date(challenge.created_at).toLocaleDateString()
                        : "N/A"}
                    </span>
                    <span className="mx-2">•</span>
                    <span>
                      Total Submissions: {challenge.totalSubmissions || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Information */}
            <div>
              <label
                htmlFor="modelName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Model Name *
              </label>
              <input
                type="text"
                id="modelName"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., MyAwesomeModel-v1.0"
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You can add new model names, and they will be created in our
                model table if the submission passes validation.
              </p>
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Brief description of your model or approach..."
                required
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This description will be displayed with your submission.
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label
                htmlFor="fileInput"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Upload Results File (JSON) *
              </label>

              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
                  dragActive
                    ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                    : selectedFile
                    ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  id="fileInput"
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div
                  className="text-center"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      document.getElementById("fileInput")?.click();
                    }
                  }}
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Drop your JSON file here, or click to browse
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Only JSON files are accepted
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* File Format Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-400">
                    Required JSON Format
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                    Upload and validate a JSON file containing ML inference
                    results.
                  </p>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    <p>
                      <strong>Required fields:</strong>
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>
                        <code>filename</code> - Name of the input file
                      </li>
                      <li>
                        <code>prediction</code> - Your model's prediction result
                      </li>
                    </ul>
                    <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-800 rounded text-xs">
                      <p>
                        <strong>Example:</strong>
                      </p>
                      <p>
                        <code>file: inference_results.json</code>
                      </p>
                      <p>
                        <code>
                          user_id: (automatically extracted from authentication
                          token)
                        </code>
                      </p>
                      <p>
                        <code>model_name: my-awesome-model</code>
                      </p>
                      <p>
                        <code>challenge_id: {challengeId}</code>
                      </p>
                      <p>
                        <code>
                          description: This is a description of the submission
                        </code>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {/* Authentication Notice */}
            {!isAuthenticated && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                  <p className="text-sm text-blue-800 dark:text-blue-400">
                    Please{" "}
                    <button
                      type="button"
                      onClick={() => login(false)}
                      className="underline hover:text-blue-900 dark:hover:text-blue-300 font-medium"
                    >
                      login
                    </button>{" "}
                    to submit your results to this challenge.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Link
                to={`/leaderboard/${challengeId}`}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                View Leaderboard
              </Link>

              <button
                type="submit"
                disabled={
                  submitMutation.isPending ||
                  !selectedFile ||
                  !modelName.trim() ||
                  !description.trim() ||
                  !isAuthenticated
                }
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                title={!isAuthenticated ? "Please login to submit" : ""}
              >
                {submitMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {!isAuthenticated ? "Login to Submit" : "Submit Results"}
                  </>
                )}
              </button>
            </div>

            {/* Status Messages */}
            {submitMutation.isSuccess && (
              <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <p className="text-green-800 dark:text-green-400">
                  Submission successful! Your results are being processed and
                  will appear on the leaderboard soon. Redirecting to
                  leaderboard...
                </p>
              </div>
            )}

            {submitMutation.isError && (
              <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <p className="text-red-800 dark:text-red-400">
                  {submitMutation.error instanceof Error
                    ? submitMutation.error.message
                    : "Submission failed. Please check your file format and try again."}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Submission;
