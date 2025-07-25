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

const Submission = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();

  const {
    data: challengeResponse,
    isLoading: challengeLoading,
    error: challengeError,
  } = useChallenge(challengeId || "");

  const submitMutation = useSubmitToChallenge();

  const challenge = challengeResponse?.data;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modelName, setModelName] = useState("");
  const [teamName, setTeamName] = useState("");
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
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !selectedFile ||
      !modelName.trim() ||
      !teamName.trim() ||
      !challengeId
    ) {
      alert("Please fill in all required fields and select a file");
      return;
    }

    try {
      await submitMutation.mutateAsync({
        challengeId,
        modelName: modelName.trim(),
        teamName: teamName.trim(),
        description: description.trim(),
        file: selectedFile,
      });

      // Reset form
      setSelectedFile(null);
      setModelName("");
      setTeamName("");
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading challenge details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (challengeError || !challenge) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Challenges
            </Link>
          </div>
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Error Loading Challenge
              </h2>
              <p className="text-red-600">
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
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
                  ` Submissions will open on ${new Date(
                    challenge.startDate
                  ).toLocaleDateString()}.`}
                {challenge.status === "completed" &&
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
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-600 text-white px-6 py-6">
            <h1 className="text-2xl font-bold mb-2">
              Submit to {challenge.name}
            </h1>
            <p className="text-green-100">
              Upload your model's results in JSON format
            </p>
            <div className="mt-3 text-sm text-green-100">
              <p>Evaluation Metric: {challenge.evaluationMetric}</p>
              <p>Max Submissions: {challenge.maxSubmissionsPerTeam} per team</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Challenge Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    Challenge Information
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {challenge.description}
                  </p>
                  <div className="mt-2 text-xs text-blue-600">
                    <span>
                      Deadline:{" "}
                      {new Date(challenge.endDate).toLocaleDateString()}
                    </span>
                    <span className="mx-2">•</span>
                    <span>Total Submissions: {challenge.totalSubmissions}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="modelName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Model Name *
                </label>
                <input
                  type="text"
                  id="modelName"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., MyAwesomeModel-v1.0"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="teamName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Team Name *
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., AI Researchers"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Brief description of your model or approach..."
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Results File (JSON) *
              </label>

              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
                  dragActive
                    ? "border-green-400 bg-green-50"
                    : selectedFile
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="text-center">
                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
                      <p className="text-sm font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900">
                        Drop your JSON file here, or click to browse
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Only JSON files are accepted
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* File Format Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    Expected JSON Format
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Your JSON file should contain the model's predictions in the
                    format specified in the challenge documentation. Make sure
                    to include all required fields for{" "}
                    {challenge.evaluationMetric} calculation.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                to={`/leaderboard/${challengeId}`}
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                View Leaderboard
              </Link>

              <button
                type="submit"
                disabled={
                  submitMutation.isPending ||
                  !selectedFile ||
                  !modelName.trim() ||
                  !teamName.trim()
                }
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
              >
                {submitMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Results
                  </>
                )}
              </button>
            </div>

            {/* Status Messages */}
            {submitMutation.isSuccess && (
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800">
                  Submission successful! Your results are being processed and
                  will appear on the leaderboard soon. Redirecting to
                  leaderboard...
                </p>
              </div>
            )}

            {submitMutation.isError && (
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">
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
