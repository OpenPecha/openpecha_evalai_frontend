/**
 * LoadingIndicator Component
 * Displays loading state with animated dots and progress information
 */

import React from 'react';
import type { LoadingIndicatorProps } from './types';

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  currentStepMessage,
  stepProgress,
  translationStatus,
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full animate-bounce" />
        <div 
          className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full animate-bounce" 
          style={{ animationDelay: "0.1s" }}
        />
        <div 
          className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full animate-bounce" 
          style={{ animationDelay: "0.2s" }}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-primary-600 dark:text-primary-400 transition-all duration-300">
          {currentStepMessage}
        </span>
        {stepProgress.current > 0 && (
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-2">
            <span>{stepProgress.message}</span>
            {translationStatus === 'ahead' && (
              <span className="text-green-600 dark:text-green-400 font-medium">⚡ Ahead</span>
            )}
            {translationStatus === 'behind' && (
              <span className="text-orange-600 dark:text-orange-400 font-medium">⏳ Behind</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingIndicator;

