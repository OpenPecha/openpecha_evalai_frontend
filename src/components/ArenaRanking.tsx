import React, { useState } from "react";
import { Trophy, Medal, Award, Search, X, ChevronDown } from "lucide-react";
import { FaLongArrowAltRight } from "react-icons/fa";
import { BiExpandAlt } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import { useAllArenaRankings, useArenaRankingById } from "../hooks/useArenaChallenge";
import type { ArenaRanking as ArenaRankingType } from "../types/arena_challenge";
import MattricHelper from "./MattricHelper";

interface ArenaRankingProps {
  compact?: boolean;
}

type RankingBy = 'combined' | 'template' | 'model';

const ArenaRanking: React.FC<ArenaRankingProps> = () => {
  useTranslation(); // For future i18n support
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<ArenaRankingType['challenge_details'] | null>(null);
  const [rankingBy, setRankingBy] = useState<RankingBy>('model'); // Changed from 'combined' to 'model'

  // React Query hooks
  const { 
    data: rankings = [], 
    isLoading: loading, 
    error: rankingsError 
  } = useAllArenaRankings();

  // Map rankingBy to API parameter
  const getApiRankingBy = (rankingBy: RankingBy): 'combined' | 'template' | 'model' => {
    switch (rankingBy) {
      case 'template': return 'template';
      case 'model': return 'model';
      default: return 'combined';
    }
  };

  const { 
    data: modalData, 
    isLoading: modalLoading, 
    error: modalError 
  } = useArenaRankingById(
    selectedChallenge?.challenge_id || '', 
    getApiRankingBy(rankingBy),
    isModalOpen && !!selectedChallenge
  );

  // Open modal with challenge data
  const handleExpandChallenge = (challenge: ArenaRankingType['challenge_details']) => {
    setSelectedChallenge(challenge);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedChallenge(null);
  };

  // Render modal content based on loading/error state
  const renderModalContent = () => {
    if (modalLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading detailed rankings...</span>
        </div>
      );
    }
    
    if (modalError) {
      return (
        <div className="text-center py-12">
          <div className="text-red-500 dark:text-red-400 mb-2">
            Failed to fetch detailed challenge data
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      );
    }
    
    if (modalData) {
      return (
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
                    <MattricHelper metric="ELO" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                {(() => {
                  const sortedModalRankings = [...modalData.arena_ranking].sort((a, b) => b.elo_rating - a.elo_rating);
                  return sortedModalRankings.map((entry, index) => (
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
                        <span className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          #{index + 1}
                        </span>
                      </div>
                    </td>

                    {/* Template Name */}
                    {(rankingBy === 'combined' || rankingBy === 'template') && (
                      <td className="px-6 py-4">
                        <div className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {entry.template_name || 'N/A'}
                        </div>
                      </td>
                    )}

                    {/* Model Name */}
                    {(rankingBy === 'combined' || rankingBy === 'model') && (
                      <td className="px-6 py-4">
                        <div className={`text-xs sm:text-sm font-semibold ${getModelColor(entry.model_name || '')}`}>
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
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    
    return (
      <div className="text-center py-12">
        <div className="text-neutral-500 dark:text-neutral-400">No data available</div>
      </div>
    );
  };

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
          <span className="w-5 h-5 flex items-center justify-center text-neutral-600 dark:text-neutral-300 font-semibold text-xs sm:text-sm">
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

  if (rankingsError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 dark:text-red-400 mb-2">
          Failed to fetch arena rankings
        </div>
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
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 my-4">
        <input
          type="text"
          placeholder="Search Arena..."
          className="flex-1 pl-4 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-600 transition"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
     
      </div>

      {/* Arena Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-3">
        {filteredRankings.map((ranking, index) => (
          <div
            key={`${ranking.challenge_details.challenge_name}-${index}`}
            className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
          >
            {/* Challenge Header */}
            <div className="from-primary-50 to-primary-100 dark:bg-primary-800/20 p-3 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {ranking.challenge_details.challenge_name}
                </h3>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
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
              <div className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2 rounded-md mt-2">
                  {ranking.challenge_details.text_category}
              </div>
            </div>

            {/* Rankings Table */}
            <div className="py-2">
              <div className="overflow-hidden">
                <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white dark:bg-neutral-800 z-10">
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          #
                        </th>
                        {(rankingBy === 'combined' || rankingBy === 'template') && (
                          <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                            Template
                          </th>
                        )}
                        {(rankingBy === 'combined' || rankingBy === 'model') && (
                          <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                            Model
                          </th>
                        )}
                        <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          ELO
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                      {(() => {
                        const sortedRankings = [...ranking.arena_ranking].sort((a, b) => b.elo_rating - a.elo_rating);
                        return sortedRankings.map((entry, entryIndex) => (
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
                          {(rankingBy === 'combined' || rankingBy === 'template') && (
                            <td className="px-3 py-3">
                              <div title={entry.template_name} className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                {entry.template_name}
                              </div>
                            </td>
                          )}

                          {/* Model Name */}
                          {(rankingBy === 'combined' || rankingBy === 'model') && (
                            <td className="px-3 py-3">
                              <div title={entry.model_name} className={`text-xs sm:text-sm font-semibold truncate ${getModelColor(entry.model_name)}`}>
                                {entry.model_name}
                              </div>
                            </td>
                          )}

                          {/* ELO Rating */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`text-xs sm:text-sm font-bold ${getScoreColor(entry.elo_rating, entryIndex + 1)}`}>
                              {entry.elo_rating}
                            </span>
                          </td>
                        </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Challenge Stats */}
            {/* <div className="bg-neutral-50 dark:bg-neutral-900 px-4 py-3 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between text-xs sm:text-sm">
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
          <h3 className="mt-2 text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100">
            No challenges found
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
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
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
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

               
                  </div>

                  {/* Modal Leaderboard Content */}
                  <div className="max-h-[60vh] overflow-y-auto">
                    {renderModalContent()}
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
