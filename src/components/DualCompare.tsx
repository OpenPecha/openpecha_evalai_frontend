import React, { useState, useCallback, useEffect } from "react";
import { useModelStream } from "../hooks/useModelStream";
import ModelStreamPanel from "./ModelStreamPanel";
import { voteModel } from "../api/translate";
import { useToast } from "./use-toast";
import type { TranslateRequest } from "../types/translate";

interface DualCompareProps {
  modelA: string;
  modelB: string;
  payload: TranslateRequest;
  token: string;
  onComplete?: () => void;
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
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [votedModel, setVotedModel] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Stream hooks for both models
  const streamA = useModelStream(modelA, payload, token, {
    onError: (error) => {
      console.error(`Model A (${modelA}) error:`, error);
    },
  });

  const streamB = useModelStream(modelB, payload, token, {
    onError: (error) => {
      console.error(`Model B (${modelB}) error:`, error);
    },
  });

  // Auto-start streaming when component mounts
  useEffect(() => {
    if (token) {
      streamA.start();
      streamB.start();
    }
  }, [streamA.start, streamB.start, token]);

  // Handle scoring/voting - now takes modelId directly
  const handleScore = useCallback(async (modelId: string, score: 1 | 2 | 3 | 4 | 5) => {
    if (votedModel || isVoting) return; // Already voted or currently voting

    setIsVoting(true);
    try {
      await voteModel(modelId, score, token);
      setVotedModel(modelId);
      showSuccessToast("Thank you!", "Your vote has been recorded.");
      onComplete?.();
      
      // Start countdown timer (5 seconds)
      setCountdown(5);
    } catch (error) {
      console.error("Error submitting vote:", error);
      showErrorToast(
        "Vote Failed",
        error instanceof Error ? error.message : "Failed to submit vote"
      );
    } finally {
      setIsVoting(false);
    }
  }, [votedModel, isVoting, token, showSuccessToast, showErrorToast, onComplete]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      // Countdown finished, start new translation
      onNewTranslation?.();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onNewTranslation]);

  const bothComplete = streamA.isComplete && streamB.isComplete;
  const anyStreaming = streamA.isStreaming || streamB.isStreaming;

  return (
    <div className="space-y-6">
      {/* Model panels side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model A Panel */}
        <ModelStreamPanel
          modelId={modelA}
          modelLabel="Model A"
          content={streamA.data}
          isStreaming={streamA.isStreaming}
          error={streamA.error}
          isComplete={streamA.isComplete}
          onStop={streamA.stop}
          onScore={handleScore}
          disabled={votedModel !== null && votedModel !== modelA}
          voted={votedModel === modelA}
          anyVoted={votedModel !== null}
        />

        {/* Model B Panel */}
        <ModelStreamPanel
          modelId={modelB}
          modelLabel="Model B"
          content={streamB.data}
          isStreaming={streamB.isStreaming}
          error={streamB.error}
          isComplete={streamB.isComplete}
          onStop={streamB.stop}
          onScore={handleScore}
          disabled={votedModel !== null && votedModel !== modelB}
          voted={votedModel === modelB}
          anyVoted={votedModel !== null}
        />
      </div>

      {/* Status and instructions */}
      <div className="text-center space-y-2">
        {anyStreaming && (
          <p className="text-sm text-primary-600 dark:text-primary-400">
            🔄 Streaming responses from both models...
          </p>
        )}
        
        {bothComplete && !votedModel && !streamA.error && !streamB.error && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            ✅ Both translations complete. Rate either response to reveal the model and continue.
          </p>
        )}
        
        {votedModel && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
            <p className="text-sm text-green-800 dark:text-green-300 font-medium">
              🎉 Thank you for your feedback! Your vote helps improve AI translation quality.
            </p>
            {countdown !== null && countdown > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                Starting new translation in {countdown} second{countdown !== 1 ? 's' : ''}... 
                <button 
                  onClick={() => onNewTranslation?.()} 
                  className="ml-2 underline hover:no-underline"
                >
                  Start now
                </button>
              </p>
            )}
          </div>
        )}

        {isVoting && (
          <p className="text-sm text-primary-600 dark:text-primary-400">
            ⏳ Submitting your vote...
          </p>
        )}
      </div>

     
    </div>
  );
};

export default DualCompare;
