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
    const baseClass = "w-8 h-8 rounded-full text-sm font-medium transition-all duration-200";
    if (voted) {
      return `${baseClass} bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed`;
    }
    if (!selected) {
      return `${baseClass} bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed`;
    }
    
    // Active state colors
    const colors = {
      1: "bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400",
      2: "bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-400",
      3: "bg-yellow-100 hover:bg-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 dark:text-yellow-400",
      4: "bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400",
      5: "bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30 dark:text-green-400",
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
            className="max-h-96 overflow-y-auto text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap scroll-smooth"
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
        {/* Select button */}
        {isComplete && !error && !selected && !disabled && (
          <button
            onClick={onSelect}
            className="w-full mb-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Select This Response
          </button>
        )}

        {/* Rating */}
        {selected && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {voted ? "Thank you for your feedback!" : "Rate this translation (1-5):"}
            </div>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => handleScoreClick(score as 1 | 2 | 3 | 4 | 5)}
                  className={getScoreButtonClass(score)}
                  disabled={voted || !selected}
                  title={`Rate ${score} star${score !== 1 ? 's' : ''}`}
                >
                  {score}
                </button>
              ))}
            </div>
            {voted && (
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                ✓ Vote submitted successfully
              </div>
            )}
          </div>
        )}

        {/* Status indicators */}
        {!isComplete && !isStreaming && !error && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Ready to translate
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelStreamPanel;
