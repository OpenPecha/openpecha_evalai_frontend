import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslateV2Stream } from "../hooks/useTranslateV2Stream";
import { updateBattleWinner } from "../api/translate";
import { useToast } from "./use-toast";
import { ChevronLeft, ChevronRight, Copy, StopCircle, AlertCircle } from "lucide-react";
import { FaHandshake } from "react-icons/fa";
import { AiOutlineStop } from "react-icons/ai";
import Markdown from 'react-markdown'
import FontSizeControl from './FontSizeControl';
import { useAuth } from "../auth/use-auth-hook";
import TemplateDetailModal from './TemplateDetailModal';

// Type aliases
type SelectedOption = 'left' | 'right' | 'both' | 'none' | null;

// Reusable ModelPanel component
interface ModelPanelProps {
  side: 'left' | 'right';
  modelName: string;
  templateName?: string;
  templateId?: string;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onCopy: () => void;
  onStop: () => void;
  onTemplateClick: (templateId: string) => void;
  selectedOption: SelectedOption;
  borderClass: string;
  translation: string | undefined;
  individualTranslation: unknown;
  translationReady: boolean;
  isLoading: boolean;
  error: string | null;
  currentStepMessage: string;
  stepProgress: { current: number; total: number; message: string };
  translationStatus: string;
  comboKey?: string;
  t: (key: string) => string;
}

