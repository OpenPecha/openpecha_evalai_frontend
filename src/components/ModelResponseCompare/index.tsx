
import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslateV2Stream } from "../../hooks/useTranslateV2Stream";
import { updateBattleWinner } from "../../api/translate";
import { useToast } from "../use-toast";
import { useAuth } from "../../auth/use-auth-hook";
import TemplateDetailModal from '../TemplateDetailModal';
import ModelPanel from './ModelPanel';
import VotingButtons from './VotingButtons';
import ErrorDisplay from './ErrorDisplay';
import type { 
  ModelResponseCompareProps, 
  SelectedOption 
} from './types';
import {
  getCurrentStepMessage,
  getStepProgress,
  getTranslationStatus,
  getPanelBorderClass,
  convertVoteOptionToResult
} from './utils';

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
  
  // Component state
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

  // Handle voting
  const handleVoteOption = useCallback(async (option: 'left' | 'right' | 'both' | 'none') => {
    if (selectedOption || isVoting || !state.data) return;

    setIsVoting(true);
    try {
      const result = convertVoteOptionToResult(option);
      
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

  // Handle template modal
  const handleTemplateClick = useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowTemplateModal(true);
  }, []);

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

  // Calculate progress for both translations
  const progress1 = getStepProgress(state.translation1Progress);
  const progress2 = getStepProgress(state.translation2Progress);
  const isVotingEnabled = state.data && state.isComplete && !state.error && (state.data?.translation_1?.translation || state.data?.translation_2?.translation);
  return (
    <div className="space-y-6">
      {/* Model panels side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-monlam-2 text-lg">
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
          borderClass={getPanelBorderClass('left', selectedOption, hoveredOption, !!state.error)}
          translation={state.data?.translation_1?.translation}
          individualTranslation={state.individualTranslation1}
          translationReady={state.translation1Ready}
          isLoading={state.isLoading}
          error={state.error}
          currentStepMessage={getCurrentStepMessage('1', state.translation1Progress, state.data?.model_1)}
          stepProgress={progress1}
          translationStatus={getTranslationStatus('1', progress1, progress2)}
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
          borderClass={getPanelBorderClass('right', selectedOption, hoveredOption, !!state.error)}
          translation={state.data?.translation_2?.translation}
          individualTranslation={state.individualTranslation2}
          translationReady={state.translation2Ready}
          isLoading={state.isLoading}
          error={state.error}
          currentStepMessage={getCurrentStepMessage('2', state.translation2Progress, state.data?.model_2)}
          stepProgress={progress2}
          translationStatus={getTranslationStatus('2', progress1, progress2)}
          comboKey={state.data?.translation_2?.combo_key}
          t={t}
        />
      </div>

      {/* Error State */}
      {state.error && (
        <ErrorDisplay 
          error={state.error} 
          onRetry={handleNewTranslation}
        />
      )}

      {/* Centralized Voting Buttons */}
      {isVotingEnabled && (
        <div className="bg-neutral-100 dark:bg-white/5 backdrop-blur-xl border border-neutral-200 dark:border-white/10 rounded-xl p-6 shadow-xl">
          <div className="text-center space-y-4">
            <div className="text-lg font-medium text-neutral-800 dark:text-white">
              {selectedOption ? t('arena.thankYou') : t('arena.whichBetter')}
            </div>
            <VotingButtons
              isAuthenticated={isAuthenticated}
              selectedOption={selectedOption}
              isVoting={isVoting}
              onVote={handleVoteOption}
              onNewTranslation={handleNewTranslation}
              onHoverChange={setHoveredOption}
              t={t}
            />
          </div>
        </div>
      )}

      {/* Voting Status */}
      <div className="text-center space-y-2">
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

