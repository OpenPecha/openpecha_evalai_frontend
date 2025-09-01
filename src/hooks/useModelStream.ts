import { useState, useCallback, useRef, useEffect } from "react";
import { streamTranslate } from "../api/translate";
import type { ModelStreamState, TranslateRequest } from "../types/translate";

interface UseModelStreamOptions {
  onComplete?: () => void;
  onError?: (error: string) => void;
  onChunk?: (chunk: string) => void;
}

interface UseModelStreamReturn {
  data: string;
  isStreaming: boolean;
  error: string | null;
  isComplete: boolean;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

/**
 * Hook for streaming translation responses from a model
 * Handles the streaming response, text decoding, and state management
 */
export function useModelStream(
  modelId: string,
  payload: TranslateRequest,
  token: string,
  options: UseModelStreamOptions = {}
): UseModelStreamReturn {
  const [state, setState] = useState<ModelStreamState>({
    data: "",
    isStreaming: false,
    error: null,
    isComplete: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const decoderRef = useRef<TextDecoder>(new TextDecoder());

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: "",
      isStreaming: false,
      error: null,
      isComplete: false,
    });
    // Reset decoder to handle new stream
    decoderRef.current = new TextDecoder();
  }, []);

  // Stop streaming
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isStreaming: false,
      isComplete: true,
    }));
  }, []);

  // Start streaming
  const start = useCallback(async () => {
    const currentToken = token;
    const currentModelId = modelId;
    const currentPayload = payload;
    
    if (!currentToken) {
      setState(prev => ({
        ...prev,
        error: "Authentication token required",
        isComplete: true,
      }));
      return;
    }

    if (!currentModelId || !currentPayload.text.trim()) {
      setState(prev => ({
        ...prev,
        error: "Model ID and text are required",
        isComplete: true,
      }));
      return;
    }

    // Reset state and create new abort controller
    reset();
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isStreaming: true,
      error: null,
    }));

    try {
      const response = await streamTranslate(
        currentModelId,
        currentPayload,
        currentToken,
        abortControllerRef.current.signal
      );

      if (!response.body) {
        throw new Error("No response body received");
      }

      const reader = response.body.getReader();
      readerRef.current = reader;

      let accumulatedData = "";
      let buffer = ""; // Buffer for incomplete lines
      let updateTimeout: number | null = null;

      // Read stream chunks
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Clear any pending updates and do final update
          if (updateTimeout) {
            clearTimeout(updateTimeout);
            updateTimeout = null;
          }
          setState(prev => ({
            ...prev,
            data: accumulatedData,
            isStreaming: false,
            isComplete: true,
          }));
          options.onComplete?.();
          break;
        }

        // Decode chunk and add to buffer
        const rawChunk = decoderRef.current.decode(value, { stream: true });
        buffer += rawChunk;

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Skip empty lines
          if (!trimmedLine) continue;
          
          // Parse SSE format: "data: {...}"
          if (trimmedLine.startsWith('data: ')) {
            const jsonStr = trimmedLine.slice(6); // Remove "data: " prefix
            
            try {
              const parsed = JSON.parse(jsonStr);
              
              // Handle chunk data
              if (parsed.chunk && typeof parsed.chunk === 'string') {
                accumulatedData += parsed.chunk;
                
                // Debounce state updates for better performance
                if (updateTimeout) {
                  clearTimeout(updateTimeout);
                }
                updateTimeout = window.setTimeout(() => {
                  setState(prev => ({
                    ...prev,
                    data: accumulatedData,
                  }));
                }, 16); // ~60fps updates

                // Call chunk callback with just the content
                options.onChunk?.(parsed.chunk);
              }
              
              // Handle completion
              if (parsed.complete === true) {
                // Clear any pending updates and do final update
                if (updateTimeout) {
                  clearTimeout(updateTimeout);
                  updateTimeout = null;
                }
                setState(prev => ({
                  ...prev,
                  data: accumulatedData,
                  isStreaming: false,
                  isComplete: true,
                }));
                options.onComplete?.();
                return; // Exit the loop
              }
            } catch (parseError) {
              // Skip invalid JSON lines
              console.warn('Failed to parse SSE chunk:', jsonStr, parseError);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Stream was cancelled, don't treat as error
        setState(prev => ({
          ...prev,
          isStreaming: false,
          isComplete: true,
        }));
        return;
      }

      const errorMessage = error instanceof Error ? error.message : "Stream failed";
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: errorMessage,
        isComplete: true,
      }));
      options.onError?.(errorMessage);
    } finally {
      readerRef.current = null;
      abortControllerRef.current = null;
    }
  }, [reset]); // Only depend on reset function

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    data: state.data,
    isStreaming: state.isStreaming,
    error: state.error,
    isComplete: state.isComplete,
    start,
    stop,
    reset,
  };
}
