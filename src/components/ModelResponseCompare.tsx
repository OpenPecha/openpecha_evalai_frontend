import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslateV2 } from "../hooks/useTranslateV2";
import { updateBattleWinner } from "../api/translate";
import { useToast } from "./use-toast";
import { ChevronLeft, ChevronRight, Copy, StopCircle, AlertCircle } from "lucide-react";
import { FaHandshake } from "react-icons/fa";
import { AiOutlineStop } from "react-icons/ai";
import Markdown from 'react-markdown'
import FontSizeControl from './FontSizeControl';


const DEFAULT_STEPS = [
  "Analyzing text…",
  "Searching for commentaries...",
  "Searching for sanskrit text...",
  "Extracting UCCA...",
  "Analyzing UCCA...",
  "Extracting Gloss...",
  "Translating…",
  "Refining wording…",
  "Finalizing translation…",
];




// Custom hook for managing translation steps
const useTranslationSteps = (isLoading: boolean) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(DEFAULT_STEPS[0]);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStepIndex(0);
      setCurrentStep(DEFAULT_STEPS[0]);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % DEFAULT_STEPS.length;
        setCurrentStep(DEFAULT_STEPS[nextIndex]);
        return nextIndex;
      });
    }, 2000); // Change step every 2 seconds

    return () => clearInterval(interval);
  }, [isLoading]);

  return { currentStep, currentStepIndex, totalSteps: DEFAULT_STEPS.length };
};

interface ModelResponseCompareProps {
  templateId: string | null;
  challengeId: string;
  inputText: string;
  onComplete?: (result?: string) => void;
  onNewTranslation?: () => void;
}

