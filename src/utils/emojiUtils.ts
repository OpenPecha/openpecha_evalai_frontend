/**
 * Emoji Utilities for Template System
 * 
 * Provides consistent emoji handling for template elements in editing mode.
 * In editing mode: shows {source} as {📝 source}
 * When sending to backend: removes emojis to send clean {source}
 */

export type ElementType = 'source' | 'ucca' | 'sanskrit' | 'gloss' | 'commentaries';

/**
 * Mapping of element types to their corresponding emojis
 */
export const ELEMENT_EMOJIS: Record<ElementType, string> = {
  source: '📝',
  ucca: '🖼️',
  sanskrit: '🕉️',
  gloss: '📖',
  commentaries: '💬',
};

/**
 * Get emoji for a specific element type
 */
export const getEmojiForElement = (type: ElementType): string => {
  return ELEMENT_EMOJIS[type] || '';
};

/**
 * Add emojis to template content for editing mode display
 * Converts {source} to {📝 source}
 */
export const addEmojisToContent = (content: string): string => {
  if (!content) return content;
  
  // Replace each placeholder with emoji version
  let result = content;
  
  Object.entries(ELEMENT_EMOJIS).forEach(([type, emoji]) => {
    const pattern = new RegExp(`\\{${type}\\}`, 'g');
    result = result.replace(pattern, `{${emoji} ${type}}`);
  });
  
  return result;
};

/**
 * Remove emojis from template content for backend submission
 * Converts {📝 source} back to {source}
 */
export const removeEmojisFromContent = (content: string): string => {
  if (!content) return content;
  
  // Remove emojis from placeholders
  let result = content;
  
  Object.entries(ELEMENT_EMOJIS).forEach(([type, emoji]) => {
    // Match both {emoji type} and {emoji  type} (with extra spaces)
    const patternWithEmoji = new RegExp(`\\{${emoji}\\s+${type}\\}`, 'g');
    result = result.replace(patternWithEmoji, `{${type}}`);
  });
  
  return result;
};

/**
 * Process pasted content to add emojis if it contains valid placeholders
 * This ensures consistent emoji display when content is pasted
 */
export const processPastedContent = (pastedContent: string): string => {
  return addEmojisToContent(pastedContent);
};

/**
 * Check if content contains emoji placeholders
 */
export const hasEmojiPlaceholders = (content: string): boolean => {
  return Object.values(ELEMENT_EMOJIS).some(emoji => 
    content.includes(`{${emoji}`)
  );
};

/**
 * Check if content contains clean placeholders (without emojis)
 */
export const hasCleanPlaceholders = (content: string): boolean => {
  return Object.keys(ELEMENT_EMOJIS).some(type => 
    content.includes(`{${type}}`)
  );
};

/**
 * Validate that a placeholder string is properly formatted
 */
export const isValidPlaceholder = (placeholder: string): boolean => {
  // Check for clean format: {type}
  const cleanPattern = /^\{(source|ucca|sanskrit|gloss|commentaries)\}$/;
  if (cleanPattern.test(placeholder)) return true;
  
  // Check for emoji format: {emoji type}
  const emojiPattern = /^\{(📝|🖼️|🕉️|📖|💬)\s+(source|ucca|sanskrit|gloss|commentaries)\}$/;
  return emojiPattern.test(placeholder);
};

/**
 * Extract element type from placeholder (works with both emoji and clean formats)
 */
export const extractElementType = (placeholder: string): ElementType | null => {
  // Try clean format first
  const cleanMatch = placeholder.match(/^\{(source|ucca|sanskrit|gloss|commentaries)\}$/);
  if (cleanMatch) return cleanMatch[1] as ElementType;
  
  // Try emoji format
  const emojiMatch = placeholder.match(/^\{(?:📝|🖼️|🕉️|📖|💬)\s+(source|ucca|sanskrit|gloss|commentaries)\}$/);
  if (emojiMatch) return emojiMatch[1] as ElementType;
  
  return null;
};

/**
 * Create emoji placeholder for drag and drop operations
 */
export const createEmojiPlaceholder = (type: ElementType): string => {
  const emoji = getEmojiForElement(type);
  return `{${emoji} ${type}}`;
};

/**
 * Normalize content to ensure consistent emoji display
 * Handles mixed content with both emoji and clean placeholders
 */
export const normalizeContentForEditing = (content: string): string => {
  // First remove any existing emojis to avoid duplication
  const cleanContent = removeEmojisFromContent(content);
  // Then add emojis consistently
  return addEmojisToContent(cleanContent);
};
