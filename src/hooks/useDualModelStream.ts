import { useState, useCallback, useRef } from "react";
import { streamDualTranslate } from "../api/translate";
import type { TranslateRequest, ModelStreamState } from "../types/translate";

interface UseDualModelStreamOptions {
  onModelAChunk?: (chunk: string) => void;
  onModelBChunk?: (chunk: string) => void;
  onModelAComplete?: () => void;
  onModelBComplete?: () => void;
  onModelAError?: (error: string) => void;
  onModelBError?: (error: string) => void;
  onBothComplete?: () => void;
}

interface UseDualModelStreamReturn {
  modelA: ModelStreamState;
  modelB: ModelStreamState;
  start: () => void;
  stop: () => void;
  reset: () => void;
  isAnyStreaming: boolean;
  areBothComplete: boolean;
}

/**
 * Hook for streaming translation responses from two models simultaneously
 * Uses a single job ID for both streams to ensure proper session tracking
 */
export function useDualModelStream(
  modelAId: string,
  modelBId: string,
  payload: TranslateRequest,
  token: string,
  options: UseDualModelStreamOptions = {}
): UseDualModelStreamReturn {
  
  const [modelA, setModelA] = useState<ModelStreamState>({
    data: "",
    isStreaming: false,
    error: null,
    isComplete: false,
    translationOutputId: undefined,
  });

  const [modelB, setModelB] = useState<ModelStreamState>({
    data: "",
    isStreaming: false,
    error: null,
    isComplete: false,
    translationOutputId: undefined,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const decoderRef = useRef<TextDecoder>(new TextDecoder());

  // Reset state
  const reset = useCallback(() => {
    setModelA({
      data: "",
      isStreaming: false,
      error: null,
      isComplete: false,
      translationOutputId: undefined,
    });
    setModelB({
      data: "",
      isStreaming: false,
      error: null,
      isComplete: false,
      translationOutputId: undefined,
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
    setModelA(prev => ({ ...prev, isStreaming: false, isComplete: true }));
    setModelB(prev => ({ ...prev, isStreaming: false, isComplete: true }));
  }, []);

  // Start streaming
  const start = useCallback(async () => {
    const currentToken = token;
    const currentModelAId = modelAId;
    const currentModelBId = modelBId;

    if (!currentToken || !currentModelAId || !currentModelBId) {
      const error = "Missing required parameters for dual streaming";
      setModelA(prev => ({ ...prev, error, isStreaming: false }));
      setModelB(prev => ({ ...prev, error, isStreaming: false }));
      options.onModelAError?.(error);
      options.onModelBError?.(error);
      return;
    }

    try {
      // Reset state
      reset();
      
      // Set streaming state
      setModelA(prev => ({ ...prev, isStreaming: true }));
      setModelB(prev => ({ ...prev, isStreaming: true }));

      // Create abort controller
      abortControllerRef.current = new AbortController();

      // Start dual streaming
      const response = await streamDualTranslate(
        currentModelAId,
        currentModelBId,
        payload,
        currentToken,
        abortControllerRef.current.signal
      );

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      readerRef.current = reader;

      // Track accumulated data for each model
      let accumulatedDataA = "";
      let accumulatedDataB = "";
      let buffer = "";
      let updateTimeoutA: number | null = null;
      let updateTimeoutB: number | null = null;

      // Read stream chunks
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        // Decode chunk
        const chunk = decoderRef.current.decode(value, { stream: true });
        buffer += chunk;

        // Split by lines and process each complete line
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
              
              // Determine which model this chunk belongs to
              const isModelA = parsed.model === currentModelAId || parsed.channel === 'A';
              const isModelB = parsed.model === currentModelBId || parsed.channel === 'B';
              
              // Handle chunk data
              if (parsed.chunk && typeof parsed.chunk === 'string') {
                if (isModelA) {
                  accumulatedDataA += parsed.chunk;
                  
                  // Debounce state updates for better performance
                  if (updateTimeoutA) {
                    clearTimeout(updateTimeoutA);
                  }
                  updateTimeoutA = window.setTimeout(() => {
                    setModelA(prev => ({
                      ...prev,
                      data: accumulatedDataA,
                    }));
                  }, 16); // ~60fps updates

                  // Call chunk callback
                  options.onModelAChunk?.(parsed.chunk);
                } else if (isModelB) {
                  accumulatedDataB += parsed.chunk;
                  
                  // Debounce state updates for better performance
                  if (updateTimeoutB) {
                    clearTimeout(updateTimeoutB);
                  }
                  updateTimeoutB = window.setTimeout(() => {
                    setModelB(prev => ({
                      ...prev,
                      data: accumulatedDataB,
                    }));
                  }, 16); // ~60fps updates

                  // Call chunk callback
                  options.onModelBChunk?.(parsed.chunk);
                }
              }
              
              // Handle completion
              if (parsed.complete === true) {
                if (isModelA) {
                  // Clear any pending updates and do final update
                  if (updateTimeoutA) {
                    clearTimeout(updateTimeoutA);
                    updateTimeoutA = null;
                  }
                  setModelA(prev => ({
                    ...prev,
                    data: accumulatedDataA,
                    isStreaming: false,
                    isComplete: true,
                    translationOutputId: parsed.output_id || prev.translationOutputId,
                  }));
                  options.onModelAComplete?.();
                } else if (isModelB) {
                  // Clear any pending updates and do final update
                  if (updateTimeoutB) {
                    clearTimeout(updateTimeoutB);
                    updateTimeoutB = null;
                  }
                  setModelB(prev => ({
                    ...prev,
                    data: accumulatedDataB,
                    isStreaming: false,
                    isComplete: true,
                    translationOutputId: parsed.output_id || prev.translationOutputId,
                  }));
                  options.onModelBComplete?.();
                }
              }

              // Handle errors
              if (parsed.error) {
                const errorMessage = typeof parsed.error === 'string' ? parsed.error : 'Unknown error';
                if (isModelA) {
                  setModelA(prev => ({ ...prev, error: errorMessage, isStreaming: false }));
                  options.onModelAError?.(errorMessage);
                } else if (isModelB) {
                  setModelB(prev => ({ ...prev, error: errorMessage, isStreaming: false }));
                  options.onModelBError?.(errorMessage);
                }
              }

            } catch (parseError) {
              // Skip invalid JSON lines
              console.warn('Failed to parse SSE chunk:', jsonStr, parseError);
            }
          }
        }
      }

      // Check if both are complete and call the callback
      setTimeout(() => {
        setModelA(currentA => {
          setModelB(currentB => {
            if (currentA.isComplete && currentB.isComplete) {
              options.onBothComplete?.();
            }
            return currentB;
          });
          return currentA;
        });
      }, 100);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Stream was intentionally cancelled
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error';
      setModelA(prev => ({ ...prev, error: errorMessage, isStreaming: false }));
      setModelB(prev => ({ ...prev, error: errorMessage, isStreaming: false }));
      options.onModelAError?.(errorMessage);
      options.onModelBError?.(errorMessage);
    } finally {
      if (readerRef.current) {
        readerRef.current.releaseLock();
        readerRef.current = null;
      }
      abortControllerRef.current = null;
    }
  }, [modelAId, modelBId, JSON.stringify(payload), token, options.onModelAError, options.onModelBError, options.onBothComplete]);

  const isAnyStreaming = modelA.isStreaming || modelB.isStreaming;
  const areBothComplete = modelA.isComplete && modelB.isComplete;

  return {
    modelA,
    modelB,
    start,
    stop,
    reset,
    isAnyStreaming,
    areBothComplete,
  };
}
