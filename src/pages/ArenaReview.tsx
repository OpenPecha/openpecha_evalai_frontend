import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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


  // Handle back to arena
  const handleBackToArena = () => {
    navigate('/arena');
  };

  // Loading state
  if (challengeLoading|| !challenge) {
    return (
     <Loader/>
    );
  }

  const Chat = React.lazy(() => import('./Chat'));
  
  return (
    <React.Suspense fallback={<Loader />}>
      <Chat 
        selectedTemplate={ undefined} 
        challenge={challenge} 
        onBackToTemplates={()=>{}}
        onBackToArena={handleBackToArena}
        judgeOrBattle="judge"
      />
    </React.Suspense>
  );
};

export default ArenaReview;



export const Loader=()=>{
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading challenge...</span>
    </div>
  );
}
