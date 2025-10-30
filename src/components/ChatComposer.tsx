import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
      const payload: TranslateRequest = {
        template_id: selectedTemplate?.id,
        challenge_id: challenge.id,
        input_text: text,
      };
    
      onSubmit(payload);
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
