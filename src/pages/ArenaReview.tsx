import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useArenaChallenge } from "../hooks/useArenaChallenge";
import type { TemplateDetail } from "../types/template";

const ArenaReview: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  

  // React Query hooks
  const { 
    data: challenge, 
    isLoading: challengeLoading, 
    error: challengeError 
  } = useArenaChallenge(challengeId || '');

  // Handle back to templates
  const handleBackToTemplates = () => {
    setActiveTemplate(null);
  };

  // Handle back to arena
  const handleBackToArena = () => {
    navigate('/arena');
  };

  // Loading state
  if (challengeLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading...</span>
      </div>
    );
  }

  // Error state
  if (challengeError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 dark:text-red-400 mb-2">
          Failed to load challenge
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  // No challenge found
  if (!challenge) {
    return (
      <div className="text-center py-12">
        <div className="text-neutral-500 dark:text-neutral-400 mb-2">
          Challenge not found
        </div>
        <button 
          onClick={handleBackToArena}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          Back to Arena
        </button>
      </div>
    );
  }

  // For review mode, show Chat component directly without template selection
  // Import Chat component dynamically to avoid circular dependencies
  const Chat = React.lazy(() => import('./Chat'));
  
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Chat 
        selectedTemplate={ undefined} 
        challenge={challenge} 
        onBackToTemplates={handleBackToTemplates}
        onBackToArena={handleBackToArena}
        judgeOrBattle="judge"
      />
    </React.Suspense>
  );
};

export default ArenaReview;
