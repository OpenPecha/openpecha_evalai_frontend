import React from "react";
import { Minus, Plus, Type } from "lucide-react";

interface FontSizeControlProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  className?: string;
}

const FontSizeControl: React.FC<FontSizeControlProps> = ({
  fontSize,
  onFontSizeChange,
  className = "",
}) => {
  const handleDecrease = () => {
    if (fontSize > 12) {
      onFontSizeChange(fontSize - 2);
    }
  };

  const handleIncrease = () => {
    if (fontSize < 24) {
      onFontSizeChange(fontSize + 2);
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Type className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
      <button
        onClick={handleDecrease}
        disabled={fontSize <= 12}
        className="p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Decrease font size"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="text-xs text-neutral-600 dark:text-neutral-400 min-w-[2rem] text-center">
        {fontSize}px
      </span>
      <button
        onClick={handleIncrease}
        disabled={fontSize >= 24}
        className="p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Increase font size"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default FontSizeControl;






