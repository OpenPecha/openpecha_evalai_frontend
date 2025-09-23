import React, { useState, useEffect } from "react";
import { Trophy, Medal, Award, Search, X, ChevronDown } from "lucide-react";
import { FaLongArrowAltRight } from "react-icons/fa";
import { BiExpandAlt } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import { arenaApi } from "../api/arena_challenge";
import type { ArenaRanking as ArenaRankingType } from "../types/arena_challenge";

interface ArenaRankingProps {
  compact?: boolean;
}

type RankingBy = 'combined' | 'template' | 'model';

const ArenaRanking: React.FC<ArenaRankingProps> = () => {
  useTranslation(); // For future i18n support
  const [rankings, setRankings] = useState<ArenaRankingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<ArenaRankingType | null>(null);
  const [expandedLoading, setExpandedLoading] = useState(false);
  const [rankingBy, setRankingBy] = useState<RankingBy>('combined');

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const data = await arenaApi.getAllArenaRankings();
        setRankings(data);
      } catch (err) {
        setError('Failed to fetch arena rankings');
        console.error('Error fetching rankings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  // Fetch expanded challenge data
  const handleExpandChallenge = async (challenge:any) => {
    try {
      setExpandedLoading(true);
      setExpandedChallenge(challenge);
      
      // Using challengeIndex as ID since we don't have actual challenge IDs in demo data
      // Map our ranking types to API types
      const apiRankingBy = rankingBy === 'template' ? 'template' : 
                          rankingBy === 'model' ? 'model' : 'combined';
      const data = await arenaApi.getArenaRankingById(challenge.challenge_id, apiRankingBy);
      console.log("data ::: ",data)
      setExpandedData(data);
    } catch (err) {
      console.error('Error fetching expanded challenge data:', err);
      setError('Failed to fetch detailed challenge data');
    } finally {
      setExpandedLoading(false);
    }
  };

  // Handle collapse
  const handleCollapseChallenge = () => {
    setExpandedChallenge(null);
    setExpandedData(null);
  };

  // Refetch expanded data when ranking filter changes
  useEffect(() => {
    if (expandedChallenge && expandedData) {
      const challengeIndex = rankings.findIndex(r => r.challenge_details.challenge_name === expandedChallenge);
      if (challengeIndex !== -1) {
        handleExpandChallenge(expandedChallenge);
      }
    }
  }, [rankingBy]);

  // Filter rankings based on search query
  const filteredRankings = rankings.filter(ranking => {
    return ranking.challenge_details.challenge_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ranking.challenge_details.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ranking.challenge_details.from_language.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ranking.challenge_details.to_language.toLowerCase().includes(searchQuery.toLowerCase())
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
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

  const getModelColor = (modelName: string) => {
    const colors: { [key: string]: string } = {
      'gpt-4o': 'text-green-600 dark:text-green-400',
      'gpt-4o-mini': 'text-green-500 dark:text-green-300',
      'gpt-5': 'text-green-700 dark:text-green-500',
      'claude-3': 'text-purple-600 dark:text-purple-400',
      'mistral-7b': 'text-orange-600 dark:text-orange-400',
    };
    return colors[modelName] || 'text-neutral-600 dark:text-neutral-300';
  };

  const getScoreColor = (score: number, rank: number) => {
    if (rank <= 3) return "text-yellow-600 dark:text-yellow-400 font-bold";
    if (score >= 1600) return "text-green-600 dark:text-green-400 font-semibold";
    if (score >= 1500) return "text-blue-600 dark:text-blue-400 font-medium";
    return "text-neutral-700 dark:text-neutral-300";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading arena rankings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 dark:text-red-400 mb-2">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show expanded view if a challenge is selected
  if (expandedChallenge && expandedData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        {/* Expanded Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCollapseChallenge}
                className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {expandedData.challenge_details.challenge_name}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <span>{expandedData.challenge_details.from_language}</span>
              <FaLongArrowAltRight className="w-4 h-4" />
              <span>{expandedData.challenge_details.to_language}</span>
            </div>
          </div>
          
          {/* Challenge Text */}
          <div className="mb-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-neutral-700 dark:text-neutral-300">
              "{expandedData.challenge_details.text}"
            </p>
          </div>

          {/* Ranking Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Ranking by:
            </label>
            <div className="relative">
              <select
                value={rankingBy}
                onChange={(e) => setRankingBy(e.target.value as RankingBy)}
                className="appearance-none bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 
                         rounded-lg px-3 py-2 pr-8 text-sm text-neutral-900 dark:text-neutral-100
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="combined">Combined</option>
                <option value="template">Template Only</option>
                <option value="model">Model Only</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Expanded Leaderboard */}
        {expandedLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading detailed rankings...</span>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Rank
                    </th>
                    {(rankingBy === 'combined' || rankingBy === 'template') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Template
                      </th>
                    )}
                    {(rankingBy === 'combined' || rankingBy === 'model') && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Model
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      ELO Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                  {expandedData.arena_ranking
                    .sort((a, b) => b.elo_rating - a.elo_rating)
                    .map((entry, index) => (
                    <tr
                      key={`${entry.template_name || ''}-${entry.model_name || ''}-${index}`}
                      className={`hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200 ${
                        index < 3 ? "bg-gradient-to-r from-yellow-50/30 to-transparent dark:from-yellow-900/10" : ""
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getRankIcon(index + 1)}
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            #{index + 1}
                          </span>
                        </div>
                      </td>

                      {/* Template Name */}
                      {(rankingBy === 'combined' || rankingBy === 'template') && (
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {entry.template_name || 'N/A'}
                          </div>
                        </td>
                      )}

                      {/* Model Name */}
                      {(rankingBy === 'combined' || rankingBy === 'model') && (
                        <td className="px-6 py-4">
                          <div className={`text-sm font-semibold ${getModelColor(entry.model_name || '')}`}>
                            {entry.model_name || 'N/A'}
                          </div>
                        </td>
                      )}

                      {/* ELO Rating */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${getScoreColor(entry.elo_rating, index + 1)}`}>
                            {entry.elo_rating}
                          </span>
                          {index < 3 && (
                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg 
                     bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                     focus:ring-0 focus:ring-primary-500 focus:border-transparent
                     placeholder-neutral-500 dark:placeholder-neutral-400"
          />
        </div>
      </div>

      {/* Arena Rankings Grid */}
      <div className="grid grid-cols-1  gap-6">
        {filteredRankings.map((ranking, index) => (
          <div
            key={`${ranking.challenge_details.challenge_name}-${index}`}
            className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
          >
            {/* Challenge Header */}
            <div className=" from-primary-50 to-primary-100 dark:bg-primary-800/20 p-2 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {ranking.challenge_details.challenge_name}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      {ranking.challenge_details.from_language}
                    </span>
                    <FaLongArrowAltRight className="w-4 h-4" />
                    <span className="flex items-center gap-1">
                      {ranking.challenge_details.to_language}
                    </span>
                  </div>
                  <button
                    onClick={() => handleExpandChallenge(ranking.challenge_details)}
                    className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                    title="Expand detailed leaderboard"
                  >
                    <BiExpandAlt className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  </button>
                </div>
              </div>
              
              {/* Challenge Text Preview */}
              <div className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2 rounded-md">
                  "{ranking.challenge_details.text}"
              </div>
            </div>

            {/* Rankings Table */}
            <div className="py-2">
              <div className="overflow-hidden">
                <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600">
                  <table className="min-w-full">
                    <thead className="sticky top-0 bg-white dark:bg-neutral-800 z-10">
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Template
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
                      {ranking.arena_ranking
                        .sort((a, b) => b.elo_rating - a.elo_rating)
                        .map((entry, entryIndex) => (
                        <tr
                          key={`${entry.template_name}-${entry.model_name}-${entryIndex}`}
                          className={`hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200 ${
                            entryIndex < 3 ? "bg-gradient-to-r from-yellow-50/30 to-transparent dark:from-yellow-900/10" : ""
                          }`}
                        >
                          {/* Rank */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              {getRankIcon(entryIndex + 1)}
                            </div>
                          </td>

                          {/* Template Name */}
                          <td className="px-3 py-3">
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-24">
                              {entry.template_name}
                            </div>
                          </td>

                          {/* Model Name */}
                          <td className="px-3 py-3">
                            <div className={`text-sm font-semibold truncate max-w-20 ${getModelColor(entry.model_name)}`}>
                              {entry.model_name}
                            </div>
                          </td>

                          {/* ELO Rating */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`text-sm font-bold ${getScoreColor(entry.elo_rating, entryIndex + 1)}`}>
                              {entry.elo_rating}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Challenge Stats */}
            {/* <div className="bg-neutral-50 dark:bg-neutral-900 px-4 py-3 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  {ranking.ranking.length} model{ranking.ranking.length !== 1 ? 's' : ''} competing
                </span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  Top score: {Math.max(...ranking.ranking.map(r => r.elo_rating))}
                </span>
              </div>
            </div> */}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRankings.length === 0 && (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            No challenges found
          </h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Try adjusting your search query.
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-primary-500">{rankings.length}</div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Total Challenges</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-green-500">
            {rankings.reduce((sum, r) => sum + r.arena_ranking.length, 0)}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Model Entries</div>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-yellow-500">
            {rankings.length > 0 ? Math.max(...rankings.flatMap(r => r.arena_ranking.map(entry => entry.elo_rating))) : 0}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Highest ELO</div>
        </div>
      </div>
    </div>
  );
};

export default ArenaRanking;
