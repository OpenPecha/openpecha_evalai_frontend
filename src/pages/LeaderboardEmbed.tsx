import { useParams } from "react-router-dom";
import { useState } from "react";
import {
  Trophy,
  Crown,
  Medal,
  Award,
  BarChart3,
  Table,
} from "lucide-react";
import { useAllLeaderboards, useChallenges } from "../hooks/useChallenges";
import LeaderboardChart from "../components/LeaderboardChart";

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-neutral-400" />;
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />;
    default:
      return (
        <span className="w-5 h-5 flex items-center justify-center text-neutral-600 dark:text-neutral-400 font-semibold text-sm">
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
      return "text-primary-600 dark:text-primary-400";
    default:
      return "text-neutral-700 dark:text-neutral-100";
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "completed":
      return "bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400";
    case "draft":
      return "bg-neutral-100 text-neutral-600 dark:bg-neutral-900/20 dark:text-neutral-400";
    default:
      return "bg-neutral-100 text-neutral-600 dark:bg-neutral-900/20 dark:text-neutral-400";
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "🟢";
    case "completed":
      return "🔵";
    case "draft":
      return "⚪";
    default:
      return "⚪";
  }
};

const LeaderboardEmbed = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");

  const {
    data: challengesResponse,
    isLoading: challengesLoading,
    error: challengesError,
  } = useChallenges();
  const challenges = challengesResponse?.data || [];

  const {
    data: leaderboardsData,
    isLoading: leaderboardsLoading,
    error: leaderboardsError,
  } = useAllLeaderboards(challenges);

  const isLoading = challengesLoading || leaderboardsLoading;
  const error = challengesError || leaderboardsError;

  // Find the specific leaderboard for this challenge
  const leaderboard = leaderboardsData?.find(lb => lb.challengeId === challengeId);
  const challenge = challenges.find(c => c.id === challengeId);

  if (isLoading) {
    return (
      <div className="p-4 bg-neutral-50 dark:bg-neutral-900 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm">
            Loading leaderboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !challenge || !leaderboard) {
    return (
      <div className="p-4 bg-neutral-50 dark:bg-neutral-900 min-h-screen">
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

  // Get available metrics from first submission
  const availableMetrics =
    leaderboard.submissions.length > 0
      ? Object.keys(leaderboard.submissions[0].metrics || {})
      : [];

  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-900 min-h-screen">
      {/* Single Leaderboard Card */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          {/* Compact Challenge Header */}
          <div className="bg-neutral-50 dark:bg-neutral-700 px-4 py-2 border-b border-neutral-200 dark:border-neutral-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2
                  className="text-sm font-semibold text-neutral-700 dark:text-neutral-100 truncate cursor-help"
                  title={challenge.description || leaderboard.challengeTitle}
                >
                  {leaderboard.challengeTitle}
                </h2>
                <div className="flex items-center space-x-1">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(
                      challenge.status || "unknown"
                    )}`}
                  >
                    <span className="mr-0.5 text-xs">
                      {getStatusIcon(challenge.status || "unknown")}
                    </span>
                    {challenge.status || "unknown"}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {leaderboard.submissions.length}
                </span>
                
                {/* View Toggle Buttons */}
                {leaderboard.submissions.length > 0 && (
                  <div className="flex items-center bg-neutral-100 dark:bg-neutral-600 rounded-md p-0.5">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-1 rounded text-xs transition-colors duration-200 ${
                        viewMode === "table"
                          ? "bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-100 shadow-sm"
                          : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-100"
                      }`}
                      title="Table view"
                    >
                      <Table className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setViewMode("chart")}
                      className={`p-1 rounded text-xs transition-colors duration-200 ${
                        viewMode === "chart"
                          ? "bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-100 shadow-sm"
                          : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-100"
                      }`}
                      title="Chart view"
                    >
                      <BarChart3 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Leaderboard Content - Table or Chart */}
          {leaderboard.submissions.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-100 mb-1">
                No submissions yet
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                Be the first to submit!
              </p>
            </div>
          )}
          
          {leaderboard.submissions.length > 0 && viewMode === "table" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-neutral-50 dark:bg-neutral-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Model
                    </th>
                    {availableMetrics.slice(0, 2).map((metric) => (
                      <th
                        key={metric}
                        className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                      >
                        {metric}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {leaderboard.submissions
                    .slice(0, 8)
                    .map((submission) => (
                      <tr
                        key={
                          submission.submission_id ||
                          `submission-${Math.random()}`
                        }
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-150"
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRankIcon(submission.rank || 0)}
                            <span className="ml-1 text-xs font-medium text-neutral-700 dark:text-neutral-100">
                              {submission.rank || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="text-xs font-medium text-neutral-700 dark:text-neutral-100 truncate max-w-32">
                            {submission.model_name}
                          </div>
                        </td>
                        {availableMetrics.slice(0, 2).map((metric) => (
                          <td
                            key={metric}
                            className="px-3 py-2 whitespace-nowrap"
                          >
                            <div
                              className={`text-xs font-semibold ${getMetricClass(
                                metric
                              )}`}
                            >
                              {submission.metrics[metric] !== undefined
                                ? formatScore(
                                    submission.metrics[metric],
                                    metric
                                  )
                                : "-"}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
          
          {leaderboard.submissions.length > 0 && viewMode === "chart" && (
            <LeaderboardChart
              submissions={leaderboard.submissions}
              availableMetrics={availableMetrics}
              className="p-4"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardEmbed;
