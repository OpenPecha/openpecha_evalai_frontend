import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useDualModelStream } from "../hooks/useDualModelStream";
import ModelStreamPanel from "./ModelStreamPanel";
import { voteModel } from "../api/translate";
import { useToast } from "./use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaHandshake } from "react-icons/fa";
import { AiOutlineStop } from "react-icons/ai";
import type { TranslateRequest } from "../types/translate";

interface DualCompareProps {
  modelA: string;
  modelB: string;
  payload: TranslateRequest;
  token: string;
  onComplete?: (selectedModel?: string) => void;
  onNewTranslation?: () => void;
}

const DualCompare: React.FC<DualCompareProps> = ({
  modelA,
  modelB,
  payload,
  token,
  onComplete,
  onNewTranslation,
}) => {
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [votedModel, setVotedModel] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<'left' | 'right' | 'both' | 'none' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<'left' | 'right' | 'both' | 'none' | null>(null);
  const [bothCompleteTime, setBothCompleteTime] = useState<number | null>(null);
  const hasStartedRef = useRef(false);

  // Stable error handlers to prevent infinite re-renders
  const handleModelAError = useCallback((error: string) => {
    console.error(`Model A (${modelA}) error:`, error);
  }, [modelA]);

  const handleModelBError = useCallback((error: string) => {
    console.error(`Model B (${modelB}) error:`, error);
  }, [modelB]);

  // Memoize the options object to prevent infinite re-renders
  const dualStreamOptions = useMemo(() => ({
    onModelAError: handleModelAError,
    onModelBError: handleModelBError,
    onBothComplete: () => {
      if (!bothCompleteTime && !votedModel) {
        setBothCompleteTime(Date.now());
      }
    },
  }), [handleModelAError, handleModelBError, bothCompleteTime, votedModel]);

  // Extract target language from payload or use default
  const targetLanguage = payload.target_language || 'en';
  
  // Dual stream hook for both models using same job ID
  const dualStream = useDualModelStream(modelA, modelB, payload, targetLanguage, token, dualStreamOptions);

  // Dummy score handler (not used since hideRating is true)
  const handleScore = useCallback(() => {
    // No-op since we use centralized voting buttons
  }, []);

  // Auto-start streaming when component mounts  
  useEffect(() => {
    if (token && modelA && modelB && payload.text && !hasStartedRef.current) {
      hasStartedRef.current = true;
      dualStream.start();
    }
  }, [token, modelA, modelB, payload.text, dualStream.start]); // Include start function but use ref to prevent multiple calls

  // Handle voting with new API format
  const handleVoteOption = useCallback(async (option: 'left' | 'right' | 'both' | 'none') => {
    if (votedModel || isVoting) return; // Already voted or currently voting

    // Get translation output IDs from both streams
    const translationOutput1Id = dualStream.modelA.translationOutputId;
    const translationOutput2Id = dualStream.modelB.translationOutputId;
    
    if (!translationOutput1Id || !translationOutput2Id) {
      showErrorToast("Vote Failed", "Translation output IDs not available. Please try again.");
      return;
    }

    // Calculate response time
    const responseTimeMs = bothCompleteTime ? Date.now() - bothCompleteTime : 0;

    setIsVoting(true);
    try {
      let winnerChoice: "output1" | "output2" | "tie" | "neither";
      let votedModelId: string;
      
      switch (option) {
        case 'left':
          winnerChoice = 'output1';
          votedModelId = modelA;
          break;
        case 'right':
          winnerChoice = 'output2';
          votedModelId = modelB;
          break;
        case 'both':
          winnerChoice = 'tie';
          votedModelId = 'both';
          break;
        case 'none':
          winnerChoice = 'neither';
          votedModelId = 'none';
          break;
      }
      
      await voteModel(translationOutput1Id, translationOutput2Id, winnerChoice, responseTimeMs, token);
      setVotedModel(votedModelId);
      setSelectedOption(option);
      showSuccessToast("Thank you!", "Your vote has been recorded.");
      onComplete?.(votedModelId);
    } catch (error) {
      console.error("Error submitting vote:", error);
      showErrorToast(
        "Vote Failed",
        error instanceof Error ? error.message : "Failed to submit vote"
      );
    } finally {
      setIsVoting(false);
    }
  }, [votedModel, isVoting, token, modelA, modelB, dualStream.modelA.translationOutputId, dualStream.modelB.translationOutputId, bothCompleteTime, showSuccessToast, showErrorToast, onComplete]);

  // Handle new translation
  const handleNewTranslation = useCallback(() => {
    onNewTranslation?.();
  }, [onNewTranslation]);

  // Copy content handler
  const handleCopyA = useCallback(async () => {
    if (dualStream.modelA.data) {
      try {
        await navigator.clipboard.writeText(dualStream.modelA.data);
        showSuccessToast("Copied!", "Content copied to clipboard");
      } catch {
        showErrorToast("Copy Failed", "Unable to copy to clipboard");
      }
    }
  }, [dualStream.modelA.data, showSuccessToast, showErrorToast]);

  const handleCopyB = useCallback(async () => {
    if (dualStream.modelB.data) {
      try {
        await navigator.clipboard.writeText(dualStream.modelB.data);
        showSuccessToast("Copied!", "Content copied to clipboard");
      } catch {
        showErrorToast("Copy Failed", "Unable to copy to clipboard");
      }
    }
  }, [dualStream.modelB.data, showSuccessToast, showErrorToast]);


  const bothComplete = dualStream.areBothComplete;
  const anyStreaming = dualStream.isAnyStreaming;

  // Track when both translations complete to start response time timer
  useEffect(() => {
    if (bothComplete && !bothCompleteTime && !votedModel) {
      setBothCompleteTime(Date.now());
    }
  }, [bothComplete, bothCompleteTime, votedModel]);

  return (
    <div className="space-y-6">
      {/* Model panels side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model A Panel */}
        <ModelStreamPanel
          modelId={modelA}
          modelLabel="Model A"
          content={dualStream.modelA.data}
          isStreaming={dualStream.modelA.isStreaming}
          error={dualStream.modelA.error}
          isComplete={dualStream.modelA.isComplete}
          onStop={dualStream.stop}
          onScore={handleScore}
          disabled={votedModel !== null && votedModel !== modelA}
          voted={votedModel === modelA}
          anyVoted={votedModel !== null}
          hideRating={true}
          hoverEffect={
            hoveredOption === 'left' || hoveredOption === 'both' 
              ? 'shiny' 
              : hoveredOption === 'none' ? 'red' : null
          }
          onCopy={handleCopyA}
        />

        {/* Model B Panel */}
        <ModelStreamPanel
          modelId={modelB}
          modelLabel="Model B"
          content={dualStream.modelB.data}
          isStreaming={dualStream.modelB.isStreaming}
          error={dualStream.modelB.error}
          isComplete={dualStream.modelB.isComplete}
          onStop={dualStream.stop}
          onScore={handleScore}
          disabled={votedModel !== null && votedModel !== modelB}
          voted={votedModel === modelB}
          anyVoted={votedModel !== null}
          hideRating={true}
          hoverEffect={
            hoveredOption === 'right' || hoveredOption === 'both' 
              ? 'shiny' 
              : hoveredOption === 'none' ? 'red' : null
          }
          onCopy={handleCopyB}
        />
      </div>

      {/* Centralized Voting Buttons */}
      {bothComplete && !dualStream.modelA.error && !dualStream.modelB.error && (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
              {votedModel ? "Thank you for your feedback!" : "Which response is better?"}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Left is Better */}
              <button
                onClick={selectedOption === 'left' ? handleNewTranslation : () => handleVoteOption('left')}
                disabled={isVoting || (votedModel && selectedOption !== 'left')}
                onMouseEnter={() => !votedModel && setHoveredOption('left')}
                onMouseLeave={() => !votedModel && setHoveredOption(null)}
                className={`${
                  selectedOption === 'left' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : (votedModel && selectedOption && selectedOption !== 'left')
                    ? 'bg-neutral-300 dark:bg-neutral-600' 
                    : 'bg-neutral-600 hover:bg-neutral-700'
                } ${
                  (votedModel && selectedOption && selectedOption !== 'left') ? 'opacity-50' : ''
                } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed hover:shadow-lg flex items-center justify-center gap-2`}
              >
                <ChevronLeft size={18} />
                {selectedOption === 'left' ? 'New Translation' : 'Left is Better'}
              </button>
              
              {/* It's a Tie */}
              <button
                onClick={selectedOption === 'both' ? handleNewTranslation : () => handleVoteOption('both')}
                disabled={isVoting || (votedModel && selectedOption !== 'both')}
                onMouseEnter={() => !votedModel && setHoveredOption('both')}
                onMouseLeave={() => !votedModel && setHoveredOption(null)}
                className={`${
                  selectedOption === 'both' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : (votedModel && selectedOption && selectedOption !== 'both')
                    ? 'bg-neutral-300 dark:bg-neutral-600' 
                    : 'bg-neutral-600 hover:bg-neutral-700'
                } ${
                  (votedModel && selectedOption && selectedOption !== 'both') ? 'opacity-50' : ''
                } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed hover:shadow-lg flex items-center justify-center gap-2`}
              >
                <FaHandshake size={18} />
                {selectedOption === 'both' ? 'New Translation' : "It's a Tie"}
              </button>
              
              {/* Both are Bad */}
              <button
                onClick={selectedOption === 'none' ? handleNewTranslation : () => handleVoteOption('none')}
                disabled={isVoting || (votedModel && selectedOption !== 'none')}
                onMouseEnter={() => !votedModel && setHoveredOption('none')}
                onMouseLeave={() => !votedModel && setHoveredOption(null)}
                className={`${
                  selectedOption === 'none' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : (votedModel && selectedOption && selectedOption !== 'none')
                    ? 'bg-neutral-300 dark:bg-neutral-600' 
                    : 'bg-neutral-600 hover:bg-neutral-700'
                } ${
                  (votedModel && selectedOption && selectedOption !== 'none') ? 'opacity-50' : ''
                } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed hover:shadow-lg flex items-center justify-center gap-2`}
              >
                <AiOutlineStop size={18} />
                {selectedOption === 'none' ? 'New Translation' : 'Both are Bad'}
              </button>
              
              {/* Right is Better */}
              <button
                onClick={selectedOption === 'right' ? handleNewTranslation : () => handleVoteOption('right')}
                disabled={isVoting || (votedModel && selectedOption !== 'right')}
                onMouseEnter={() => !votedModel && setHoveredOption('right')}
                onMouseLeave={() => !votedModel && setHoveredOption(null)}
                className={`${
                  selectedOption === 'right' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : (votedModel && selectedOption && selectedOption !== 'right')
                    ? 'bg-neutral-300 dark:bg-neutral-600' 
                    : 'bg-neutral-600 hover:bg-neutral-700'
                } ${
                  (votedModel && selectedOption && selectedOption !== 'right') ? 'opacity-50' : ''
                } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed hover:shadow-lg flex items-center justify-center gap-2`}
              >
                {selectedOption === 'right' ? 'New Translation' : 'Right is Better'}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status and instructions */}
      <div className="text-center space-y-2">
        {anyStreaming && (
          <p className="text-sm text-primary-600 dark:text-primary-400">
            🔄 Streaming responses from both models...
          </p>
        )}
        
        {bothComplete && !votedModel && !dualStream.modelA.error && !dualStream.modelB.error && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            ✅ Both translations complete. Choose your preference above to continue.
          </p>
        )}
        

        {isVoting && (
          <p className="text-sm text-primary-600 dark:text-primary-400">
            ⏳ Submitting your vote...
          </p>
        )}
      </div>

     
    </div>
  );
};

export default DualCompare;
