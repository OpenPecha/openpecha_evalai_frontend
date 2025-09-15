import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [votedModel, setVotedModel] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<'left' | 'right' | 'both' | 'none' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<'left' | 'right' | 'both' | 'none' | null>(null);
  const [bothCompleteTime, setBothCompleteTime] = useState<number | null>(null);
  const [comment, setComment] = useState<string>("");
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
      showErrorToast(t('translation.errorVoting'), t('messages.tryAgain'));
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
      
      await voteModel(translationOutput1Id, translationOutput2Id, winnerChoice, responseTimeMs, token, comment);
      setVotedModel(votedModelId);
      setSelectedOption(option);
      showSuccessToast(t('arena.thankYou'), t('translation.voteSubmitted'));
      onComplete?.(votedModelId);
    } catch (error) {
      console.error("Error submitting vote:", error);
      showErrorToast(
        t('translation.errorVoting'),
        error instanceof Error ? error.message : t('translation.errorVoting')
      );
    } finally {
      setIsVoting(false);
    }
  }, [votedModel, isVoting, token, modelA, modelB, dualStream.modelA.translationOutputId, dualStream.modelB.translationOutputId, bothCompleteTime, comment, showSuccessToast, showErrorToast, onComplete]);

  // Handle new translation
  const handleNewTranslation = useCallback(() => {
    setComment(""); // Clear comment for new translation
    onNewTranslation?.();
  }, [onNewTranslation]);

  // Copy content handler
  const handleCopyA = useCallback(async () => {
    if (dualStream.modelA.data) {
      try {
        await navigator.clipboard.writeText(dualStream.modelA.data);
        showSuccessToast(t('translation.copied'), t('translation.copied'));
      } catch {
        showErrorToast(t('translation.copyFailed'), t('translation.unableToCopy'));
      }
    }
  }, [dualStream.modelA.data, showSuccessToast, showErrorToast]);

  const handleCopyB = useCallback(async () => {
    if (dualStream.modelB.data) {
      try {
        await navigator.clipboard.writeText(dualStream.modelB.data);
        showSuccessToast(t('translation.copied'), t('translation.copied'));
      } catch {
        showErrorToast(t('translation.copyFailed'), t('translation.unableToCopy'));
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-[monlam-2] text-lg ">
        {/* Model A Panel */}
        <ModelStreamPanel
          modelId={modelA}
          modelLabel={t('translation.modelA')}
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
          modelLabel={t('translation.modelB')}
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
              {votedModel ? t('arena.thankYou') : t('arena.whichBetter')}
            </div>
            
            {/* Comment Input Field */}
            {!votedModel && (
              <div className="max-w-md mx-auto">
                <label htmlFor="vote-comment" className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                  {t('arena.addComment')}
                </label>
                <textarea
                  id="vote-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('arena.commentPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isVoting}
                />
              </div>
            )}
            
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
                {selectedOption === 'left' ? t('arena.newTranslation') : t('arena.leftBetter')}
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
                {selectedOption === 'both' ? t('arena.newTranslation') : t('arena.itsTie')}
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
                {selectedOption === 'none' ? t('arena.newTranslation') : t('arena.bothBad')}
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
                {selectedOption === 'right' ? t('arena.newTranslation') : t('arena.rightBetter')}
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
            🔄 {t('arena.streaming')}
          </p>
        )}
        
        {bothComplete && !votedModel && !dualStream.modelA.error && !dualStream.modelB.error && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            ✅ {t('arena.translationsComplete')}
          </p>
        )}
        

        {isVoting && (
          <p className="text-sm text-primary-600 dark:text-primary-400">
            ⏳ {t('arena.submittingVote')}
          </p>
        )}
      </div>

     
    </div>
  );
};

export default DualCompare;
