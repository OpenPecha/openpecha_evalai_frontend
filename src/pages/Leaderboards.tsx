import { Link } from "react-router-dom";
import { Trophy, Users, ExternalLink, Crown, Medal, Award } from "lucide-react";
import { useChallenges, useAllLeaderboards } from "../hooks/useChallenges";

const Leaderboards = () => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20";
      case "upcoming":
        return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20";
      case "completed":
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return "🟢";
      case "upcoming":
        return "🟡";
      case "completed":
        return "⚪";
      default:
        return "⚪";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Award className="w-4 h-4 text-amber-600" />;
      default:
        return (
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            #{rank}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="py-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leaderboards...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Trophy className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error Loading Leaderboards
            </h2>
            <p className="text-gray-600">
              Failed to load leaderboards. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalSubmissions =
    leaderboardsData?.reduce(
      (total, leaderboard) => total + leaderboard.totalSubmissions,
      0
    ) || 0;

  return (
    <div className="py-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Challenge Leaderboards
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View top performers across all active challenges.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4 inline mr-1" />
                {totalSubmissions} total submissions
              </div>
              <Link
                to="/"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View all challenges
              </Link>
            </div>
          </div>
        </div>

        {!leaderboardsData || leaderboardsData.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Trophy className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-500 text-lg">
              No leaderboards available at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {leaderboardsData.map((leaderboard) => (
              <div
                key={leaderboard.challengeId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                {/* Challenge Header */}
                <div className="bg-gray-50 dark:bg-gray-700 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white">
                        {leaderboard.challengeTitle}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            leaderboard.challengeStatus
                          )}`}
                        >
                          <span className="mr-1">
                            {getStatusIcon(leaderboard.challengeStatus)}
                          </span>
                          {leaderboard.challengeStatus}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900">
                          {leaderboard.challengeCategory}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {leaderboard.totalSubmissions} submissions
                      </span>
                      <Link
                        to={`/leaderboard/${leaderboard.challengeId}`}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                      >
                        View all
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Leaderboard Table */}
                {leaderboard.submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No submissions yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Team
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Model
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Accuracy
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Votes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {leaderboard.submissions.map((submission) => (
                          <tr
                            key={submission.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getRankIcon(submission.rank)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white dark:text-white">
                                {submission.teamName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {submission.modelName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {submission.cer
                                  ? (submission.cer * 100).toFixed(2) + "%"
                                  : "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {submission.accuracy
                                  ? `${(submission.accuracy * 100).toFixed(2)}%`
                                  : "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {submission.f1Score
                                  ? submission.f1Score.toLocaleString()
                                  : "N/A"}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboards;
