import React, { useState, useRef } from "react";
import { Send, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { suggestModels } from "../api/translate";
import { DEFAULT_MODELS } from "../types/translate";
import type { SuggestResponse, TranslateRequest } from "../types/translate";
import type { PromptTemplate } from "../types/template";
import type { ArenaChallenge } from "../types/arena_challenge";
import SelectionReviewCard from "./SelectionReviewCard";

interface ChatComposerProps {
  onSubmit: (payload: TranslateRequest, modelA: string, modelB: string, selectionMethod?: string) => void;
  disabled?: boolean;
  token?: string;
  selectedTemplate?: PromptTemplate;
  challenge: ArenaChallenge;
  judgeOrBattle?: string;
}
const ChatComposer: React.FC<ChatComposerProps> = ({
  onSubmit,
  disabled = false,
  token,
  selectedTemplate,
  challenge,
  judgeOrBattle,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Input state - initialize with effective template by default
  const [inputValue, setInputValue] = useState("");


  const handleSubmit = async () => {
    const text = inputValue.trim();
    if (!text || isLoading || disabled) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Get fresh suggested models for this translation
      let modelA: string = DEFAULT_MODELS[0];
      let modelB: string = DEFAULT_MODELS[1];
      let selectionMethod: string | undefined;

      console.log('Fetching fresh model suggestions for new translation...');
      try {
        const suggestion: SuggestResponse = await suggestModels(token, text);
        
        // Use suggested models if available, otherwise fallback to defaults
        if (suggestion.model_a && suggestion.model_b) {
          modelA = suggestion.model_a;
          modelB = suggestion.model_b;
          selectionMethod = suggestion.selection_method || undefined;
          console.log(`Using suggested models: ${modelA} vs ${modelB} (${selectionMethod})`);
          
          // Log information about filtered models if any
          if (suggestion.used_models && suggestion.used_models.length > 0) {
            console.log(`Excluded ${suggestion.used_models.length} already used models:`, suggestion.used_models);
          }
        } else {
          console.warn("Incomplete model suggestion, using defaults:", suggestion);
          setError(t('messages.errorOccurred'));
        }
      } catch (suggestionError) {
        console.warn("Failed to get model suggestions, using defaults:", suggestionError);
        setError(t('messages.errorOccurred'));
      }
      const payload: TranslateRequest = {
        template_id: selectedTemplate?.id,
        challenge_id: challenge.id,
        input_text: text,
      };
      onSubmit(payload, modelA, modelB, selectionMethod);
    } catch (submitError) {
      console.error("Error submitting translation request:", submitError);
      setError(
        submitError instanceof Error 
          ? submitError.message 
          : t('messages.errorOccurred')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    setError(null); // Clear error when user types
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <div className="space-y-6">

      {/* Selection Overview */}
      {judgeOrBattle === 'battle' && <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-600 overflow-hidden shadow-lg">
        <SelectionReviewCard challenge={challenge} template={selectedTemplate} />
      </div>}

      {/* Error display */}
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center space-x-3 text-yellow-800 dark:text-yellow-400">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Central Translation Input */}
      <div className="relative">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-600 shadow-xl overflow-hidden focus-within:border-neutral-300 dark:focus-within:border-neutral-500 transition-all duration-200">
          {/* Input Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-blue-900/10 dark:to-blue-900/20 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              {judgeOrBattle === 'judge' && <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-100">
                Judge the template — it will be auto-selected.</h2>
                }
            </div>
          </div>
          
          {/* Input Area */}
          <div className="p-6">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your text here to translate..."
              className="w-full font-['monlam'] bg-transparent text-neutral-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none min-h-[120px] max-h-[300px] text-lg leading-relaxed"
              disabled={isLoading}
              rows={6}
            />
          </div>
          
          {/* Action Bar */}
          <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-700/50 border-t border-neutral-200 dark:border-neutral-600 flex items-center justify-between">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              {isLoading ? (
                <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium">
                  <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  Getting fresh model suggestions...
                </div>
              ) : (
                <span>Press Enter to translate • Shift+Enter for new line</span>
              )}
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || disabled || isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:transform-none"
              title="Translate (Enter)"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Battle</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Fresh AI model pairs are automatically selected for each translation to ensure unbiased comparisons</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>After translation, you'll be able to compare results and provide feedback to improve the models</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatComposer;
