import React, { useState, useRef } from "react";
import { Send, Plus, Globe, Image as ImageIcon, Sparkles, AlertTriangle } from "lucide-react";

interface InputComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string | null;
  placeholder?: string;
  loadingText?: string;
}

const InputComposer: React.FC<InputComposerProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  isLoading = false,
  error = null,
  placeholder = "Ask anything...",
  loadingText = "Processing...",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Error display */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center space-x-3 text-yellow-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl hover:border-white/20 focus-within:border-white/30 transition-all duration-300">
        
        {/* Textarea */}
        <div className="p-4 md:p-6">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent text-white placeholder-neutral-400 focus:outline-none resize-none min-h-[60px] md:min-h-[80px] max-h-[300px] text-base md:text-lg leading-relaxed font-['monlam']"
            disabled={isLoading || disabled}
            rows={1}
          />
        </div>
        
        {/* Action Bar */}
        <div className="flex items-center justify-end">
         
          
          {/* Right side actions */}
          <div className="flex items-center gap-3 p-2">
            {isLoading && (
              <div className="flex items-center gap-2 text-primary-400 text-sm font-medium">
                <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                <span className="hidden md:inline">{loadingText}</span>
              </div>
            )}
            
            <button
              onClick={onSubmit}
              disabled={!value.trim() || disabled || isLoading}
              className="flex items-center gap-2 px-2 md:px-3 py-2 md:py-1.5 bg-neutral-600 hover:bg-neutral-500 disabled:bg-neutral-700/50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:transform-none disabled:opacity-50"
              title="Submit (Enter)"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputComposer;