const ModelPanel: React.FC<ModelPanelProps> = ({
  side,
  modelName,
  templateName,
  templateId,
  fontSize,
  onFontSizeChange,
  onCopy,
  onStop,
  onTemplateClick,
  selectedOption,
  borderClass,
  translation,
  individualTranslation,
  translationReady,
  isLoading,
  error,
  currentStepMessage,
  stepProgress,
  translationStatus,
  comboKey,
  t,
}) => {
  const isSelected = selectedOption === side || selectedOption === 'both';
  const hasContent = translation || (translationReady && individualTranslation);

  // Helper function to get individual translation text
  const getIndividualTranslationText = (individualTranslation: unknown): string => {
    if (individualTranslation && typeof individualTranslation === 'object') {
      const translationObj = individualTranslation as { translation?: { translation?: string } | string };
      if (translationObj.translation) {
        if (typeof translationObj.translation === 'string') {
          return translationObj.translation;
        } else if (translationObj.translation.translation) {
          return translationObj.translation.translation;
        }
      }
    }
    return '';
  };

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-xl border-2 transition-all duration-200 ${borderClass}`}>
      {/* Header */}
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-neutral-700 dark:text-neutral-100">
              {modelName}
              {templateName && templateId && (
                <TemplateName 
                  templateName={templateName} 
                  templateId={templateId} 
                  onTemplateClick={onTemplateClick} 
                />
              )}
            </h3>
            {isSelected && (
              <div className="w-4 h-4 bg-green-600 dark:bg-green-400 rounded-full" />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Font size control */}
            <FontSizeControl
              fontSize={fontSize}
              onFontSizeChange={onFontSizeChange}
              className="mr-2"
            />
            
            {/* Copy button */}
            {hasContent && (
              <button
                onClick={onCopy}
                className="p-1 text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors"
                title={t('translation.copyContent')}
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            
            {/* Stop button */}
            {isLoading && (
              <button
                onClick={onStop}
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
        {error ? (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        ) : (
          <div className="max-h-96 min-h-10 overflow-y-auto text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap scroll-smooth" style={{ fontSize: `${fontSize}px` }}>
            {translation ? (
              <div className="break-words">
                <Markdown>
                  {String(translation)}
                </Markdown>
              </div>
            ) : translationReady && individualTranslation ? (
              <div className="break-words">
                <Markdown>
                  {String(getIndividualTranslationText(individualTranslation))}
                </Markdown>
              </div>
            ) : (
              <div className="text-neutral-400 dark:text-neutral-500 italic">
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400 transition-all duration-300">
                        {currentStepMessage}
                      </span>
                      {stepProgress.current > 0 && (
                        <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-2">
                          <span>{stepProgress.message}</span>
                          {translationStatus === 'ahead' && (
                            <span className="text-green-600 dark:text-green-400 font-medium">⚡ Ahead</span>
                          )}
                          {translationStatus === 'behind' && (
                            <span className="text-orange-600 dark:text-orange-400 font-medium">⏳ Behind</span>
                          )}
                        </div>
                      )}
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
      {comboKey && (
        <div className="px-4 pb-4">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-700/50 rounded px-2 py-1">
            Combination Key: {comboKey}
          </div>
        </div>
      )}
    </div>
  );
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
  const { state, translate, reset, stop } = useTranslateV2Stream();
  const { isAuthenticated } = useAuth();
  
  const [selectedOption, setSelectedOption] = useState<SelectedOption>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<SelectedOption>(null);
  const [leftFontSize, setLeftFontSize] = useState(16);
  const [rightFontSize, setRightFontSize] = useState(16);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Auto-start translation when component mounts
  useEffect(() => {
    if (templateId !== undefined && challengeId && inputText) {
      translate(templateId, challengeId, inputText);
    }
  }, [templateId, challengeId, inputText, translate]);

  // Helper function to get current step message with more detail
  const getCurrentStepMessage = (translationId: '1' | '2') => {
    const progress = translationId === '1' ? state.translation1Progress : state.translation2Progress;
    const lastStep = progress[progress.length - 1];
    
    if (!lastStep) return 'Starting translation...';
    
    // Get the model name for context
    const modelName = translationId === '1' ? state.data?.model_1 : state.data?.model_2;
    const modelDisplay = modelName ? `${modelName}` : `Model ${translationId}`;
    
    switch (lastStep.step) {
      case `translation_${translationId}_analysis`:
        return lastStep.status === 'progress' 
          ? `Analyzing template requirements for ${modelDisplay}...` 
          : `Template analysis complete for ${modelDisplay}`;
      case `translation_${translationId}_commentaries`:
        return lastStep.status === 'progress' 
          ? `Fetching commentaries and sanskrit for ${modelDisplay}...` 
          : `Commentaries loaded for ${modelDisplay}`;
      case `translation_${translationId}_ucca`:
        return lastStep.status === 'progress' 
          ? `Generating UCCA interpretation for ${modelDisplay}...` 
          : `UCCA generated for ${modelDisplay}`;
      case `translation_${translationId}_gloss`:
        return lastStep.status === 'progress' 
          ? `Generating glossary for ${modelDisplay}...` 
          : `Glossary generated for ${modelDisplay}`;
      case `translation_${translationId}_payload`:
        return lastStep.status === 'progress' 
          ? `Preparing translation payload for ${modelDisplay}...` 
          : `Payload ready for ${modelDisplay}`;
      case `translation_${translationId}_generation`:
        return lastStep.status === 'progress' 
          ? `Generating translation with ${modelDisplay}...` 
          : `Translation complete for ${modelDisplay}`;
      default:
        return `Processing with ${modelDisplay}...`;
    }
  };

  // Helper function to get step progress with more detail
  const getStepProgress = (translationId: '1' | '2') => {
    const progress = translationId === '1' ? state.translation1Progress : state.translation2Progress;
    const completedSteps = progress.filter(step => step.status === 'completed').length;
    const totalSteps = progress.length;
    
    if (totalSteps === 0) return { current: 0, total: 6, message: 'Starting...' };
    
    return {
      current: completedSteps,
      total: Math.max(totalSteps, 6), // At least 6 steps expected
      message: completedSteps === totalSteps ? 'Complete!' : `Step ${completedSteps}/${totalSteps}`
    };
  };

  // Helper function to determine which translation is ahead
  const getTranslationStatus = (translationId: '1' | '2') => {
    const progress1 = getStepProgress('1');
    const progress2 = getStepProgress('2');
    
    if (translationId === '1') {
      if (progress1.current > progress2.current) return 'ahead';
      if (progress1.current < progress2.current) return 'behind';
      return 'equal';
    } else {
      if (progress2.current > progress1.current) return 'ahead';
      if (progress2.current < progress1.current) return 'behind';
      return 'equal';
    }
  };


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

  // Handle template click
  const handleTemplateClick = useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowTemplateModal(true);
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setShowTemplateModal(false);
    setSelectedTemplateId(null);
  }, []);

  // Copy content handlers
  const handleCopyLeft = useCallback(async () => {
    const textToCopy = state.data?.translation_1?.translation || 
                      (state.translation1Ready && state.individualTranslation1?.translation);
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        showSuccessToast(t('translation.copied'), t('translation.copied'));
      } catch {
        showErrorToast(t('translation.copyFailed'), t('translation.unableToCopy'));
      }
    }
  }, [state.data?.translation_1?.translation, state.translation1Ready, state.individualTranslation1, showSuccessToast, showErrorToast, t]);

  const handleCopyRight = useCallback(async () => {
    const textToCopy = state.data?.translation_2?.translation || 
                      (state.translation2Ready && state.individualTranslation2?.translation);
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        showSuccessToast(t('translation.copied'), t('translation.copied'));
      } catch {
        showErrorToast(t('translation.copyFailed'), t('translation.unableToCopy'));
      }
    }
  }, [state.data?.translation_2?.translation, state.translation2Ready, state.individualTranslation2, showSuccessToast, showErrorToast, t]);

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
        <ModelPanel
          side="left"
          modelName={(selectedOption && state.data) ? state.data.model_1 : t('translation.modelA')}
          templateName={state.data?.template_1_name}
          templateId={state.data?.id_1}
          fontSize={leftFontSize}
          onFontSizeChange={setLeftFontSize}
          onCopy={handleCopyLeft}
          onStop={handleStop}
          onTemplateClick={handleTemplateClick}
          selectedOption={selectedOption}
          borderClass={getPanelBorderClass('left')}
          translation={state.data?.translation_1?.translation}
          individualTranslation={state.individualTranslation1}
          translationReady={state.translation1Ready}
          isLoading={state.isLoading}
          error={state.error}
          currentStepMessage={getCurrentStepMessage('1')}
          stepProgress={getStepProgress('1')}
          translationStatus={getTranslationStatus('1')}
          comboKey={state.data?.translation_1?.combo_key}
          t={t}
        />
        
        {/* Model 2 Panel */}
        <ModelPanel
          side="right"
          modelName={(selectedOption && state.data) ? state.data.model_2 : t('translation.modelB')}
          templateName={state.data?.template_2_name}
          templateId={state.data?.id_2}
          fontSize={rightFontSize}
          onFontSizeChange={setRightFontSize}
          onCopy={handleCopyRight}
          onStop={handleStop}
          onTemplateClick={handleTemplateClick}
          selectedOption={selectedOption}
          borderClass={getPanelBorderClass('right')}
          translation={state.data?.translation_2?.translation}
          individualTranslation={state.individualTranslation2}
          translationReady={state.translation2Ready}
          isLoading={state.isLoading}
          error={state.error}
          currentStepMessage={getCurrentStepMessage('2')}
          stepProgress={getStepProgress('2')}
          translationStatus={getTranslationStatus('2')}
          comboKey={state.data?.translation_2?.combo_key}
          t={t}
        />
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

             {isAuthenticated? 
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
              </div>:
               <div className="flex flex-col items-center justify-center bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center max-w-lg mx-auto">
               <span className="mb-2 text-amber-700 dark:text-amber-300 font-semibold flex items-center justify-center gap-2">
                 <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                 Login required
               </span>
               <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                 You need to <a href="/login" className="text-primary-600 dark:text-primary-400 underline font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors">log in</a> to vote and compare model translations.
               </p>
               <a
                 href="/login"
                 className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
               >
                 Log in to Vote
               </a>
             </div>
           
              }
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

      {/* Template Detail Modal */}
      <TemplateDetailModal
        isOpen={showTemplateModal}
        onClose={handleModalClose}
        templateId={selectedTemplateId}
      />
    </div>
  );
};

export default ModelResponseCompare;



function TemplateName({ 
  templateName, 
  templateId, 
  onTemplateClick 
}: Readonly<{ 
  templateName: string | undefined;
  templateId: string | undefined;
  onTemplateClick: (templateId: string) => void;
}>) {
  const handleClick = () => {
    if (templateId) {
      onTemplateClick(templateId);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="text-xs text-blue-600 dark:text-blue-400 ml-4 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors cursor-pointer"
      title="Click to view template details"
    >
      {templateName}
    </button>
  );
}

