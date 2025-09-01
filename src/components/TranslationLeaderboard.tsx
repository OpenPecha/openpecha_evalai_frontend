import React, { useState, useEffect } from "react";
import { Trophy, Award, Star, TrendingUp, Users, Target, RefreshCw } from "lucide-react";
import { getTranslationLeaderboard } from "../api/translate";
import type { TranslationModelScore } from "../types/translate";

const TranslationLeaderboard: React.FC = () => {
  const [scores, setScores] = useState<TranslationModelScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTranslationLeaderboard();
      setScores(response.leaderboard);
      setLastUpdated(new Date());
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

  const getProviderColor = (provider: string) => {
    const colors = {
      google: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20",
      openai: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20",
      anthropic: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20",
    };
    return colors[provider as keyof typeof colors] || "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20";
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Award className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-400">#{index + 1}</span>;
  };

  const renderScoreBreakdown = (breakdown: TranslationModelScore['score_breakdown']) => {
    const total = Object.values(breakdown).reduce((sum, count) => sum + count, 0);
    if (total === 0) return <span className="text-gray-400 text-xs">No votes yet</span>;

    return (
      <div className="flex items-center space-x-1">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = breakdown[star.toString() as keyof typeof breakdown];
          const percentage = (count / total) * 100;
          return (
            <div key={star} className="flex items-center space-x-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">{star}</span>
              <div className="w-8 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 min-w-[1.5rem]">{count}</span>
            </div>
          );
        })}
      </div>
    );
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
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading translation leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <Target className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Failed to load translation leaderboard</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={fetchLeaderboard}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Translation Model Rankings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Community-voted AI translation quality scores
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {lastUpdated && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchLeaderboard}
              className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title="Refresh leaderboard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sortedScores.map((score, index) => (
          <div key={`${score.provider}-${score.model_version}`} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center justify-between">
              {/* Rank and Model Info */}
              <div className="flex items-center space-x-4 flex-1">
                {/* Rank */}
                <div className="flex-shrink-0">
                  {getRankIcon(index)}
                </div>

                {/* Model Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {score.model_version}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProviderColor(score.provider)}`}>
                      {score.provider}
                    </span>
                  </div>

                  {/* Score Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {score.average_score.toFixed(1)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          ({score.score_percentage}%)
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{score.total_votes} votes</span>
                      </div>
                    </div>
                    
                    {score.total_votes > 0 && (
                      <div className="mt-2">
                        {renderScoreBreakdown(score.score_breakdown)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Overall Score Badge */}
              <div className="flex-shrink-0 ml-4">
                {score.total_votes > 0 ? (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {score.average_score.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      / 5.0
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 dark:text-gray-500">
                    <div className="text-sm font-medium">No votes</div>
                    <div className="text-xs">yet</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Rankings based on community votes from the Translation Arena.
          {" "}
          <span className="font-medium">Vote to help improve AI translation quality!</span>
        </p>
      </div>
    </div>
  );
};

export default TranslationLeaderboard;
