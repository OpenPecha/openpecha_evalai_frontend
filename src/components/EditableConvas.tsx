import { useRef, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { X, Eye, Edit3 } from 'lucide-react';
import type { PlaceholderElement } from '../components/TemplateBuilder';
import { 
  removeEmojisFromContent, 
  processPastedContent, 
  normalizeContentForEditing,
  getEmojiForElement
} from '../utils/emojiUtils';


  // Droppable Canvas Component with inline editing
const EditableCanvas: React.FC<{
    content: string;
    onContentChange: (content: string) => void;
    isOver: boolean;
    setSelectedTextRange: (range: {start: number, end: number}) => void;
    isPreviewMode: boolean;
    onTogglePreviewMode: () => void;
  }> = ({ content, onContentChange, isOver, setSelectedTextRange, isPreviewMode, onTogglePreviewMode }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
  
    const { setNodeRef } = useDroppable({
      id: 'canvas',
      disabled: isPreviewMode, // Only allow drops in edit mode
    });
  
    // Handle content changes with emoji normalization for editing mode
    const handleContentChange = useCallback((newContent: string) => {
      // In edit mode, ensure content has emojis for display
      const normalizedContent = isPreviewMode ? newContent : normalizeContentForEditing(newContent);
      onContentChange(normalizedContent);
    }, [onContentChange, isPreviewMode]);

    // Handle paste events to process pasted content
    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      const processedText = processPastedContent(pastedText);
      
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = textarea.value;
        
        const newContent = currentContent.slice(0, start) + processedText + currentContent.slice(end);
        handleContentChange(newContent);
        
        // Set cursor position after pasted content
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + processedText.length;
          setSelectedTextRange({ start: start + processedText.length, end: start + processedText.length });
        }, 0);
      }
    }, [handleContentChange, setSelectedTextRange]);
  
  // Render content with placeholders
  const renderContentWithPlaceholders = () => {
    if (!isPreviewMode) return null;

    // For preview mode, use clean content (remove emojis for parsing)
    const cleanContent = removeEmojisFromContent(content);
    const parts = cleanContent.split(/(\{(?:source|ucca|sanskrit|gloss|commentaries)\})/);
    const elements: React.ReactNode[] = [];

    parts.forEach((part, index) => {
      const match = part.match(/\{(source|ucca|sanskrit|gloss|commentaries)\}/);
      
      if (match) {
        const type = match[1] as PlaceholderElement['type'];
        // Create a temporary placeholder object for rendering
        const tempPlaceholder: PlaceholderElement = {
          id: `temp-${type}-${index}`,
          type: type,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          position: 0
        };
        
        elements.push(
          <PlaceholderPreview
            key={`${type}-${index}`}
            placeholder={tempPlaceholder}
            onRemove={() => {}} // No-op for manually typed placeholders
            isManual={true}
          />
        );
      } else if (part) {
        // Preserve all formatting including tabs, spaces, and newlines
        elements.push(
          <span key={index} className="whitespace-pre-wrap text-base font-bold">
            {part}
          </span>
        );
      }
    });

    return elements;
  };
  
    return (
      <div
        ref={setNodeRef}
        className={`relative min-h-96 border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          isOver 
            ? 'border-primary-500/60 bg-neutral-100/30 dark:bg-neutral-600/30' 
            : !isPreviewMode
            ? 'border-primary-500/40 dark:border-neutral-400 bg-neutral-50/10 dark:bg-neutral-800/70'
            : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-500/50 bg-neutral-50/10 dark:bg-neutral-800/70'
        }`}
      >
        {!isPreviewMode ? (
          <textarea
            ref={textareaRef}
            value={content}
            onSelect={() => setSelectedTextRange({start: textareaRef.current?.selectionStart || 0, end: textareaRef.current?.selectionEnd || 0})}
            onClick={() => setSelectedTextRange({start: textareaRef.current?.selectionStart || 0, end: textareaRef.current?.selectionEnd || 0})}
            onChange={(e) => handleContentChange(e.target.value)}
            onPaste={handlePaste}
            className="w-full h-full min-h-96 resize-none outline-none bg-transparent font-mono text-sm leading-relaxed text-neutral-700 dark:text-neutral-100 pt-12"
            placeholder="Start typing your template here..."
            style={{ tabSize: 4 }}
          />
        ) : (
          <div
            ref={contentRef}
            className="w-full min-h-96 max-h-96 overflow-y-auto font-mono text-sm leading-relaxed cursor-text text-neutral-700 dark:text-neutral-100 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-500 pt-12"
          >
            {content ? (
              renderContentWithPlaceholders()
            ) : (
              <div className="text-neutral-500 dark:text-neutral-400 italic">
                Toggle between edit and preview mode to see the changes.
              </div>
            )}
          </div>
        )}
        
        {isOver && !isPreviewMode && (
          <div className="absolute inset-0 top-12 bg-neutral-100/20 dark:bg-neutral-600/20 rounded-lg flex items-center justify-center pointer-events-none">
            <div className="text-primary-600 dark:text-primary-400 font-medium">Drop here to add placeholder</div>
          </div>
        )}
        
        {isOver && isPreviewMode && (
          <div className="absolute inset-0 top-12 bg-red-100/20 dark:bg-red-600/20 rounded-lg flex items-center justify-center pointer-events-none">
            <div className="text-red-600 dark:text-red-400 font-medium">Switch to Edit mode to add elements</div>
          </div>
        )}
        
        {/* GitHub-like Toolbar */}
        <div className="absolute top-0 left-0 right-0 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 rounded-t-lg">
          <div className="flex items-center">
            <button
              onClick={() => !isPreviewMode || onTogglePreviewMode()}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                !isPreviewMode
                  ? 'text-blue-700 dark:text-blue-400 border-blue-500 bg-blue-100/50 dark:bg-blue-900/20'
                  : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              <Edit3 size={16} />
              Write
            </button>
            <button
              onClick={() => isPreviewMode || onTogglePreviewMode()}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                isPreviewMode
                  ? 'text-blue-700 dark:text-blue-400 border-blue-500 bg-blue-100/50 dark:bg-blue-900/20'
                  : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              <Eye size={16} />
              Preview
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Preview Component for Different Placeholder Types
const PlaceholderPreview: React.FC<{ 
    placeholder: PlaceholderElement; 
    onRemove: (id: string) => void;
    isManual?: boolean;
  }> = ({ placeholder, onRemove, isManual = false }) => {
    const emoji = getEmojiForElement(placeholder.type);
    
    const renderPreview = () => {
      switch (placeholder.type) {
        case 'source':
          return (
            <div className="inline-block relative group mx-1 my-1">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl py-2 px-3 min-w-36 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    {emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-blue-900 dark:text-blue-100">Source</div>
                  </div>
                </div>
              </div>
              {!isManual && (
                <button
                  onClick={() => onRemove(placeholder.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          );
  
        case 'ucca':
          return (
            <div className="inline-block relative group mx-1 my-1">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl py-2 px-3 min-w-40 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
                    {emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">UCCA</div>
                  </div>
                </div>
              </div>
              {!isManual && (
                <button
                  onClick={() => onRemove(placeholder.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          );
  
        case 'sanskrit':
          return (
            <div className="inline-block relative group mx-1 my-1">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-xl py-2 px-3 min-w-44 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-amber-900 dark:text-amber-100 mb-1">Sanskrit Text</div>             
                  </div>
                </div>
              </div>
              {!isManual && (
                <button
                  onClick={() => onRemove(placeholder.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          );
  
        case 'gloss':
          return (
            <div className="inline-block relative group mx-1 my-1">
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border border-purple-200 dark:border-purple-800 rounded-xl py-2 px-3 min-w-40 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                    {emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-purple-900 dark:text-purple-100">Gloss</div>
                  </div>
                </div>
              </div>
              {!isManual && (
                <button
                  onClick={() => onRemove(placeholder.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          );
  
        case 'commentaries':
          return (
            <div className="inline-block relative group mx-1 my-1">
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border border-rose-200 dark:border-rose-800 rounded-xl py-2 px-3 min-w-44 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-rose-100 dark:bg-rose-900/50 rounded-lg flex items-center justify-center">
                    {emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-rose-900 dark:text-rose-100">Commentary</div>
                  </div>
                </div>
              </div>
              {!isManual && (
                <button
                  onClick={() => onRemove(placeholder.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          );
  
        default:
          return null;
      }
    };
  
    return <>{renderPreview()}</>;
  };
  
export default EditableCanvas;