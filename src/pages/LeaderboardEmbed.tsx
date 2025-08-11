import { useParams } from "react-router-dom";
import { Medal, Trophy } from "lucide-react";
import { useLeaderboard, useChallenge } from "../hooks/useChallenges";

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Medal className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return (
        <span className="w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400 font-semibold text-sm">
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

const LeaderboardEmbed = () => {
  const { challengeId } = useParams<{ challengeId: string }>();

  const {
    data: leaderboardResponse,
    isLoading: leaderboardLoading,
    error: leaderboardError,
  } = useLeaderboard(challengeId || "", 1, 50); // Get top 50 for embed

  const {
    data: challengeResponse,
    isLoading: challengeLoading,
    error: challengeError,
  } = useChallenge(challengeId || "");

  const challenge = challengeResponse?.data;
  const submissions = leaderboardResponse?.data || [];
  const pagination = leaderboardResponse?.pagination;

  if (challengeLoading || leaderboardLoading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
            Loading leaderboard...
          </p>
        </div>
      </div>
    );
  }

  if (challengeError || leaderboardError || !challenge) {
    return (
      <div className="p-4 bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
              Error Loading Leaderboard
            </h2>
            <p className="text-red-600 dark:text-red-400 text-sm">
              {!challenge
                ? "Challenge not found."
                : "Failed to load leaderboard data."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get available metrics from submissions
  const availableMetrics =
    submissions.length > 0 ? Object.keys(submissions[0].metrics || {}) : [];

  return (
    <div className="p-2 bg-white dark:bg-gray-900 min-h-screen">
      {/* Pure Table with integrated header */}
      <div className="overflow-x-auto">
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No submissions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Be the first to submit results to{" "}
              {challenge.title || challenge.name}!
            </p>
          </div>
        ) : (
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
            {/* Table Header with Challenge Info */}
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-purple-600">
                <th
                  colSpan={4 + availableMetrics.length}
                  className="px-6 py-4 text-left"
                >
                  <div className="text-white">
                    <h1
                      className="text-lg font-bold mb-1 cursor-help"
                      title={challenge.description}
                    >
                      {challenge.title || challenge.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span>📊 {pagination?.total || 0} Submissions</span>
                      <span>
                        📅 {new Date(challenge.created_at).toLocaleDateString()}
                      </span>
                      <span>🏆 Status: {challenge.status}</span>
                    </div>
                  </div>
                </th>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                  Model
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                  Description
                </th>
                {availableMetrics.map((metric, index) => (
                  <th
                    key={metric}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                      index < availableMetrics.length - 1
                        ? "border-r border-gray-200 dark:border-gray-600"
                        : ""
                    }`}
                  >
                    {metric}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {submissions.map((submission, index) => (
                <tr
                  key={submission.submission_id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index % 2 === 0 ? "bg-gray-50/30 dark:bg-gray-700/30" : ""
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200 dark:border-gray-600">
                    <div className="flex items-center">
                      {getRankIcon(submission.rank || 0)}
                      <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                        #{submission.rank || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200 dark:border-gray-600">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {submission.model_name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {submission.submission_id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-600">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                      {submission.description}
                    </div>
                  </td>
                  {availableMetrics.map((metric, metricIndex) => (
                    <td
                      key={metric}
                      className={`px-4 py-3 whitespace-nowrap ${
                        metricIndex < availableMetrics.length - 1
                          ? "border-r border-gray-200 dark:border-gray-600"
                          : ""
                      }`}
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
                  <td className="px-4 py-3 whitespace-nowrap">
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
            {/* Footer with branding */}
            <tfoot>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <td
                  colSpan={4 + availableMetrics.length}
                  className="px-6 py-3 text-center"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Powered by OpenPecha EvalAI | Showing top{" "}
                    {submissions.length} of {pagination?.total || 0} submissions
                  </p>
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
};

export default LeaderboardEmbed;
