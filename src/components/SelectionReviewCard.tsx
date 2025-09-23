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
          {/* Main Selection Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Challenge Info */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Challenge</p>
                  <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
                    {challenge.challenge_name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Template Info */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-purple-200 dark:border-purple-800 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">Template</p>
                  <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
                    {template.template_name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Language Pair */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Languages className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">Languages</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        {challenge.from_language}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        {challenge.to_language}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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