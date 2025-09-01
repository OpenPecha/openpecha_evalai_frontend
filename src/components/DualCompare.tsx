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
  selectionMethod?: string;
}

const DualCompare: React.FC<DualCompareProps> = ({
  modelA,
  modelB,
  payload,
  token,
  onComplete,
  selectionMethod,
}) => {
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [votedModel, setVotedModel] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

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

  // Handle model selection
  const handleSelectModel = useCallback((modelId: string) => {
    if (votedModel) return; // Already voted, can't change selection
    setSelectedModel(modelId);
  }, [votedModel]);

  // Handle scoring/voting
  const handleScore = useCallback(async (score: 1 | 2 | 3 | 4 | 5) => {
    if (!selectedModel || votedModel || isVoting) return;

    setIsVoting(true);
    try {
      await voteModel(selectedModel, score, token);
      setVotedModel(selectedModel);
      showSuccessToast("Thank you!", "Your vote has been recorded.");
      onComplete?.();
    } catch (error) {
      console.error("Error submitting vote:", error);
      showErrorToast(
        "Vote Failed",
        error instanceof Error ? error.message : "Failed to submit vote"
      );
    } finally {
      setIsVoting(false);
    }
  }, [selectedModel, votedModel, isVoting, token, showSuccessToast, showErrorToast, onComplete]);

  const bothComplete = streamA.isComplete && streamB.isComplete;
  const anyStreaming = streamA.isStreaming || streamB.isStreaming;

  return (
    <div className="space-y-6">
      {/* Selection method info */}
      {selectionMethod && (
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            Method: {selectionMethod}
          </div>
        </div>
      )}

      {/* Model panels side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model A Panel */}
        <ModelStreamPanel
          modelId={modelA}
          content={streamA.data}
          isStreaming={streamA.isStreaming}
          error={streamA.error}
          isComplete={streamA.isComplete}
          onStop={streamA.stop}
          onSelect={() => handleSelectModel(modelA)}
          selected={selectedModel === modelA}
          onScore={handleScore}
          disabled={selectedModel !== null && selectedModel !== modelA}
          voted={votedModel === modelA}
        />

        {/* Model B Panel */}
        <ModelStreamPanel
          modelId={modelB}
          content={streamB.data}
          isStreaming={streamB.isStreaming}
          error={streamB.error}
          isComplete={streamB.isComplete}
          onStop={streamB.stop}
          onSelect={() => handleSelectModel(modelB)}
          selected={selectedModel === modelB}
          onScore={handleScore}
          disabled={selectedModel !== null && selectedModel !== modelB}
          voted={votedModel === modelB}
        />
      </div>

      {/* Status and instructions */}
      <div className="text-center space-y-2">
        {anyStreaming && (
          <p className="text-sm text-blue-600 dark:text-blue-400">
            🔄 Streaming responses from both models...
          </p>
        )}
        
        {bothComplete && !selectedModel && !streamA.error && !streamB.error && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ✅ Both translations complete. Select the better response to rate it.
          </p>
        )}
        
        {selectedModel && !votedModel && (
          <p className="text-sm text-green-600 dark:text-green-400">
            📊 Rate the selected translation from 1-5 stars to submit your vote.
          </p>
        )}
        
        {votedModel && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-800 dark:text-green-400 font-medium">
              🎉 Thank you for your feedback! Your vote helps improve AI translation quality.
            </p>
          </div>
        )}

        {isVoting && (
          <p className="text-sm text-blue-600 dark:text-blue-400">
            ⏳ Submitting your vote...
          </p>
        )}
      </div>

      {/* Debug info (only in development) */}
      {import.meta.env.DEV && (
        <details className="text-xs text-gray-500 dark:text-gray-400">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-left overflow-auto">
            {JSON.stringify({
              modelA: { id: modelA, streaming: streamA.isStreaming, complete: streamA.isComplete, error: streamA.error },
              modelB: { id: modelB, streaming: streamB.isStreaming, complete: streamB.isComplete, error: streamB.error },
              selected: selectedModel,
              voted: votedModel,
              payload: payload,
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default DualCompare;
