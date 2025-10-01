import React, { useState, useMemo } from "react";
import { Crown, Medal, Award, Search, TrendingUp, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import btRatingsData from "../score_data/bt_ratings.json";
import MattricHelper from "./MattricHelper";

interface ModelScore {
  id: string;
  elo_bt: number;
}

interface ModelScoreLeaderboardProps {
  compact?: boolean;
}

const ModelScoreLeaderboard: React.FC<ModelScoreLeaderboardProps> = ({ compact = false }) => {
  useTranslation(); // For future i18n support
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Process and sort the data
  const modelScores = useMemo(() => {
    return (btRatingsData as ModelScore[])
      .map((model, index) => ({
        ...model,
        rank: index + 1,
        provider: model.id.split(":")[0],
        modelName: model.id.split(":")[1] || model.id,
      }))
      .sort((a, b) => b.elo_bt - a.elo_bt); // Sort by ELO score descending
  }, []);

  // Filter based on search query
  const filteredScores = useMemo(() => {
    if (!searchQuery.trim()) return modelScores;
    
    const query = searchQuery.toLowerCase();
    return modelScores.filter(
      (model) =>
        model.id.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.modelName.toLowerCase().includes(query)
    );
  }, [modelScores, searchQuery]);

  // Display limited or all results
  const displayedScores = showAll ? filteredScores : filteredScores.slice(0, 10);

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

  const getProviderColor = (provider: string) => {
    const colors = {
      google: "text-blue-500 dark:text-blue-400",
      openai: "text-green-500 dark:text-green-400",
      anthropic: "text-purple-500 dark:text-purple-400",
      "deepseek-v3": "text-orange-500 dark:text-orange-400",
    };
    return colors[provider as keyof typeof colors] || "text-neutral-600 dark:text-neutral-300";
  };

  const getScoreColor = (score: number, rank: number) => {
    if (rank <= 3) return "text-yellow-600 dark:text-yellow-400 font-bold";
    if (score >= 1000) return "text-green-600 dark:text-green-400 font-semibold";
    if (score >= 950) return "text-blue-600 dark:text-blue-400 font-medium";
    return "text-neutral-700 dark:text-neutral-300";
  };

  const getTierClasses = (isTopTier: boolean, isHighTier: boolean) => {
    if (isTopTier) return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    if (isHighTier) return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    return "bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300";
  };

  const getTierLabel = (isTopTier: boolean, isHighTier: boolean) => {
    if (isTopTier) return "Elite";
    if (isHighTier) return "High";
    return "Standard";
  };

  // Compact mode for embedding in leaderboards page
  if (compact) {
    const compactScores = filteredScores.slice(0, 6); // Show top 6 for compact view
    
    return (
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  ELO
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {compactScores.map((model) => (
                <tr
                  key={model.id}
                  className={`hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200 ${
                    model.rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/20" : ""
                  }`}
                >
                  {/* Rank */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {getRankIcon(model.rank)}
                    </div>
                  </td>

                  {/* Model Name */}
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-32">
                      {model.modelName}
                    </div>
                    <div className={`text-xs font-medium capitalize ${getProviderColor(model.provider)}`}>
                      {model.provider}
                    </div>
                  </td>

                  {/* ELO Rating */}
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`text-sm font-bold ${getScoreColor(model.elo_bt, model.rank)}`}>
                      {model.elo_bt}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Full mode for standalone page
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-8 h-8 text-primary-500" />
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Model Performance Leaderboard
          </h1>
        </div>
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <Info className="w-4 h-4" />
          <p className="text-sm">
            Rankings based on Bradley-Terry ELO ratings from head-to-head comparisons
          </p>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search models or providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg 
                     bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     placeholder-neutral-500 dark:placeholder-neutral-400"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Showing {displayedScores.length} of {filteredScores.length} models
          </div>
          {filteredScores.length > 10 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg
                       transition-colors duration-200 text-sm font-medium"
            >
              {showAll ? "Show Top 10" : "Show All"}
            </button>
          )}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            <thead className="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  ELO Rating
                  <MattricHelper metric="ELO" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Performance Tier
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
              {displayedScores.map((model, index) => {
                const isTopTier = model.elo_bt >= 1000;
                const isHighTier = model.elo_bt >= 950;
                
                return (
                  <tr
                    key={model.id}
                    className={`hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200 ${
                      model.rank <= 3 ? "bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/20" : ""
                    }`}
                  >
                    {/* Rank */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRankIcon(model.rank)}
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          #{model.rank}
                        </span>
                      </div>
                    </td>

                    {/* Provider */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-semibold capitalize ${getProviderColor(model.provider)}`}>
                          {model.provider}
                        </span>
                      </div>
                    </td>

                    {/* Model Name */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 max-w-xs truncate">
                        {model.modelName}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs truncate">
                        {model.id}
                      </div>
                    </td>

                    {/* ELO Rating */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getScoreColor(model.elo_bt, model.rank)}`}>
                          {model.elo_bt}
                        </span>
                        {model.rank <= 3 && (
                          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                        )}
                      </div>
                    </td>

                    {/* Performance Tier */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierClasses(isTopTier, isHighTier)}`}
                      >
                        {getTierLabel(isTopTier, isHighTier)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredScores.length === 0 && (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-neutral-400" />
            <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
              No models found
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Try adjusting your search query.
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-primary-500">{modelScores.length}</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Models</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-green-500">
            {modelScores.filter(m => m.elo_bt >= 1000).length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Elite Tier (1000+)</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-yellow-500">
            {Math.max(...modelScores.map(m => m.elo_bt))}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Highest Rating</div>
        </div>
      </div>
    </div>
  );
};

export default ModelScoreLeaderboard;
