import React, { useState, useEffect } from "react";
import { Crown, Medal, Award, TrendingUp, RefreshCw, Star } from "lucide-react";
import { getTranslationLeaderboard } from "../api/translate";
import type { TranslationModelScore } from "../types/translate";

const TranslationLeaderboard: React.FC = () => {
  const [scores, setScores] = useState<TranslationModelScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTranslationLeaderboard();
      setScores(response.leaderboard);
    } catch (err) {
      console.error("Error fetching translation leaderboard:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400 font-semibold text-sm">
            {rank}
          </span>
        );
    }
  };

  const getProviderColor = (provider: string) => {
    const colors = {
      google: "text-blue-600 dark:text-blue-400",
      openai: "text-green-600 dark:text-green-400", 
      anthropic: "text-purple-600 dark:text-purple-400",
    };
    return colors[provider as keyof typeof colors] || "text-gray-600 dark:text-gray-400";
  };

  const sortedScores = [...scores].sort((a, b) => {
    // Sort by average score (desc), then by total votes (desc)
    if (a.average_score !== b.average_score) {
      return b.average_score - a.average_score;
    }
    return b.total_votes - a.total_votes;
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Translation Models
              </h2>
              <div className="flex items-center space-x-1">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20">
                  <span className="mr-0.5 text-xs">🤖</span>
                  {" "}AI Arena
                </span>
              </div>
            </div>
            <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
          </div>
        </div>
        <div className="text-center py-8">
          <TrendingUp className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-600 dark:text-gray-400">Loading rankings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Translation Models
              </h2>
              <div className="flex items-center space-x-1">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20">
                  <span className="mr-0.5 text-xs">⚠️</span>
                  {" "}Error
                </span>
              </div>
            </div>
            <button
              onClick={fetchLeaderboard}
              className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title="Retry"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-xs text-red-600 dark:text-red-400 mb-3">Failed to load</p>
          <button
            onClick={fetchLeaderboard}
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Compact Header - Same as other leaderboards */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              Translation Models
            </h2>
            <div className="flex items-center space-x-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20">
                <span className="mr-0.5 text-xs">🤖</span>
                {" "}AI Arena
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {sortedScores.length}
            </span>
            <button
              onClick={fetchLeaderboard}
              className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title="Refresh rankings"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard Content - Table Format like other leaderboards */}
      {sortedScores.length === 0 ? (
        <div className="text-center py-8">
          <TrendingUp className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            No rankings yet
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Vote in the Translation Arena to create rankings!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Votes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedScores.slice(0, 8).map((score, index) => (
                <tr
                  key={`${score.provider}-${score.model_version}`}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankIcon(index + 1)}
                      <span className="ml-1 text-xs font-medium text-gray-900 dark:text-white">
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-32">
                        {score.model_version}
                      </div>
                      <div className={`text-xs ${getProviderColor(score.provider)}`}>
                        {score.provider}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        {score.total_votes > 0 ? score.average_score.toFixed(1) : "-"}
                      </span>
                      {score.total_votes > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({score.score_percentage}%)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {score.total_votes}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TranslationLeaderboard;
