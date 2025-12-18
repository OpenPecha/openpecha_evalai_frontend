/**
 * Types and interfaces for ModelResponseCompare components
 */

export type SelectedOption = 'left' | 'right' | 'both' | 'none' | null;

export type TranslationSide = 'left' | 'right';

export type TranslationId = '1' | '2';

export type TranslationStatus = 'ahead' | 'behind' | 'equal';

export interface StepProgress {
  current: number;
  total: number;
  message: string;
}

export interface TranslationData {
  battle_result_id: string;
  id_1: string;
  id_2: string;
  model_1: string;
  model_2: string;
  template_1_name?: string;
  template_2_name?: string;
  translation_1?: {
    translation?: string;
    combo_key?: string;
  };
  translation_2?: {
    translation?: string;
    combo_key?: string;
  };
}

export interface IndividualTranslation {
  translation?: {
    translation?: string;
  } | string;
}

export interface ProgressStep {
  step: string;
  status: 'progress' | 'completed' | 'error';
  message?: string;
}

export interface ModelPanelProps {
  side: TranslationSide;
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
  individualTranslation: IndividualTranslation | null;
  translationReady: boolean;
  isLoading: boolean;
  error: string | null;
  currentStepMessage: string;
  stepProgress: StepProgress;
  translationStatus: TranslationStatus;
  comboKey?: string;
  t: (key: string) => string;
}

export interface ModelResponseCompareProps {
  templateId: string | null;
  challengeId: string;
  inputText: string;
  onComplete?: (result?: string) => void;
  onNewTranslation?: () => void;
}

export interface VotingButtonsProps {
  isAuthenticated: boolean;
  selectedOption: SelectedOption;
  isVoting: boolean;
  onVote: (option: 'left' | 'right' | 'both' | 'none') => void;
  onNewTranslation: () => void;
  onHoverChange: (option: SelectedOption) => void;
  t: (key: string) => string;
}

export interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export interface LoadingIndicatorProps {
  currentStepMessage: string;
  stepProgress: StepProgress;
  translationStatus: TranslationStatus;
}

