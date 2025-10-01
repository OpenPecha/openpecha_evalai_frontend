import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Languages, Trophy, Eye, Zap, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { arenaApi } from '../api/arena_challenge';
import { LANGUAGES } from '../utils/const';
import type { ArenaChallenge, ArenaChallengeRequest } from '../types/arena_challenge';
import Template from '../components/Template';

const Arena = () => {
  const [challenges, setChallenges] = useState<ArenaChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeChallenge, setActiveChallenge] = useState<ArenaChallenge | null>(null);
  const [judgeOrBattle, setJudgeOrBattle] = useState<string>('');
  
  // Filter states
  const [selectedFromLanguage, setSelectedFromLanguage] = useState<string>('');
  const [selectedToLanguage, setSelectedToLanguage] = useState<string>('');
  const [selectedTextType, setSelectedTextType] = useState<string>('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [hasMorePages, setHasMorePages] = useState<boolean>(true);
  
  // Modal states
  const [selectedChallenge, setSelectedChallenge] = useState<ArenaChallenge | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create challenge form state
  const [createForm, setCreateForm] = useState<ArenaChallengeRequest>({
    text_category_id: '',
    from_language: '',
    to_language: '',
    challenge_name: ''
  });

  // Categories state
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const response = await arenaApi.getChallengesWithPagination({
        from_language: selectedFromLanguage || "",
        to_language: selectedToLanguage || "",
        text_category_id: selectedTextType || "",
        challenge_name: searchText || "",
        page_number: currentPage
      });
      
      setChallenges(response.items);
      setTotalPages(response.total_count); // total_count is the number of pages
      
      // Check if there are more pages
      setHasMorePages(currentPage < response.total_count);
    } catch (error) {
      console.error('Failed to load challenges:', error);
      setChallenges([]);
      setTotalPages(0);
      setHasMorePages(false);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchText, selectedFromLanguage, selectedToLanguage, selectedTextType]);

  // Load challenges on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load challenges when page, search, or filters change
  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const loadCategories = async () => {
    try {
      const categoryData = await arenaApi.getCategories();
      setCategories(categoryData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleCreateChallenge = async () => {
    try {
        console.log("createForm ::: ", createForm);
      const newChallenge = await arenaApi.createChallenge(createForm);
      setSelectedFromLanguage("");
      setSelectedToLanguage("");
      setSelectedTextType("");
      setSearchText("");
      setCurrentPage(1);
      setSelectedChallenge(newChallenge);
      console.log("newChallenge ::: ", newChallenge);
      setShowCreateModal(false);
      setCreateForm({
        text_category_id: '',
        from_language: '',
        to_language: '',
        challenge_name: ''
      });
      // Reload challenges to show the new one
      await loadChallenges();
    } catch (error) {
      console.error('Failed to create challenge:', error);
    }
  };

  const clearFilters = () => {
    setSelectedFromLanguage('');
    setSelectedToLanguage('');
    setSelectedTextType('');
    setSearchText('');
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJudgeOrBattle = (judgeOrBattle: string) => {
    setActiveChallenge(selectedChallenge);
    setJudgeOrBattle(judgeOrBattle);
  };
  
  const backToArena = () => {
    setActiveChallenge(null);
    setSelectedChallenge(null);
  };

  // Get unique values for filter options from categories
  const uniqueLanguages = Array.from(new Set([
    ...LANGUAGES.map(lang => lang.name)
  ]));

  if (activeChallenge) {
    return <Template backToArena={backToArena} challenge={activeChallenge} judgeOrBattle={judgeOrBattle}/>;
  }

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Arena</h1>
              <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                Browse challenges, compete, and judge submissions
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8   flex item-center  gap-2 justify-between">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1); // Reset to first page when search changes
              }}
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex  h-full  flex-wrap gap-4 items-center">
          
            {/* From Language Filter */}
            <select
              value={selectedFromLanguage}
              onChange={(e) => {
                setSelectedFromLanguage(e.target.value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              className="px-3 py-3  border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">From Languages</option>
              {uniqueLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            {/* To Language Filter */}
            <select
              value={selectedToLanguage}
              onChange={(e) => {
                setSelectedToLanguage(e.target.value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              className="px-3 py-3  border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">To Languages</option>
              {uniqueLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            {/* Text Type Filter */}
            <select
              value={selectedTextType}
              onChange={(e) => {
                setSelectedTextType(e.target.value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              className="px-3 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Text Types</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name.toUpperCase()}</option>
              ))}
            </select>

          

            {/* Clear Filters */}
            {(selectedFromLanguage || selectedToLanguage || selectedTextType || searchText) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Challenge Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading challenges...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                onClick={() => setSelectedChallenge(challenge)}
                className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Languages className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      {challenge.from_language} → {challenge.to_language}
                    </span>
                  </div>
                  <Trophy className="w-5 h-5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>

                <div className="mb-4">
                  <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {challenge.text_category}
                  </p>
                </div>

                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                  <h3 className="font-medium text-neutral-900 dark:text-white">
                    {challenge.challenge_name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && challenges.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              No challenges found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Try adjusting your filters or create a new challenge.
            </p>
          </div>
        )}

      </div>

      {/* Pagination Controls - Moved to bottom of page */}
      {!loading && challenges.length > 0 && totalPages > 1 && (
        <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col items-center space-y-4">
              {/* Pagination Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                
                <span className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasMorePages}
                  className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Selection Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-1 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Join Challenge
              </h2>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Languages className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {selectedChallenge.from_language} → {selectedChallenge.to_language}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                {selectedChallenge.text_category}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {selectedChallenge.challenge_name}
              </p>
            </div>

            <div className="space-y-3 flex gap-2">
              <div className="relative group flex-1">
                <button onClick={() => handleJudgeOrBattle('judge')} className="cursor-pointer w-full bg-green-800 hover:bg-green-700 text-white flex items-center justify-center space-x-3 px-4 py-3   font-medium rounded-lg transition-colors duration-200">
                  <Eye className="w-5 h-5" />
                  <span>Review</span>
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  <div className="flex items-center space-x-1">
                    <Info className="w-4 h-4" />
                    <span>Provide a text and compare outputs from models and templates. Vote on the best response.</span>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100"></div>
                </div>
              </div>
              
              <div className="relative group flex-1">
                <button onClick={() => handleJudgeOrBattle('battle')} className=" cursor-pointer w-full flex items-center justify-center space-x-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
                  <Zap className="w-5 h-5" />
                  <span>Contribute</span>
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  <div className="flex items-center space-x-1">
                    <Info className="w-4 h-4" />
                    <span>Create and submit your own template. Compete with other templates to see how different approaches perform.</span>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Create Challenge
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Language Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    From Language
                  </label>
                  <select
                    value={createForm.from_language}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, from_language: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select source language...</option>
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.name}>{lang.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    To Language
                  </label>
                  <select
                    value={createForm.to_language}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, to_language: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select target language...</option>
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.name}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Category
                </label>
                <select
                  value={createForm.text_category_id}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, text_category_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category...</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Challenge Title */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Challenge Title
                </label>
                <input
                  type="text"
                  value={createForm.challenge_name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, challenge_name: e.target.value }))}
                  placeholder="Enter challenge title..."
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChallenge}
                disabled={!createForm.text_category_id || !createForm.challenge_name || !createForm.from_language || !createForm.to_language}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
              >
                Create Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Arena;
