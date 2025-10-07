import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useArenaChallenge } from "../hooks/useArenaChallenge";

const ArenaReview: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  

  // React Query hooks
  const { 
    data: challenge, 
    isLoading: challengeLoading, 
    error: challengeError 
  } = useArenaChallenge(challengeId || '');

  // Redirect to /arena if challenge doesn't exist or there's an error
  useEffect(() => {
    if (!challengeLoading && (challengeError || !challenge)) {
      navigate('/arena');
    }
  }, [challengeLoading, challengeError, challenge, navigate]);

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

  // If we reach here, challenge should exist (redirect happens in useEffect)
  if (!challenge) {
    return null; // This shouldn't happen due to redirect, but just in case
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
