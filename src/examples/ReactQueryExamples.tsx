import React, { useState } from 'react';
import { useTemplates, useCreateTemplate } from '../hooks/useTemplates';
import { useArenaChallenges, useFilteredArenaChallenges, useCreateArenaChallenge } from '../hooks/useArenaChallenge';
import { useCurrentUser } from '../hooks/useUser';
import { QueryErrorBoundary } from '../components/QueryErrorBoundary';

/**
 * This component demonstrates best practices for using React Query in your app.
 * It shows various patterns like:
 * - Basic data fetching
 * - Conditional queries
 * - Mutations with optimistic updates
 * - Error handling
 * - Loading states
 * - Dependent queries
 */
export function ReactQueryExamples() {
  const [challengeId, setChallengeId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState({
    from_language: 'Tibetan',
    to_language: 'English',
    text_category_id: '',
    challenge_name: ''
  });

  // 1. Basic data fetching with automatic caching and background refetching
  const { data: currentUser, isLoading: userLoading, error: userError } = useCurrentUser();
  
  // 2. Fetch all challenges with loading and error states
  const { 
    data: challenges = [], 
    isLoading: challengesLoading, 
    error: challengesError,
    refetch: refetchChallenges 
  } = useArenaChallenges();

  // 3. Conditional query - only runs when challengeId is provided
  const { 
    data: templates = [], 
    isLoading: templatesLoading, 
    error: templatesError 
  } = useTemplates(challengeId, 1);

  // 4. Filtered query with enabled condition
  const { 
    data: filteredChallenges = [], 
    isLoading: filteredLoading 
  } = useFilteredArenaChallenges(
    searchQuery, 
    !!(searchQuery.to_language || searchQuery.challenge_name) // Only run if we have search criteria
  );

  // 5. Mutations with optimistic updates and error handling
  const createChallengeMutation = useCreateArenaChallenge();
  const createTemplateMutation = useCreateTemplate();

  // 6. Handle form submission with mutation
  const handleCreateChallenge = async () => {
    try {
      await createChallengeMutation.mutateAsync({
        text_category_id: '1',
        from_language: 'Tibetan',
        to_language: 'English',
        challenge_name: 'Example Challenge'
      });
      // Success handling is done automatically by the hook
      console.log('Challenge created successfully!');
    } catch (error) {
      // Error handling
      console.error('Failed to create challenge:', error);
    }
  };

  // 7. Handle template creation
  const handleCreateTemplate = () => {
    if (!challengeId) return;
    
    createTemplateMutation.mutate({
      template_name: 'Example Template',
      template: 'This is an example template: {input}',
      challenge_id: challengeId,
    }, {
      onSuccess: () => {
        console.log('Template created successfully!');
      },
      onError: (error) => {
        console.error('Failed to create template:', error);
      }
    });
  };

  return (
    <QueryErrorBoundary>
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">React Query Examples</h1>

        {/* 1. User Information Section */}
        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
          {userLoading && <div>Loading user...</div>}
          {userError && <div className="text-red-500">Error: {userError.message}</div>}
          {currentUser && (
            <div className="bg-green-50 p-3 rounded">
              <p>Welcome, {currentUser.username}!</p>
              <p>Email: {currentUser.email}</p>
            </div>
          )}
        </section>

        {/* 2. Challenges List */}
        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">
            All Challenges 
            <button 
              onClick={() => refetchChallenges()}
              className="ml-2 px-2 py-1 text-sm bg-blue-500 text-white rounded"
            >
              Refresh
            </button>
          </h2>
          
          {challengesLoading && <div>Loading challenges...</div>}
          {challengesError && (
            <div className="text-red-500">
              Error loading challenges: {challengesError.message}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <div 
                key={challenge.id} 
                className="border p-3 rounded cursor-pointer hover:bg-gray-50"
                onClick={() => setChallengeId(challenge.id)}
              >
                <h3 className="font-medium">{challenge.challenge_name}</h3>
                <p className="text-sm text-gray-600">
                  {challenge.from_language} → {challenge.to_language}
                </p>
                {challengeId === challenge.id && (
                  <span className="text-blue-500 text-sm">Selected</span>
                )}
              </div>
            ))}
          </div>

          {/* Create Challenge Button */}
          <button
            onClick={handleCreateChallenge}
            disabled={createChallengeMutation.isPending}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            {createChallengeMutation.isPending ? 'Creating...' : 'Create Example Challenge'}
          </button>
          
          {createChallengeMutation.error && (
            <div className="mt-2 text-red-500">
              Error: {createChallengeMutation.error.message}
            </div>
          )}
        </section>

        {/* 3. Templates for Selected Challenge */}
        {challengeId && (
          <section className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">
              Templates for Selected Challenge
            </h2>
            
            {templatesLoading && <div>Loading templates...</div>}
            {templatesError && (
              <div className="text-red-500">
                Error: {templatesError.message}
              </div>
            )}
            
            {templates.length === 0 && !templatesLoading && (
              <p className="text-gray-500">No templates found for this challenge.</p>
            )}
            
            <div className="space-y-2">
              {templates.map((template) => (
                <div key={template.template_detail?.id} className="border p-2 rounded">
                  <h4 className="font-medium">{template.template_detail?.template_name}</h4>
                  <p className="text-sm text-gray-600">
                    By: {template.template_detail?.username}
                  </p>
                </div>
              ))}
            </div>

            {/* Create Template Button */}
            <button
              onClick={handleCreateTemplate}
              disabled={createTemplateMutation.isPending}
              className="mt-4 px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
            >
              {createTemplateMutation.isPending ? 'Creating...' : 'Create Example Template'}
            </button>
          </section>
        )}

        {/* 4. Search/Filter Section */}
        <section className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Filtered Challenges</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Challenge name..."
              value={searchQuery.challenge_name}
              onChange={(e) => setSearchQuery(prev => ({ ...prev, challenge_name: e.target.value }))}
              className="border rounded px-3 py-2"
            />
            <select
              value={searchQuery.to_language}
              onChange={(e) => setSearchQuery(prev => ({ ...prev, to_language: e.target.value }))}
              className="border rounded px-3 py-2"
            >
              <option value="">Select target language...</option>
              <option value="English">English</option>
              <option value="Chinese">Chinese</option>
              <option value="Sanskrit">Sanskrit</option>
            </select>
          </div>

          {filteredLoading && <div>Searching...</div>}
          
          <div className="space-y-2">
            {filteredChallenges.map((challenge) => (
              <div key={challenge.id} className="border p-2 rounded bg-blue-50">
                <h4 className="font-medium">{challenge.challenge_name}</h4>
                <p className="text-sm">{challenge.from_language} → {challenge.to_language}</p>
              </div>
            ))}
          </div>
          
          {filteredChallenges.length === 0 && !filteredLoading && (searchQuery.to_language || searchQuery.challenge_name) && (
            <p className="text-gray-500">No challenges match your search criteria.</p>
          )}
        </section>

        {/* 5. React Query Tips */}
        <section className="border rounded-lg p-4 bg-yellow-50">
          <h2 className="text-xl font-semibold mb-4">React Query Benefits You're Getting:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>Automatic Caching:</strong> Data is cached and shared across components</li>
            <li><strong>Background Refetching:</strong> Data stays fresh automatically</li>
            <li><strong>Optimistic Updates:</strong> UI updates immediately, rolls back on error</li>
            <li><strong>Error Handling:</strong> Consistent error states across the app</li>
            <li><strong>Loading States:</strong> Built-in loading indicators</li>
            <li><strong>Retry Logic:</strong> Automatic retries on failure</li>
            <li><strong>Dependent Queries:</strong> Queries that depend on other data</li>
            <li><strong>DevTools:</strong> Inspect queries, mutations, and cache in dev mode</li>
          </ul>
          
          <p className="mt-4 text-sm text-gray-600">
            Open React Query DevTools (bottom-right corner) to see all this in action!
          </p>
        </section>
      </div>
    </QueryErrorBoundary>
  );
}

export default ReactQueryExamples;