const ModelResponseCompare: React.FC<ModelResponseCompareProps> = ({
  templateId,
  challengeId,
  inputText,
  onComplete,
  onNewTranslation,
}) => {
  const { t } = useTranslation();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const { state, translate, reset, stop } = useTranslateV2();
  
  const [selectedOption, setSelectedOption] = useState<'left' | 'right' | 'both' | 'none' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<'left' | 'right' | 'both' | 'none' | null>(null);
  const [leftFontSize, setLeftFontSize] = useState(16);
  const [rightFontSize, setRightFontSize] = useState(16);
  
  // Dynamic translation steps
  const { currentStep, currentStepIndex, totalSteps } = useTranslationSteps(state.isLoading);

  // Auto-start translation when component mounts
  useEffect(() => {
    if (templateId !== undefined && challengeId && inputText) {
      translate(templateId, challengeId, inputText);
    }
  }, [templateId, challengeId, inputText, translate]);

  // Handle voting
  const handleVoteOption = useCallback(async (option: 'left' | 'right' | 'both' | 'none') => {
    if (selectedOption || isVoting || !state.data) return;

    setIsVoting(true);
    try {
      let result: string;
      
      switch (option) {
        case 'left':
          result = 'a';
          break;
        case 'right':
          result = 'b';
          break;
        case 'both':
          result = 'draw';
          break;
        case 'none':
          result = 'both_worst';
          break;
      }
      
      await updateBattleWinner(
        state.data.battle_result_id,
        state.data.id_1,
        state.data.id_2,
        result
      );
      
      setSelectedOption(option);
      showSuccessToast(t('arena.thankYou'), t('translation.voteSubmitted'));
      onComplete?.(result);
    } catch (error) {
      console.error("Error submitting vote:", error);
      showErrorToast(
        t('translation.errorVoting'),
        error instanceof Error ? error.message : t('translation.errorVoting')
      );
    } finally {
      setIsVoting(false);
    }
  }, [selectedOption, isVoting, state.data, showSuccessToast, showErrorToast, onComplete, t]);

  // Handle new translation
  const handleNewTranslation = useCallback(() => {
    setSelectedOption(null);
    reset();
    onNewTranslation?.();
  }, [onNewTranslation, reset]);

  // Copy content handlers
  const handleCopyLeft = useCallback(async () => {
    if (state.data?.translation_1?.translation) {
      try {
        await navigator.clipboard.writeText(state.data.translation_1.translation);
        showSuccessToast(t('translation.copied'), t('translation.copied'));
      } catch {
        showErrorToast(t('translation.copyFailed'), t('translation.unableToCopy'));
      }
    }
  }, [state.data?.translation_1?.translation, showSuccessToast, showErrorToast, t]);

  const handleCopyRight = useCallback(async () => {
    if (state.data?.translation_2.translation) {
      try {
        await navigator.clipboard.writeText(state.data.translation_2.translation);
        showSuccessToast(t('translation.copied'), t('translation.copied'));
      } catch {
        showErrorToast(t('translation.copyFailed'), t('translation.unableToCopy'));
      }
    }
  }, [state.data?.translation_2?.translation, showSuccessToast, showErrorToast, t]);

  // Handle stop translation
  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const getPanelBorderClass = (side: 'left' | 'right') => {
    const isSelected = (side === 'left' && selectedOption === 'left') || 
                     (side === 'right' && selectedOption === 'right') ||
                     selectedOption === 'both';
    const isHovered = hoveredOption === side || hoveredOption === 'both';
    const isRed = hoveredOption === 'none';
    
    if (isSelected) {
      return "border-green-500 dark:border-green-400 bg-green-50/50 dark:bg-green-900/10";
    }
    if (isHovered && !selectedOption) {
      return "border-blue-400 dark:border-blue-300 shadow-lg shadow-blue-200/50 dark:shadow-blue-800/30 bg-blue-50/30 dark:bg-blue-900/20";
    }
    if (isRed && !selectedOption) {
      return "border-red-400 dark:border-red-300 shadow-lg shadow-red-200/50 dark:shadow-red-800/30 bg-red-50/30 dark:bg-red-900/20";
    }
    if (state.error) {
      return "border-red-300 dark:border-red-600";
    }
    return "border-neutral-200 dark:border-neutral-600";
  };

  return (
    <div className="space-y-6">
      {/* Model panels side by side - Always visible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-[monlam-2] text-lg">
        {/* Model 1 Panel */}
        <div className={`bg-white dark:bg-neutral-800 rounded-xl border-2 transition-all duration-200 ${getPanelBorderClass('left')}`}>
          {/* Header */}
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-neutral-700 dark:text-neutral-100">
                  {(selectedOption && state.data) ? state.data.model_1 : t('translation.modelA')}
                  {(selectedOption && state.data) && <TemplateName templateName={state.data?.template_1_name} />}
                </h3>
                {(selectedOption === 'left' || selectedOption === 'both') && (
                  <div className="w-4 h-4 bg-green-600 dark:bg-green-400 rounded-full" />
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Font size control */}
                <FontSizeControl
                  fontSize={leftFontSize}
                  onFontSizeChange={setLeftFontSize}
                  className="mr-2"
                />
                
                {/* Copy button */}
                {state.data?.translation_1?.translation && (
                  <button
                    onClick={handleCopyLeft}
                    className="p-1 text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors"
                    title={t('translation.copyContent')}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
                
                {/* Stop button */}
                {state.isLoading && (
                  <button
                    onClick={handleStop}
                    className="p-1 text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 transition-colors"
                    title="Stop Translation"
                  >
                    <StopCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {state.error ? (
              <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{state.error}</span>
                </div>
              </div>
            ) : (
              <div className="max-h-96 min-h-10 overflow-y-auto text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap scroll-smooth" style={{ fontSize: `${leftFontSize}px` }}>
                {state.data?.translation_1?.translation ? (
                  <div className="break-words">
                    <Markdown>
                    {state.data.translation_1.translation}
                      </Markdown>
                  </div>
                ) : (
                  <div className="text-neutral-400 dark:text-neutral-500 italic">
                    {state.isLoading ? (
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-primary-600 dark:text-primary-400 transition-all duration-300">
                              {currentStep}
                            </span>
                          </div>
                      </div>
                    ) : (
                      'Ready to translate'
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Combo Key Info */}
          {state.data?.translation_1?.combo_key && (
            <div className="px-4 pb-4">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-700/50 rounded px-2 py-1">
                Combination Key: {state.data.translation_1.combo_key}
              </div>
            </div>
          )}
        </div>

        {/* Model 2 Panel */}
        <div className={`bg-white dark:bg-neutral-800 rounded-xl border-2 transition-all duration-200 ${getPanelBorderClass('right')}`}>
          {/* Header */}
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-neutral-700 dark:text-neutral-100">
                  {(selectedOption && state.data) ? state.data.model_2 : t('translation.modelB')}
                  {(selectedOption && state.data) && <TemplateName templateName={state.data?.template_2_name} />}
                </h3>
                {(selectedOption === 'right' || selectedOption === 'both') && (
                  <div className="w-4 h-4 bg-green-600 dark:bg-green-400 rounded-full" />
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Font size control */}
                <FontSizeControl
                  fontSize={rightFontSize}
                  onFontSizeChange={setRightFontSize}
                  className="mr-2"
                />
                
                {/* Copy button */}
                {state.data?.translation_2?.translation && (
                  <button
                    onClick={handleCopyRight}
                    className="p-1 text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors"
                    title={t('translation.copyContent')}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
                
                {/* Stop button */}
                {state.isLoading && (
                  <button
                    onClick={handleStop}
                    className="p-1 text-neutral-500 hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 transition-colors"
                    title="Stop Translation"
                  >
                    <StopCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {state.error ? (
              <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{state.error}</span>
                </div>
              </div>
            ) : (
              <div className="max-h-96 min-h-10 overflow-y-auto text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap scroll-smooth" style={{ fontSize: `${rightFontSize}px` }}>
                {state.data?.translation_2?.translation ? (
                  <div className="break-words">
                    <Markdown>
                    {state.data.translation_2.translation}
                      </Markdown>
                  </div>
                ) : (
                  <div className="text-neutral-400 dark:text-neutral-500 italic">
                    {state.isLoading ? (
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-primary-600 dark:text-primary-400 transition-all duration-300">
                              {currentStep}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      'Ready to translate'
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Combo Key Info */}
          {state.data?.translation_2?.combo_key && (
            <div className="px-4 pb-4">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-700/50 rounded px-2 py-1">
                Combination Key: {state.data.translation_2.combo_key}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error State - Only show if there's an error */}
      {state.error && (
        <div className="bg-white dark:bg-neutral-800 border border-red-300 dark:border-red-600 rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-lg font-medium text-red-700 dark:text-red-300">
              Translation Failed
            </div>
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
            <button
              onClick={handleNewTranslation}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Centralized Voting Buttons - Only show when translation is complete */}
      {state.data && state.isComplete && !state.error && (
          <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
            <div className="text-center space-y-4">
              <div className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                {selectedOption ? t('arena.thankYou') : t('arena.whichBetter')}
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Left is Better */}
                <button
                  onClick={selectedOption === 'left' ? handleNewTranslation : () => handleVoteOption('left')}
                  disabled={isVoting || (selectedOption !== null && selectedOption !== 'left')}
                  onMouseEnter={() => !selectedOption && setHoveredOption('left')}
                  onMouseLeave={() => !selectedOption && setHoveredOption(null)}
                  className={`${
                    selectedOption === 'left' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : (selectedOption !== null && selectedOption !== 'left')
                      ? 'bg-neutral-300 dark:bg-neutral-600' 
                      : 'bg-neutral-600 hover:bg-neutral-700'
                  } ${
                    (selectedOption !== null && selectedOption !== 'left') ? 'opacity-50' : ''
                  } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed hover:shadow-lg flex items-center justify-center gap-2`}
                >
                  <ChevronLeft size={18} />
                  {selectedOption === 'left' ? t('arena.newTranslation') : t('arena.leftBetter')}
                </button>
                
                {/* It's a Tie */}
                <button
                  onClick={selectedOption === 'both' ? handleNewTranslation : () => handleVoteOption('both')}
                  disabled={isVoting || (selectedOption !== null && selectedOption !== 'both')}
                  onMouseEnter={() => !selectedOption && setHoveredOption('both')}
                  onMouseLeave={() => !selectedOption && setHoveredOption(null)}
                  className={`${
                    selectedOption === 'both' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : (selectedOption !== null && selectedOption !== 'both')
                      ? 'bg-neutral-300 dark:bg-neutral-600' 
                      : 'bg-neutral-600 hover:bg-neutral-700'
                  } ${
                    (selectedOption !== null && selectedOption !== 'both') ? 'opacity-50' : ''
                  } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed hover:shadow-lg flex items-center justify-center gap-2`}
                >
                  <FaHandshake size={18} />
                  {selectedOption === 'both' ? t('arena.newTranslation') : t('arena.itsTie')}
                </button>
                
                {/* Both are Bad */}
                <button
                  onClick={selectedOption === 'none' ? handleNewTranslation : () => handleVoteOption('none')}
                  disabled={isVoting || (selectedOption !== null && selectedOption !== 'none')}
                  onMouseEnter={() => !selectedOption && setHoveredOption('none')}
                  onMouseLeave={() => !selectedOption && setHoveredOption(null)}
                  className={`${
                    selectedOption === 'none' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : (selectedOption !== null && selectedOption !== 'none')
                      ? 'bg-neutral-300 dark:bg-neutral-600' 
                      : 'bg-neutral-600 hover:bg-neutral-700'
                  } ${
                    (selectedOption !== null && selectedOption !== 'none') ? 'opacity-50' : ''
                  } text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed hover:shadow-lg flex items-center justify-center gap-2`}
                >
                  <AiOutlineStop size={18} />
                  {selectedOption === 'none' ? t('arena.newTranslation') : t('arena.bothBad')}
                </button>
                
                {/* Right is Better */}
                <button
                  onClick={selectedOption === 'right' ? handleNewTranslation : () => handleVoteOption('right')}
                  disabled={isVoting || (selectedOption !== null && selectedOption !== 'right')}
                  onMouseEnter={() => !selectedOption && setHoveredOption('right')}
                  onMouseLeave={() => !selectedOption && setHoveredOption(null)}
                  className={`${
                    selectedOption === 'right' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : (selectedOption !== null && selectedOption !== 'right')
                      ? 'bg-neutral-300 dark:bg-neutral-600' 
                      : 'bg-neutral-600 hover:bg-neutral-700'
                  } ${
                    (selectedOption !== null && selectedOption !== 'right') ? 'opacity-50' : ''
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
        
        {state.isComplete && !selectedOption && !state.error && (
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

export default ModelResponseCompare;



function TemplateName({ templateName }: { templateName: string | undefined }) {
  return (
    <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-4">
      {templateName}
    </span>
  );
}

