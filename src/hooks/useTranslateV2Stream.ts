import { useState, useCallback, useRef } from "react";
import { translateV2Stream } from "../api/translate";

export interface StreamStep {
  step: string;
  data: any;
  status: 'progress' | 'completed' | 'error';
}

export interface TranslateV2Response {
  battle_result_id: string;
  id_1: string;
  template_1_name: string;
  template_2_name: string;
  translation_1: {
    combo_key: string;
    translation: string;
  };
  model_1: string;
  id_2: string;
  translation_2: {
    combo_key: string;
    translation: string;
  };
  model_2: string;
}

interface TranslateV2StreamState {
  data: TranslateV2Response | null;
  isLoading: boolean;
  error: string | null;
  isComplete: boolean;
  currentStep: string | null;
  progressSteps: StreamStep[];
  translation1Progress: StreamStep[];
  translation2Progress: StreamStep[];
  translation1Ready: boolean;
  translation2Ready: boolean;
  individualTranslation1: any | null;
  individualTranslation2: any | null;
}

interface UseTranslateV2StreamReturn {
  state: TranslateV2StreamState;
  translate: (templateId: string | null, challengeId: string, inputText: string) => Promise<void>;
  reset: () => void;
  stop: () => void;
}

/**
 * Hook for handling translation using the v2 streaming API endpoint
 */
export function useTranslateV2Stream(): UseTranslateV2StreamReturn {
  const [state, setState] = useState<TranslateV2StreamState>({
    data: null,
    isLoading: false,
    error: null,
    isComplete: false,
    currentStep: null,
    progressSteps: [],
    translation1Progress: [],
    translation2Progress: [],
    translation1Ready: false,
    translation2Ready: false,
    individualTranslation1: null,
    individualTranslation2: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isComplete: false,
      currentStep: null,
      progressSteps: [],
      translation1Progress: [],
      translation2Progress: [],
      translation1Ready: false,
      translation2Ready: false,
      individualTranslation1: null,
      individualTranslation2: null,
    });
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Stop translation
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(prev => ({ ...prev, isLoading: false, isComplete: true }));
  }, []);

  // Start translation
  const translate = useCallback(async (
    templateId: string | null,
    challengeId: string,
    inputText: string
  ) => {
    try {
      // Reset state and start loading
      setState({
        data: null,
        isLoading: true,
        error: null,
        isComplete: false,
        currentStep: null,
        progressSteps: [],
        translation1Progress: [],
        translation2Progress: [],
        translation1Ready: false,
        translation2Ready: false,
        individualTranslation1: null,
        individualTranslation2: null,
      });

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Handle streaming steps
      const handleStep = (step: StreamStep) => {
        setState(prev => {
          const newProgressSteps = [...prev.progressSteps, step];
          
          // Categorize steps
          let newTranslation1Progress = prev.translation1Progress;
          let newTranslation2Progress = prev.translation2Progress;
          let newTranslation1Ready = prev.translation1Ready;
          let newTranslation2Ready = prev.translation2Ready;
          let newIndividualTranslation1 = prev.individualTranslation1;
          let newIndividualTranslation2 = prev.individualTranslation2;
          
          if (step.step.startsWith('translation_1_')) {
            newTranslation1Progress = [...prev.translation1Progress, step];
            
            // Check for individual translation completion
            if (step.step === 'translation_1_ready' && step.status === 'completed') {
              newTranslation1Ready = true;
              newIndividualTranslation1 = step.data;
            }
          } else if (step.step.startsWith('translation_2_')) {
            newTranslation2Progress = [...prev.translation2Progress, step];
            
            // Check for individual translation completion
            if (step.step === 'translation_2_ready' && step.status === 'completed') {
              newTranslation2Ready = true;
              newIndividualTranslation2 = step.data;
            }
          }
          
          return {
            ...prev,
            currentStep: step.step,
            progressSteps: newProgressSteps,
            translation1Progress: newTranslation1Progress,
            translation2Progress: newTranslation2Progress,
            translation1Ready: newTranslation1Ready,
            translation2Ready: newTranslation2Ready,
            individualTranslation1: newIndividualTranslation1,
            individualTranslation2: newIndividualTranslation2,
          };
        });
      };

      // Handle completion
      const handleComplete = (data: TranslateV2Response) => {
        setState(prev => ({
          ...prev,
          data,
          isLoading: false,
          error: null,
          isComplete: true,
          currentStep: 'completed',
        }));
      };

      // Handle errors
      const handleError = (error: string) => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error,
          isComplete: true,
        }));
      };

      // Call the streaming API
      await translateV2Stream(
        templateId,
        challengeId,
        inputText,
        handleStep,
        handleComplete,
        handleError,
        abortControllerRef.current.signal
      );

    } catch (error) {
      // Check if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to translate';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isComplete: true,
      }));
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  return {
    state,
    translate,
    reset,
    stop,
  };
}
