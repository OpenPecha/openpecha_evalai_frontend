import React, { useState, useRef } from "react";
import { Send, Languages, AlertTriangle, Settings, X, Save } from "lucide-react";
import { suggestModels } from "../api/translate";
import { DEFAULT_MODELS, SUPPORTED_LANGUAGES, createTranslatePrompt } from "../types/translate";
import type { SuggestResponse, TranslateRequest, LanguageCode } from "../types/translate";
import useLocalStorage from "../hooks/useLocaleStorage";

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
const DEFAULT_TEMPLATE = "Translate the following text accurately while preserving meaning and context:";
const ChatComposer: React.FC<ChatComposerProps> = ({
  onSubmit,
  disabled = false,
  token,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage<LanguageCode>("targetLanguage", "en"); // Default to English
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Custom prompt settings stored in localStorage
  const [customPrompt, setCustomPrompt] = useLocalStorage<string>(
    'translation-custom-template', 
    DEFAULT_TEMPLATE
  );
  const [tempPrompt, setTempPrompt] = useState(customPrompt);
  
  // Input state - initialize with custom prompt by default
  const [inputValue, setInputValue] = useState(customPrompt);

  const handleSubmit = async () => {
    const text = inputValue.trim();
    if (!text || isLoading || disabled) return;
    
    // Extract the actual text to translate (everything after the prompt)
    const promptText = customPrompt.trim();
    let textToTranslate = text;
    
    // If input starts with the custom prompt, extract the text after it
    if (text.startsWith(promptText)) {
      textToTranslate = text.slice(promptText.length).trim();
      // Remove any separators like newlines or dashes
      textToTranslate = textToTranslate.replace(/^[\s-]+/, '').trim();
    }
    
    if (!textToTranslate) {
      setError("Please enter text to translate after the prompt");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get fresh suggested models for this translation
      let modelA: string = DEFAULT_MODELS[0];
      let modelB: string = DEFAULT_MODELS[1];
      let selectionMethod: string | undefined;

      console.log('Fetching fresh model suggestions for new translation...');
      try {
        const suggestion: SuggestResponse = await suggestModels(token);
        
        // Use suggested models if available, otherwise fallback to defaults
        if (suggestion.model_a && suggestion.model_b) {
          modelA = suggestion.model_a;
          modelB = suggestion.model_b;
          selectionMethod = suggestion.selection_method || undefined;
          console.log(`Using suggested models: ${modelA} vs ${modelB} (${selectionMethod})`);
        } else {
          console.warn("Incomplete model suggestion, using defaults:", suggestion);
          setError("Using default models (suggestion service unavailable)");
        }
      } catch (suggestionError) {
        console.warn("Failed to get model suggestions, using defaults:", suggestionError);
        setError("Using default models (suggestion service unavailable)");
      }

      // Create payload with target language and custom prompt
      const selectedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage);
      const targetLanguageName = selectedLang?.name || 'English'; // For prompt readability
      const targetLanguageCode = selectedLanguage || 'en'; // Send language code
      
      // Use custom prompt if set, otherwise use default with target language
      const finalPrompt = customPrompt.trim() 
        ? `${customPrompt} (Target language: ${targetLanguageName})`
        : createTranslatePrompt(targetLanguageName);
      
      const payload: TranslateRequest = {
        text: textToTranslate,
        prompt: finalPrompt,
        template: customPrompt.trim() || undefined,
        target_language: targetLanguageCode,
      };

      // Reset input to just the prompt for next translation
      setInputValue(customPrompt + "\n\n");
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
    // Add the example text after the custom prompt
    const promptWithExample = `${customPrompt}\n\n${text}`;
    setInputValue(promptWithExample);
    textareaRef.current?.focus();
    
    // Position cursor after the example text
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(promptWithExample.length, promptWithExample.length);
      }
    }, 0);
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

  // Settings handlers
  const handleSettingsOpen = () => {
    setTempPrompt(customPrompt);
    setShowSettings(true);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
    setTempPrompt(customPrompt); // Reset to saved value
  };

  const handleSettingsSave = () => {
    setCustomPrompt(tempPrompt);
    // Update the input field with new prompt
    setInputValue(tempPrompt + "\n\n");
    setShowSettings(false);
  };

  const handleResetPrompt = () => {
    setTempPrompt('Translate the following text accurately while preserving meaning and context:');
  };

  return (
    <div className="space-y-4">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-100">
                  Translation Settings
                </h2>
              </div>
              <button
                onClick={handleSettingsClose}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="custom-prompt-textarea" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Custom Translation Template
                </label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                  This template will be used for input. 
                </p>
                <textarea
                  id="custom-prompt-textarea"
                  value={tempPrompt}
                  onChange={(e) => setTempPrompt(e.target.value)}
                  placeholder="Enter your custom translation prompt..."
                  className="w-full h-32 px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 resize-none"
                />
              </div>

              
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700">
              <button
                onClick={handleResetPrompt}
                className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                Reset to Default
              </button>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSettingsClose}
                  className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 border border-neutral-300 dark:border-neutral-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSettingsSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Try these examples:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleTexts.map((text) => (
              <button
                key={text}
                onClick={() => handleExampleClick(text)}
                className="p-3 text-left bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 group"
                disabled={disabled || isLoading}
              >
                <div className="flex items-start space-x-2">
                  <Languages className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors flex-shrink-0" />
                  <span className="font-['monlam'] text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
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
          placeholder="Your translation prompt will appear here. Add the text to translate below it..."
          className="w-full font-['monlam'] rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 px-4 py-3 pr-24 pb-12 text-neutral-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 resize-none min-h-[80px] max-h-[200px]"
          disabled={disabled || isLoading}
          rows={5}
        />
        
        {/* Target Language Selection - Inside textbox bottom left */}
        <div className="absolute left-3 bottom-3 flex items-center space-x-1 bg-neutral-50 dark:bg-neutral-600 px-2 py-1 rounded-md">
          <span className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">To:</span>
          <select
            id="target-language-inline"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
            className="text-xs bg-transparent border-none text-neutral-700 dark:text-neutral-200 focus:outline-none cursor-pointer font-medium"
            disabled={disabled || isLoading}
            title="Select target language for translation"
          >
            {SUPPORTED_LANGUAGES.map((language) => (
              <option key={language.code} value={language.code} className="bg-white dark:bg-neutral-700 text-neutral-700 dark:text-white">
                {language.flag} {language.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Translate Button - Bottom right */}
        <button
          onClick={handleSubmit}
          disabled={!inputValue.trim() || disabled || isLoading}
          className="absolute right-3 bottom-3 w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors duration-200"
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
      <div className="flex items-start justify-between">
        <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1 flex-1">
          <p>• Press Enter to translate, Shift+Enter for new line</p>
          <p>• Select target language in the bottom-left of the input area</p>
          <p>• Fresh AI model pairs are selected for each translation</p>
          <p>• Click on any translation to rate it with emoji feedback</p>
          {isLoading && (
            <p className="text-primary-600 dark:text-primary-400 font-medium">
              🔄 Getting fresh model suggestions...
            </p>
          )}
        </div>
        
        {/* Settings Button */}
        <button
          onClick={handleSettingsOpen}
          disabled={disabled || isLoading}
          className="flex items-center space-x-1 px-3 py-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Translation Settings"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default ChatComposer;
