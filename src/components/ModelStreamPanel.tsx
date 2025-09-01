import React, { useEffect, useRef } from "react";
import { StopCircle, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ModelStreamPanelProps {
  modelId: string;
  content: string;
  isStreaming: boolean;
  error: string | null;
  isComplete: boolean;
  onStop: () => void;
  onSelect: () => void;
  selected: boolean;
  onScore: (score: 1 | 2 | 3 | 4 | 5) => void;
  disabled: boolean;
  voted: boolean;
}

const ModelStreamPanel: React.FC<ModelStreamPanelProps> = ({
  modelId,
  content,
  isStreaming,
  error,
  isComplete,
  onStop,
  onSelect,
  selected,
  onScore,
  disabled,
  voted,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives with smooth scrolling
  useEffect(() => {
    if (contentRef.current && (isStreaming || content)) {
      const element = contentRef.current;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: isStreaming ? 'smooth' : 'auto'
      });
    }
  }, [content, isStreaming]);

  const handleScoreClick = (score: 1 | 2 | 3 | 4 | 5) => {
    if (!voted && selected) {
      onScore(score);
    }
  };

  const getScoreButtonClass = (score: number) => {
    const baseClass = "w-12 h-12 rounded-full text-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-110";
    if (voted) {
      return `${baseClass} bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed`;
    }
    if (!selected) {
      return `${baseClass} bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed`;
    }
    
    // Active state colors - lighter backgrounds for emojis
    const colors = {
      1: "bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:border-red-800 dark:hover:border-red-700",
      2: "bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-300 dark:bg-orange-900/10 dark:hover:bg-orange-900/20 dark:border-orange-800 dark:hover:border-orange-700",
      3: "bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 hover:border-yellow-300 dark:bg-yellow-900/10 dark:hover:bg-yellow-900/20 dark:border-yellow-800 dark:hover:border-yellow-700",
      4: "bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 dark:border-blue-800 dark:hover:border-blue-700",
      5: "bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 dark:bg-green-900/10 dark:hover:bg-green-900/20 dark:border-green-800 dark:hover:border-green-700",
    };
    
    return `${baseClass} ${colors[score as keyof typeof colors]} cursor-pointer`;
  };

  const getPanelBorderClass = () => {
    if (error) {
      return "border-red-300 dark:border-red-600";
    }
    if (selected) {
      return "border-green-500 dark:border-green-400 bg-green-50/50 dark:bg-green-900/10";
    }
    if (disabled) {
      return "border-gray-200 dark:border-gray-600 opacity-75";
    }
    return "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500";
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-200 ${getPanelBorderClass()}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {modelId}
            </h3>
            {selected && (
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            )}
            {error && (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Streaming indicator */}
            {isStreaming && (
              <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Streaming...</span>
              </div>
            )}
            
            {/* Stop button */}
            {isStreaming && (
              <button
                onClick={onStop}
                className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                title="Stop streaming"
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
          <div
            ref={contentRef}
            onClick={isComplete && !error && !selected ? onSelect : undefined}
            className={`max-h-96 overflow-y-auto text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap scroll-smooth ${
              isComplete && !error && !selected 
                ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-3 -m-3 transition-colors duration-200" 
                : ""
            }`}
            title={isComplete && !error && !selected ? "Click to rate this translation" : ""}
          >
            {content ? (
              <div className="break-words">
                {content}
                {isStreaming && (
                  <span className="inline-block w-2 h-5 ml-1 bg-blue-500 animate-pulse" />
                )}
              </div>
            ) : (
              <div className="text-gray-400 dark:text-gray-500 italic">
                {isStreaming ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span>Starting translation...</span>
                  </div>
                ) : (
                  "Ready to translate"
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        {/* Rating - Show when selected */}
        {selected && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {voted ? "Thank you for your feedback!" : "Rate this translation:"}
            </div>
            <div className="flex items-center justify-center space-x-3">
              {[
                { score: 1, emoji: "😞" },
                { score: 2, emoji: "😐" },
                { score: 3, emoji: "🙂" },
                { score: 4, emoji: "😊" },
                { score: 5, emoji: "😍" }
              ].map(({ score, emoji }) => (
                <button
                  key={score}
                  onClick={() => handleScoreClick(score as 1 | 2 | 3 | 4 | 5)}
                  className={getScoreButtonClass(score)}
                  disabled={voted || !selected}
                  title={`Rate ${score} - ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {voted && (
              <div className="text-xs text-green-600 dark:text-green-400 mt-1 text-center">
                ✓ Vote submitted successfully
              </div>
            )}
          </div>
        )}

        {/* Click instruction for unselected but complete translations */}
        {isComplete && !error && !selected && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            👆 Click on the translation above to rate it
          </div>
        )}

        {/* Status indicators */}
        {!isComplete && !isStreaming && !error && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Ready to translate
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelStreamPanel;
