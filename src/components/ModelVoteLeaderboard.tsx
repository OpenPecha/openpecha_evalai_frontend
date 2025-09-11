import React, { useState, useMemo } from "react";
import { Crown, Medal, Award, Bot, RefreshCw, Info, Trophy, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useModelVoteLeaderboard } from "../hooks/useTranslate";

const ModelVoteLeaderboard: React.FC = () => {
  const { t } = useTranslation();
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

  const formatModelName = (modelName: string) => {
    // Shorten long model names for better display
    if (modelName.length > 25) {
      return modelName.substring(0, 22) + "...";
    }
    return modelName;
  };

  // Apply show all filter
  const displayScores = useMemo(() => {
    return showAll ? modelScores : modelScores.slice(0, 5);
  }, [modelScores, showAll]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              {t('arena.title')}
            </h2>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400 text-sm">
            {t('arena.loadingScores')}
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
              {t('arena.title')}
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">
              {t('arena.errorLoading')}
            </h3>
            <p className="text-red-600 dark:text-red-400 text-sm">
              {t('arena.failedToLoad')}
            </p>
            <button
              onClick={() => fetchLeaderboard()}
              className="mt-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.retry')}
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
              {t('arena.title')}
            </h2>
            <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
              <Info className="w-4 h-4" />
              <span className="text-xs">
                {leaderboardData?.total_models_with_data || 0} {t('leaderboards.totalModels')} • {leaderboardData?.total_votes || 0} {t('leaderboards.totalVotes')} • {leaderboardData?.total_score.toFixed(1) || 0} {t('leaderboards.totalScore')}
              </span>
            </div>
          </div>
          <button
            onClick={() => fetchLeaderboard()}
            className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white transition-colors"
            title={t('common.refresh')}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scoring Info */}
      <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-700/50 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1">
            <span>{t('arena.scoringInfo.clearWin')}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{t('arena.scoringInfo.tie')}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{t('arena.scoringInfo.rankedBy')}</span>
          </div>
        </div>
      </div>


      {/* Models Table */}
      <div className="overflow-x-auto">
        {displayScores.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
            <p className="text-neutral-600 dark:text-neutral-400 mb-2">
              {t('leaderboards.noModelData')}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('arena.table.rank')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('arena.table.model')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('arena.table.score')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('arena.table.wins')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('arena.table.ties')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('arena.table.winRate')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {displayScores.map((score) => (
                <tr 
                  key={`${score.rank}-${score.model_name}`}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankIcon(score.rank)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white text-sm">
                          {formatModelName(score.model_name)}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {score.provider}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="font-bold text-lg text-purple-600 dark:text-purple-400">
                      {score.score.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      {score.clear_wins}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="font-semibold text-orange-600 dark:text-orange-400">
                      {score.ties}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="font-semibold text-neutral-600 dark:text-neutral-400">
                      {score.win_rate_percentage.toFixed(1)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Show More/Less Button */}
        {modelScores.length > 5 && (
          <div className="mt-4 text-center border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
            >
              {showAll 
                ? t('common.showTop', { count: 5 })
                : t('arena.showAllModels', { count: modelScores.length })
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelVoteLeaderboard;
