import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useArenaChallenge } from "../hooks/useArenaChallenge";
import { useTemplate } from "../hooks/useTemplates";
import { Loader } from "./ArenaReview";

const ArenaTemplate: React.FC = () => {
  const { challengeId, templateId } = useParams<{ challengeId: string; templateId: string }>();
  const navigate = useNavigate();

  // Fetch challenge and template data
  const { 
    data: challenge, 
    isLoading: challengeLoading, 
    error: challengeError 
  } = useArenaChallenge(challengeId || '');

  const { 
    data: template, 
    isLoading: templateLoading, 
    error: templateError 
  } = useTemplate(templateId || '');

  // Handle back to templates
  const handleBackToTemplates = () => {
    navigate(`/arena/${challengeId}/contribute`);
  };

  // Handle back to arena
  const handleBackToArena = () => {
    navigate('/arena');
  };

  // Loading state
  if (challengeLoading || templateLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading...</span>
      </div>
    );
  }

  // Error state
  if (challengeError || templateError || !challenge || !template) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
            Error Loading Template
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-4">
            Failed to load template or challenge data.
          </p>
          <button
            onClick={handleBackToTemplates}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  // Import Chat component dynamically to avoid circular dependencies
  const Chat = React.lazy(() => import('./Chat'));
  
  return (
    <React.Suspense fallback={<Loader/>}>
      <Chat 
        selectedTemplate={template} 
        challenge={challenge} 
        onBackToTemplates={handleBackToTemplates}
        onBackToArena={handleBackToArena}
        judgeOrBattle="battle"
      />
    </React.Suspense>
  );
};

export default ArenaTemplate;
