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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ArenaRankingType | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<ArenaRankingType['challenge_details'] | null>(null);
  const [rankingBy, setRankingBy] = useState<RankingBy>('combined');

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const data = await arenaApi.getAllArenaRankings();
        console.log("data arena ranking ::: ", data);
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

  // Open modal with challenge data
  const handleExpandChallenge = async (challenge: ArenaRankingType['challenge_details']) => {
    try {
      setModalLoading(true);
      setSelectedChallenge(challenge);
      setIsModalOpen(true);
      
      // Using challengeIndex as ID since we don't have actual challenge IDs in demo data
      // Map our ranking types to API types
      const apiRankingBy = rankingBy === 'template' ? 'template' : 
                          rankingBy === 'model' ? 'model' : 'combined';
      const data = await arenaApi.getArenaRankingById(challenge.challenge_id, apiRankingBy);
      setModalData(data);
    } catch (err) {
      console.error('Error fetching expanded challenge data:', err);
      setError('Failed to fetch detailed challenge data');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalData(null);
    setSelectedChallenge(null);
  };

  // Refetch modal data when ranking filter changes
  useEffect(() => {
    if (isModalOpen && selectedChallenge && modalData) {
      handleExpandChallenge(selectedChallenge);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rankingBy]);

  // Filter rankings based on search query
  const filteredRankings = rankings.filter(ranking => {
    return ranking.challenge_details.challenge_name.toLowerCase().includes(searchQuery.toLowerCase())
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


  return (
    <div className="max-w-full mx-auto mb-2 pt-2 pb-4 flex w-full  flex-col">
  <input
    type="text"
    placeholder="Search challenges..."
    className="w-[50%] pl-4 pr-4 py-2 my-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-600 transition"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
 

      {/* Arena Rankings Grid */}
      <div className="flex gap-6 pb-3 overflow-x-auto scrollbar-none hover:scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scroll-smooth">
        {filteredRankings.map((ranking, index) => (
          <div
            key={`${ranking.challenge_details.challenge_name}-${index}`}
            className="bg-white min-w-[400px] flex-shrink-0 dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
          >
            {/* Challenge Header */}
            <div className="from-primary-50 to-primary-100 dark:bg-primary-800/20 p-2 border-b border-neutral-200 dark:border-neutral-700">
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
                  {ranking.challenge_details.text_category}
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
                            <div title={entry.template_name} className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-24">
                              {entry.template_name}
                            </div>
                          </td>

                          {/* Model Name */}
                          <td className="px-3 py-3">
                            <div title={entry.model_name} className={`text-sm font-semibold truncate max-w-20 ${getModelColor(entry.model_name)}`}>
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

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <button 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity border-none cursor-default"
            onClick={handleCloseModal}
            onKeyDown={(e) => e.key === 'Escape' && handleCloseModal()}
            aria-label="Close modal"
          ></button>
          
          {/* Modal Content */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <dialog 
              className="relative bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border-none"
              open
              aria-labelledby="modal-title"
            >
              {selectedChallenge && (
                <div className="p-6">
                  {/* Modal Header */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleCloseModal}
                          className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <h1 id="modal-title" className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          {selectedChallenge.challenge_name}
                        </h1>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <span>{selectedChallenge.from_language}</span>
                        <FaLongArrowAltRight className="w-4 h-4" />
                        <span>{selectedChallenge.to_language}</span>
                      </div>
                    </div>
                    
                    {/* Challenge Text */}
                    <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                      <p className="text-neutral-700 dark:text-neutral-300">
                        {selectedChallenge.text_category}
                      </p>
                    </div>

                    {/* Ranking Filter Dropdown */}
                    <div className="flex items-center gap-2">
                      <label htmlFor="ranking-filter" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Ranking by:
                      </label>
                      <div className="relative">
                        <select
                          id="ranking-filter"
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

                  {/* Modal Leaderboard Content */}
                  <div className="max-h-[60vh] overflow-y-auto">
                    {modalLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading detailed rankings...</span>
                      </div>
                    ) : modalData ? (
                      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                            <thead className="bg-neutral-50 dark:bg-neutral-900 sticky top-0">
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
                              {modalData.arena_ranking
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
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-neutral-500 dark:text-neutral-400">No data available</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </dialog>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArenaRanking;
