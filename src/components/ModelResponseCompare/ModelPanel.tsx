/**
 * ModelPanel Component
 * Displays a single model's translation output with controls
 */

import React from 'react';
import { Copy, StopCircle, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import FontSizeControl from '../FontSizeControl';
import TemplateNameLink from './TemplateNameLink';
import LoadingIndicator from './LoadingIndicator';
import type { ModelPanelProps } from './types';

const ModelPanel: React.FC<ModelPanelProps> = ({
  side,
  modelName,
  templateName,
  templateId,
  fontSize,
  onFontSizeChange,
  onCopy,
  onStop,
  onTemplateClick,
  selectedOption,
  borderClass,
  translation,
  individualTranslation,
  translationReady,
  isLoading,
  error,
  currentStepMessage,
  stepProgress,
  translationStatus,
  comboKey,
  t,
}) => {
  const isSelected = selectedOption === side || selectedOption === 'both';
  const hasContent = translation && translationReady && individualTranslation;

  return (
    <div className={`bg-neutral-100 dark:bg-neutral-800 backdrop-blur-xl rounded-xl border-2 transition-all duration-200 ${borderClass}`}>
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-neutral-800 dark:text-white">
              {modelName}
              {templateName && templateId && (
                <TemplateNameLink 
                  templateName={templateName} 
                  templateId={templateId} 
                  onTemplateClick={onTemplateClick} 
                />
              )}
            </h3>
            {isSelected && (
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Font size control */}
            <FontSizeControl
              fontSize={fontSize}
              onFontSizeChange={onFontSizeChange}
              className="mr-2"
            />
            
            {/* Copy button */}
            {hasContent && (
              <button
                onClick={onCopy}
                className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
                title={t('translation.copyContent')}
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            
            {/* Stop button */}
            {isLoading && (
              <button
                onClick={onStop}
                className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200"
                title="Stop Translation"
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
          <div className="text-red-700 dark:text-red-300 text-sm bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        ) : (
          <div 
            className="max-h-96 min-h-10 overflow-y-auto text-neutral-700 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap scroll-smooth" 
            style={{ fontSize: `${fontSize}px` }}
          >
            {isLoading ? (
                  <LoadingIndicator
                    currentStepMessage={currentStepMessage}
                    stepProgress={stepProgress}
                    translationStatus={translationStatus}
                  />
                ) :translation ? (
              <div className="break-words">
                <Markdown>{String(translation)}</Markdown>
              </div>
            ) : (
              <div>no translation</div>
            )}
          </div>
        )}
      </div>

      {/* Combo Key Info */}
      {comboKey && (
        <div className="px-4 pb-4">
          <div className="text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-white/5 border border-neutral-300 dark:border-white/10 rounded px-2 py-1">
            Combination Key: {comboKey}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelPanel;

