/**
 * ErrorDisplay Component
 * Displays error state with retry button
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { ErrorDisplayProps } from './types';

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  return (
    <div className="bg-red-50 dark:bg-white/5 backdrop-blur-xl border border-red-300 dark:border-red-400/30 rounded-xl p-6 shadow-xl">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <div className="text-lg font-medium text-red-700 dark:text-red-300">
          Translation Failed
        </div>
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;

