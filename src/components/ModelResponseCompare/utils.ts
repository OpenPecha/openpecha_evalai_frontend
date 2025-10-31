/**
 * Utility functions for ModelResponseCompare components
 */

import type { ProgressStep, StepProgress, TranslationId, TranslationStatus, SelectedOption } from './types';

/**
 * Extracts translation text from individual translation object
 */
export const getIndividualTranslationText = (individualTranslation: unknown): string => {
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

/**
 * Gets the current step message with detailed information
 */
export const getCurrentStepMessage = (
  translationId: TranslationId,
  progress: ProgressStep[],
  modelName?: string
): string => {
  const lastStep = progress[progress.length - 1];
  
  if (!lastStep) return 'Starting translation...';
  
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

/**
 * Gets step progress with detailed information
 */
export const getStepProgress = (progress: ProgressStep[]): StepProgress => {
  const completedSteps = progress.filter(step => step.status === 'completed').length;
  const totalSteps = progress.length;
  
  if (totalSteps === 0) {
    return { current: 0, total: 6, message: 'Starting...' };
  }
  
  return {
    current: completedSteps,
    total: Math.max(totalSteps, 6), // At least 6 steps expected
    message: completedSteps === totalSteps ? 'Complete!' : `Step ${completedSteps}/${totalSteps}`
  };
};

/**
 * Determines which translation is ahead, behind, or equal
 */
export const getTranslationStatus = (
  translationId: TranslationId,
  progress1: StepProgress,
  progress2: StepProgress
): TranslationStatus => {
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

/**
 * Gets the border class for a model panel based on selection and hover state
 */
export const getPanelBorderClass = (
  side: 'left' | 'right',
  selectedOption: SelectedOption,
  hoveredOption: SelectedOption,
  hasError: boolean
): string => {
  const isSelected = (side === 'left' && selectedOption === 'left') || 
                   (side === 'right' && selectedOption === 'right') ||
                   selectedOption === 'both';
  const isHovered = hoveredOption === side || hoveredOption === 'both';
  const isRed = hoveredOption === 'none';
  
  if (isSelected) {
    return "border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20";
  }
  if (isHovered && !selectedOption) {
    return "border-blue-400 shadow-xl shadow-blue-400/30 bg-blue-500/10";
  }
  if (isRed && !selectedOption) {
    return "border-red-400 shadow-xl shadow-red-400/30 bg-red-500/10";
  }
  if (hasError) {
    return "border-red-400 bg-red-500/10";
  }
  return "border-neutral-200 dark:border-neutral-700";
};

/**
 * Converts voting option to result string for API
 */
export const convertVoteOptionToResult = (option: 'left' | 'right' | 'both' | 'none'): string => {
  switch (option) {
    case 'left':
      return 'a';
    case 'right':
      return 'b';
    case 'both':
      return 'draw';
    case 'none':
      return 'both_worst';
  }
};

