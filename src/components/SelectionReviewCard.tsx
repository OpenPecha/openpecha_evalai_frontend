import React, { useState } from 'react';
import { Languages, ArrowRight, FileText, Target, ChevronDown, ChevronUp } from 'lucide-react';
import type { ArenaChallenge } from '../types/arena_challenge';
import type { PromptTemplate } from '../types/template';

export default function SelectionReviewCard({ challenge, template }: { challenge: ArenaChallenge, template: PromptTemplate }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border-b border-neutral-200 dark:border-neutral-600">
      {/* Header with Title - Clickable */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border-b border-neutral-200/50 dark:border-neutral-600/50 hover:bg-white/90 dark:hover:bg-neutral-800/90 transition-colors duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <div className="text-left">
              <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
                Translation Setup
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {challenge.challenge_name} • {template.template_name} • {challenge.from_language} → {challenge.to_language}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            )}
          </div>
        </div>
      </button>

      {/* Collapsible Content Section */}
      {isExpanded && (
        <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
          {/* Template Preview */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-600 overflow-hidden">
            <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-700/50 border-b border-neutral-200 dark:border-neutral-600">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Template Preview
              </h3>
            </div>
            <div className="p-4">
              <div className="bg-neutral-50 dark:bg-neutral-700/30 rounded-lg p-4 border border-neutral-200 dark:border-neutral-600">
                <pre className="text-sm font-mono text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap overflow-x-auto max-h-32 overflow-y-auto leading-relaxed">
                  {template.template}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}