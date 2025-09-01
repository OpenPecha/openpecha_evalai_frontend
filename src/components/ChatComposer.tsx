import React, { useState, useRef } from "react";
import { Send, Languages, AlertTriangle } from "lucide-react";
import { suggestModels } from "../api/translate";
import { DEFAULT_MODELS } from "../types/translate";
import type { SuggestResponse, TranslateRequest } from "../types/translate";

interface ChatComposerProps {
  onSubmit: (payload: TranslateRequest, modelA: string, modelB: string, selectionMethod?: string) => void;
  disabled?: boolean;
  token?: string;
}

const exampleTexts = [
  "བཀྲ་ཤིས་བདེ་ལེགས། ངའི་མིང་ལ་བསྟན་འཛིན་ཟེར།",
  "ད་ལྟ་གནམ་གཤིས་ཇི་འདྲ་ཡོད་དམ།",
  "ང་རང་ཞིང་པ་ཞིག་ཡིན། ང་ནས་འབྲུ་དང་གྲོ་མ་བཟོ་གི་ཡོད།",
  "སྐུ་ཚེ་རིང་བ་དང་ནད་མེད་ཚེ་དབང་ཐོབ་པར་ཤོག",
];

const ChatComposer: React.FC<ChatComposerProps> = ({
  onSubmit,
  disabled = false,
  token,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    const text = inputValue.trim();
    if (!text || isLoading || disabled) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get suggested models
      let modelA = DEFAULT_MODELS[0];
      let modelB = DEFAULT_MODELS[1];
      let selectionMethod: string | undefined;

      try {
        const suggestion: SuggestResponse = await suggestModels(token);
        
        // Use suggested models if available, otherwise fallback to defaults
        if (suggestion.model_a && suggestion.model_b) {
          modelA = suggestion.model_a;
          modelB = suggestion.model_b;
          selectionMethod = suggestion.selection_method || undefined;
        } else {
          console.warn("Incomplete model suggestion, using defaults:", suggestion);
          setError("Using default models (suggestion service unavailable)");
        }
      } catch (suggestionError) {
        console.warn("Failed to get model suggestions, using defaults:", suggestionError);
        setError("Using default models (suggestion service unavailable)");
      }

      // Create payload
      const payload: TranslateRequest = {
        text,
        prompt: "translate",
      };

      // Clear input and submit
      setInputValue("");
      onSubmit(payload, modelA, modelB, selectionMethod);
    } catch (submitError) {
      console.error("Error submitting translation request:", submitError);
      setError(
        submitError instanceof Error 
          ? submitError.message 
          : "Failed to submit translation request"
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

  const handleExampleClick = (text: string) => {
    setInputValue(text);
    textareaRef.current?.focus();
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
    <div className="space-y-4">
      {/* Error display */}
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Example texts */}
      {!inputValue && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Try these examples:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleTexts.map((text) => (
              <button
                key={text}
                onClick={() => handleExampleClick(text)}
                className="p-3 text-left bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
                disabled={disabled || isLoading}
              >
                <div className="flex items-start space-x-2">
                  <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter text to translate (Tibetan, English, or other languages)..."
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 pr-14 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 resize-none min-h-[60px] max-h-[200px]"
          disabled={disabled || isLoading}
          rows={2}
        />
        
        <button
          onClick={handleSubmit}
          disabled={!inputValue.trim() || disabled || isLoading}
          className="absolute right-3 bottom-3 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors duration-200"
          title="Translate (Enter)"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>• Press Enter to translate, Shift+Enter for new line</p>
        <p>• Two AI models will translate your text simultaneously for comparison</p>
        <p>• You can vote on which translation is better to help improve AI quality</p>
      </div>
    </div>
  );
};

export default ChatComposer;
