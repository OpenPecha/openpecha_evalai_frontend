import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { suggestModels } from "../api/translate";
import { DEFAULT_MODELS } from "../types/translate";
import type { SuggestResponse, TranslateRequest } from "../types/translate";
import type { PromptTemplate } from "../types/template";
import type { ArenaChallenge } from "../types/arena_challenge";
import SelectionReviewCard from "./SelectionReviewCard";
import InputComposer from "./InputComposer";

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
  
  // Input state
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

      try {
        const suggestion: SuggestResponse = await suggestModels(token, text);
        
        // Use suggested models if available, otherwise fallback to defaults
        if (suggestion.model_a && suggestion.model_b) {
          modelA = suggestion.model_a;
          modelB = suggestion.model_b;
          selectionMethod = suggestion.selection_method || undefined;
          
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

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setError(null); // Clear error when user types
  };

  return (
    <div className="space-y-6">
      {/* Selection Overview */}
      {judgeOrBattle === 'battle' && selectedTemplate && (
        <div className="w-[60%] mx-auto bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <SelectionReviewCard challenge={challenge} template={selectedTemplate} />
        </div>
      )}

      {/* Central Input Composer */}
      <InputComposer
        value={inputValue}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        disabled={disabled}
        isLoading={isLoading}
        error={error}
        placeholder="Type your text here to translate..."
        loadingText="Getting fresh model suggestions..."
      />
    </div>
  );
};

export default ChatComposer;
