import React, { useState, useMemo } from "react";
import { Crown, Medal, Award, Bot, RefreshCw, Info, Trophy, Target, TrendingUp } from "lucide-react";
import { useModelVoteLeaderboard } from "../hooks/useTranslate";

const ModelVoteLeaderboard: React.FC = () => {
  const [showAll, setShowAll] = useState(false);

  // Use react-query hook for data fetching
  const { 
    data: leaderboardData, 
    isLoading: loading, 
    error, 
    refetch: fetchLeaderboard 
  } = useModelVoteLeaderboard();
  
  // Memoize model scores to prevent unnecessary re-renders
  const modelScores = useMemo(() => leaderboardData?.leaderboard || [], [leaderboardData?.leaderboard]);

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
          <span className="w-5 h-5 flex items-center justify-center text-neutral-600 dark:text-neutral-300 font-semibold text-sm">
            {rank}
          </span>
        );
    }
  };

  const getProviderBadge = (provider: string) => {
    const badges = {
      google: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      openai: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      anthropic: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      "deepseek-v3": "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    };
    return badges[provider as keyof typeof badges] || "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300";
  };

  const formatModelName = (modelName: string) => {
    // Shorten long model names for better display
    if (modelName.length > 25) {
      return modelName.substring(0, 22) + "...";
    }
    return modelName;
  };

  // Apply show all filter
  const displayScores = useMemo(() => {
    return showAll ? modelScores : modelScores.slice(0, 10);
  }, [modelScores, showAll]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Arena
            </h2>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm">
            Loading model scores...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Arena
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">
              Error Loading Data
            </h3>
            <p className="text-red-600 dark:text-red-400 text-sm">
              Failed to load model leaderboard. Please try again.
            </p>
            <button
              onClick={() => fetchLeaderboard()}
              className="mt-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
             Arena
            </h2>
            <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
              <Info className="w-4 h-4" />
              <span className="text-xs">
                {leaderboardData?.total_models_with_data || 0} models • {leaderboardData?.total_votes || 0} total votes • {leaderboardData?.total_score.toFixed(1) || 0} total score
              </span>
            </div>
          </div>
          <button
            onClick={() => fetchLeaderboard()}
            className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white transition-colors"
            title="Refresh leaderboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scoring Info */}
      <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-700/50 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            <span>Scoring: Clear Win = 1pt</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            <span>Tie = 0.5pt</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Ranked by total score</span>
          </div>
        </div>
      </div>


      {/* Models List */}
      <div className="p-4">
        {displayScores.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600 dark:text-neutral-400 mb-2">
              No model data available.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayScores.map((score) => (
              <div
                key={`${score.rank}-${score.model_name}`}
                className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getRankIcon(score.rank)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-medium">
                      <Bot className="w-4 h-4" />
                    </div>
                    
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-white text-sm">
                        {formatModelName(score.model_name)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getProviderBadge(score.provider)}`}>
                          {score.provider}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg text-purple-600 dark:text-purple-400">
                      {score.score.toFixed(1)}
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      Total Score
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      {score.clear_wins}
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      Clear Wins
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold text-orange-600 dark:text-orange-400">
                      {score.ties}
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Ties
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                      {score.total_comparisons}
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      Total Votes
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold text-neutral-600 dark:text-neutral-400">
                      {score.win_rate_percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Win Rate
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show More/Less Button */}
        {modelScores.length > 10 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
            >
              {showAll 
                ? `Show Less (${modelScores.length - 10} more hidden)` 
                : `Show All ${modelScores.length} Models`
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelVoteLeaderboard;
