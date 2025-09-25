import { useState, useCallback, useRef } from "react";
import { translateV2 } from "../api/translate";

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

interface TranslateV2State {
  data: TranslateV2Response | null;
  isLoading: boolean;
  error: string | null;
  isComplete: boolean;
}

interface UseTranslateV2Return {
  state: TranslateV2State;
  translate: (templateId: string | null, challengeId: string, inputText: string) => Promise<void>;
  reset: () => void;
  stop: () => void;
}

/**
 * Hook for handling translation using the v2 API endpoint
 */
export function useTranslateV2(): UseTranslateV2Return {
  const [state, setState] = useState<TranslateV2State>({
    data: null,
    isLoading: false,
    error: null,
    isComplete: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isComplete: false,
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
      });

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Call the translate v2 API
      const response = await translateV2(templateId, challengeId, inputText);
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      // Update state with response
      setState({
        data: response,
        isLoading: false,
        error: null,
        isComplete: true,
      });

    } catch (error) {
      // Check if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to translate';
      setState({
        data: null,
        isLoading: false,
        error: errorMessage,
        isComplete: true,
      });
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
