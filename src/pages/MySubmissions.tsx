import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import {
  FileText,
  Trophy,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  AlertCircle,
} from "lucide-react";
import { useUserSubmissions, useChallenges } from "../hooks/useChallenges";
import type { UserSubmission } from "../types/challenge";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400">
          <Clock className="w-3 h-3 mr-1" />
          Processing
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
          {status}
        </span>
      );
  }
};

const MySubmissions = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

  // Fetch user submissions from API
  const {
    data: submissionsResponse,
    isLoading: submissionsLoading,
    error: submissionsError,
  } = useUserSubmissions();

  // Fetch challenges to get challenge names
  const { data: challengesResponse, isLoading: challengesLoading } =
    useChallenges();

  const submissions = (submissionsResponse?.data || []) as UserSubmission[];

  // Create a map of challenge IDs to challenge names for quick lookup
  const challengeMap = useMemo(() => {
    const challenges = challengesResponse?.data || [];
    const map: Record<string, string> = {};
    challenges.forEach((challenge) => {
      map[challenge.id] =
        challenge.title || challenge.name || "Unknown Challenge";
    });
    return map;
  }, [challengesResponse?.data]);

  const filteredSubmissions = submissions
    .filter((submission) => {
      if (filterStatus === "all") return true;
      return submission.status === filterStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        default:
          return 0;
      }
    });

  return (
    <ProtectedRoute>
      <div className="py-0">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-700 dark:text-neutral-100 mb-2">
              My Submissions
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Track all your challenge submissions and their performance.
            </p>
          </div>

          {/* Filters and Controls */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-600 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 text-neutral-400 dark:text-neutral-500 mr-2" />
                  <label
                    htmlFor="status-filter"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Status:
                  </label>
                  <select
                    id="status-filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="ml-2 border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label
                    htmlFor="sort-by"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Sort by:
                  </label>
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="ml-2 border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="date">Date</option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {filteredSubmissions.length} submission
                {filteredSubmissions.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {(submissionsLoading || challengesLoading) && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                Loading your submissions...
              </p>
            </div>
          )}

          {/* Error State */}
          {submissionsError && !submissionsLoading && (
            <div className="text-center py-12">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
                <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
                  Error Loading Submissions
                </h3>
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {submissionsError instanceof Error
                    ? submissionsError.message
                    : "Failed to load your submissions. Please try again later."}
                </p>
              </div>
            </div>
          )}

          {/* Submissions List */}
          {!submissionsLoading &&
          !challengesLoading &&
          !submissionsError &&
          filteredSubmissions.length > 0 ? (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-600 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-100">
                          {submission.description ||
                            `Submission ${submission.id.slice(0, 8)}`}
                        </h3>
                        {getStatusBadge(submission.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-neutral-500 dark:text-neutral-400">
                            Challenge
                          </p>
                          <Link
                            to={`/leaderboard/${submission.challenge_id}`}
                            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            {challengeMap[submission.challenge_id] ||
                              "Unknown Challenge"}
                          </Link>
                        </div>

                        <div>
                          <p className="text-neutral-500 dark:text-neutral-400">
                            Dataset URL
                          </p>
                          <p className="font-medium text-neutral-700 dark:text-neutral-100 text-xs break-all">
                            {submission.dataset_url ? (
                              <a
                                href={submission.dataset_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {submission.dataset_url.length > 30
                                  ? `${submission.dataset_url.slice(0, 30)}...`
                                  : submission.dataset_url}
                              </a>
                            ) : (
                              "N/A"
                            )}
                          </p>
                        </div>

                        {(submission.status === "processing" ||
                          submission.status === "pending") &&
                          submission.status_message && (
                            <div className="md:col-span-2">
                              <p className="text-neutral-500 dark:text-neutral-400">
                                Status Message
                              </p>
                              <p className="font-medium text-yellow-600 dark:text-yellow-400">
                                {submission.status_message ||
                                  "Your submission is being processed..."}
                              </p>
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col lg:items-end text-sm text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(submission.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs">
                        Submission ID: {submission.id.slice(0, 8)}...
                      </div>
                      <div className="mt-2">
                        <Link
                          to={`/leaderboard/${submission.challenge_id}`}
                          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <Trophy className="w-4 h-4 mr-1" />
                          View Leaderboard
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !submissionsLoading && !challengesLoading && !submissionsError ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-100 mb-2">
                No submissions found
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                {filterStatus === "all"
                  ? "You haven't made any submissions yet."
                  : `No submissions with status "${filterStatus}".`}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MySubmissions;
