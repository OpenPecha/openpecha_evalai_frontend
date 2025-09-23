import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Languages, FileText, Trophy, Eye, Zap } from 'lucide-react';
import { arenaApi } from '../api/arena_challenge';
import { LANGUAGES } from '../utils/const';
import type { ArenaChallenge, ArenaChallengeRequest } from '../types/arena_challenge';
import Template from '../components/Template';

const Arena = () => {
  const [challenges, setChallenges] = useState<ArenaChallenge[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<ArenaChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeChallenge, setActiveChallenge] = useState<ArenaChallenge | null>(null);
  const [judgeOrBattle, setJudgeOrBattle] = useState<string>('');
  // Filter states
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedTextType, setSelectedTextType] = useState<string>('');
  const [selectedChallengeType, setSelectedChallengeType] = useState<string>('');
  
  // Modal states
  const [selectedChallenge, setSelectedChallenge] = useState<ArenaChallenge | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create challenge form state
  const [createForm, setCreateForm] = useState<ArenaChallengeRequest>({
    text: '',
    from_language: 'Tibetan',
    to_language: 'English',
    challenge_name: ''
  });

  // Load challenges on component mount
  useEffect(() => {
    loadChallenges();
  }, []);

  // Filter challenges when search text changes
  useEffect(() => {
    searchChallenges();
  }, [searchText]);

  // Filter challenges when filters change
  useEffect(() => {
    filterChallenges();
  }, [challenges, selectedLanguage, selectedTextType, selectedChallengeType]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await arenaApi.getChallenges();
      setChallenges(data);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterChallenges = async () => {
    const filtered = await arenaApi.getFilteredChallenge({
      from_language: "Tibetan",
      to_language: selectedLanguage,
      text: selectedTextType,
      challenge_name: selectedChallengeType
    });
    setFilteredChallenges(filtered);
  };


  const searchChallenges = async () => {
    const filtered = await arenaApi.getFilteredChallenge({
      from_language: "Tibetan",
      to_language: "",
      text: "",
      challenge_name: searchText
    })

    setFilteredChallenges(filtered);
  };

  const handleCreateChallenge = async () => {
    try {
        console.log("createForm ::: ", createForm);
      const newChallenge = await arenaApi.createChallenge(createForm);
      setSelectedLanguage("");
      setSelectedTextType("");
      setSelectedChallengeType("");
      setSearchText("");
      setSelectedChallenge(newChallenge);
      console.log("newChallenge ::: ", newChallenge);
      setChallenges(prev => [newChallenge, ...prev]);
      setShowCreateModal(false);
      setCreateForm({
        text: '',
        from_language: 'Tibetan',
        to_language: 'English',
        challenge_name: ''
      });
    } catch (error) {
      console.error('Failed to create challenge:', error);
    }
  };

  const clearFilters = () => {
    setSelectedLanguage('');
    setSelectedTextType('');
    setSelectedChallengeType('');
    setSearchText('');
  };

  const handleJudgeOrBattle = (judgeOrBattle: string) => {
    setActiveChallenge(selectedChallenge);
    setJudgeOrBattle(judgeOrBattle);
  };
  
  const backToArena = () => {
    setActiveChallenge(null);
    setSelectedChallenge(null);
  };

  // Get unique values for filter options
  const uniqueLanguages = Array.from(new Set([
    ...challenges.map(c => c.from_language),
    ...challenges.map(c => c.to_language)
  ]));

  const uniqueTextTypes = Array.from(new Set(
    challenges.map(c => c.text.split(' ')[0]) // Simple text type extraction
  ));

  const uniqueChallengeTypes = Array.from(new Set(
    challenges.map(c => c.challenge_name)
  ));

  if (activeChallenge) {
    return <Template backToArena={backToArena} challenge={activeChallenge} judgeOrBattle={judgeOrBattle}/>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center text-neutral-700 dark:text-neutral-300">
              <Filter className="w-4 h-4 mr-2" />
              <span className="font-medium">Filters:</span>
            </div>

            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Languages</option>
              {uniqueLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            {/* Text Type Filter */}
            <select
              value={selectedTextType}
              onChange={(e) => setSelectedTextType(e.target.value)}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Text Types</option>
              {uniqueTextTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Challenge Type Filter */}
            <select
              value={selectedChallengeType}
              onChange={(e) => setSelectedChallengeType(e.target.value)}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Challenge Types</option>
              {uniqueChallengeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Clear Filters */}
            {(selectedLanguage || selectedTextType || selectedChallengeType || searchText) && (
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
            {filteredChallenges.map((challenge) => (
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
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">Text</span>
                  </div>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {challenge.text}
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

        {!loading && filteredChallenges.length === 0 && (
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
                {selectedChallenge.text}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {selectedChallenge.challenge_name}
              </p>
            </div>

            <div className="space-y-3">
              <button onClick={() => handleJudgeOrBattle('judge')} className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200">
                <Eye className="w-5 h-5" />
                <span>Judge Challenge</span>
              </button>
              
              <button onClick={() => handleJudgeOrBattle('battle')} className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
                <Zap className="w-5 h-5" />
                <span>Battle</span>
              </button>
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
                    disabled={true}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
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
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.name}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Text
                </label>
                <input
                  type="text"
                  value={createForm.text}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Enter the text to be translated..."
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                disabled={!createForm.text || !createForm.challenge_name || !createForm.from_language || !createForm.to_language}
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
