import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Medal, Trophy, Users, Calendar, Edit } from "lucide-react";
import { useLeaderboard, useChallenge } from "../hooks/useChallenges";
import { useCurrentUser } from "../hooks/useUsers";

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Medal className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return (
        <span className="w-6 h-6 flex items-center justify-center text-gray-600 dark:text-gray-400 font-semibold">
          {rank}
        </span>
      );
  }
};

const formatScore = (value: number, metric: string) => {
  // For percentage-based metrics, show as percentage
  if (metric === "CER" || metric === "WER" || metric === "ACCURACY") {
    return `${(value * 100).toFixed(2)}%`;
  }
  // For other metrics, show as decimal
  return value.toFixed(4);
};

const getMetricClass = (metric: string) => {
  // Different colors for different metrics
  switch (metric) {
    case "CER":
      return "text-red-600 dark:text-red-400";
    case "WER":
      return "text-orange-600 dark:text-orange-400";
    case "ACCURACY":
      return "text-green-600 dark:text-green-400";
    case "BLEU":
      return "text-blue-600 dark:text-blue-400";
    default:
      return "text-gray-900 dark:text-white";
  }
};

const Leaderboard = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { data: currentUserData } = useCurrentUser();

  const {
    data: leaderboardResponse,
    isLoading: leaderboardLoading,
    error: leaderboardError,
  } = useLeaderboard(challengeId || "", 1, 50); // Get top 50

  const {
    data: challengeResponse,
    isLoading: challengeLoading,
    error: challengeError,
  } = useChallenge(challengeId || "");

  const challenge = challengeResponse?.data;
  const submissions = leaderboardResponse?.data || [];
  const pagination = leaderboardResponse?.pagination;
  const user = currentUserData?.data;
  const isAdmin = user?.role === "admin";

  if (challengeLoading || leaderboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading leaderboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (challengeError || leaderboardError || !challenge) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
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
                Error Loading Leaderboard
              </h2>
              <p className="text-red-600 dark:text-red-400">
                {!challenge
                  ? "Challenge not found."
                  : "Failed to load leaderboard data. Please try again later."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get available metrics from submissions
  const availableMetrics =
    submissions.length > 0 ? Object.keys(submissions[0].metrics || {}) : [];

  return (
    <div className="py-0">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Link>
        </div>

        {/* Challenge Info Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8">
          <div className="text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {challenge.title || challenge.name} - Leaderboard
                </h1>
                <p className="text-blue-100 mb-4">{challenge.description}</p>
              </div>
              {/* Admin Controls */}
              {isAdmin && (
                <div className="flex space-x-2">
                  <Link
                    to={`/admin/edit-challenge/${challengeId}`}
                    className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Challenge
                  </Link>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>{pagination?.total || 0} Submissions</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  Created: {new Date(challenge.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <Trophy className="w-4 h-4 mr-2" />
                <span>Status: {challenge.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Rankings
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Showing {submissions.length} of {pagination?.total || 0}{" "}
              submissions
            </p>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No submissions yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Be the first to submit your results to this challenge!
              </p>
              <Link
                to={`/submit/${challengeId}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Submit Results
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    {availableMetrics.map((metric) => (
                      <th
                        key={metric}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {metric}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {submissions.map((submission) => (
                    <tr
                      key={submission.submission_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRankIcon(submission.rank || 0)}
                          <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                            #{submission.rank || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {submission.model_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {submission.submission_id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {submission.description}
                        </div>
                      </td>
                      {availableMetrics.map((metric) => (
                        <td
                          key={metric}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          <div
                            className={`text-sm font-semibold ${getMetricClass(
                              metric
                            )}`}
                          >
                            {submission.metrics[metric] !== undefined
                              ? formatScore(submission.metrics[metric], metric)
                              : "-"}
                          </div>
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(submission.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            to={`/submit/${challengeId}`}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Submit Your Results
          </Link>
          <Link
            to="/leaderboards"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Users className="w-5 h-5 mr-2" />
            View All Leaderboards
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
