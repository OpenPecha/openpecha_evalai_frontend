import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { X, Save, Image, Languages, BookOpen, MessageSquare, FileText, Edit } from 'lucide-react';
import EditableCanvas from './EditableConvas';
import type { TemplateDetail } from '../types/template';
import type { ArenaChallenge } from '../types/arena_challenge';

export interface PlaceholderElement {
  id: string; 
  type: 'source' | 'ucca' | 'sanskrit' | 'gloss' | 'commentaries';
  label: string;
  position: number;
}

const sidebarElements = [
  { type: 'source' as const, label: 'Source', icon: <FileText size={20} />, emoji: '📝' },
  { type: 'ucca' as const, label: 'UCCA', icon: <Image size={20} />, emoji: '🖼️' },
  { type: 'sanskrit' as const, label: 'Sanskrit', icon: <Languages size={20} />, emoji: '🕉️' },
  { type: 'gloss' as const, label: 'GLOSS', icon: <BookOpen size={20} />, emoji: '📖' },
  { type: 'commentaries' as const, label: 'COMMENTARY', icon: <MessageSquare size={20} />, emoji: '💬' },
];

// Draggable Sidebar Item Component
const DraggableItem: React.FC<{ element: typeof sidebarElements[0] }> = ({ element }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: element.type,
    data: { type: element.type, label: element.label }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-3 p-2 bg-neutral-50 dark:bg-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-500 rounded-lg cursor-grab active:cursor-grabbing transition-colors border-2 border-transparent hover:border-primary-300 dark:hover:border-primary-500"
    >
      <span className="text-2xl">{element.emoji}</span>
      <div>
        <div className="font-medium text-neutral-700 dark:text-neutral-100">{element.label}</div>
        <div className="text-sm text-neutral-500 dark:text-neutral-300">{`{${element.type}}`}</div>
      </div>
    </div>
  );
};

interface TemplateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (templateName: string, templateText: string) => void;
  isLoading: boolean;
  template: TemplateDetail;
  challenge: ArenaChallenge;
}

/**
 * TemplateEditModal Component
 * 
 * A comprehensive modal for editing existing templates with drag-and-drop functionality
 * for adding placeholders and real-time preview capabilities.
 * 
 * Features:
 * - Edit template name and content
 * - Drag-and-drop placeholder elements
 * - Real-time preview mode
 * - Form validation
 * - Loading states
 * - Responsive design
 * - Dark mode support
 */
const TemplateEditModal: React.FC<TemplateEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpdate, 
  isLoading, 
  template,
  challenge 
}) => {
  // Form state
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  
  // Drag and drop state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isOver, setIsOver] = useState(false);
  
  // UI state
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form with template data when modal opens or template changes
  useEffect(() => {
    if (isOpen && template) {
      setTemplateName(template.template_name);
      setTemplateContent(template.template);
      setHasChanges(false);
    }
  }, [isOpen, template]);

  // Track changes to enable/disable save button
  useEffect(() => {
    if (template) {
      const nameChanged = templateName !== template.template_name;
      const contentChanged = templateContent !== template.template;
      setHasChanges(nameChanged || contentChanged);
    }
  }, [templateName, templateContent, template]);

  /**
   * Handle drag start event
   */
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  /**
   * Handle drag over event to show drop zone feedback
   */
  const handleDragOver = (event: any) => {
    setIsOver(event.over?.id === 'canvas');
  };

  /**
   * Handle drag end event to insert placeholder at cursor position
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setIsOver(false);

    if (over && over.id === 'canvas') {
      const elementType = active.data.current?.type;

      if (elementType) {
        const placeholderText = `{${elementType}}`;
        // Insert at cursor position
        setTemplateContent(prev => {
          const before = prev.slice(0, cursorPosition);
          const after = prev.slice(cursorPosition);
          return before + placeholderText + after;
        });
      }
    }
  };

  /**
   * Handle form submission
   */
  const handleUpdate = () => {
    if (templateName.trim() && templateContent.trim() && hasChanges) {
      onUpdate(templateName.trim(), templateContent.trim());
    }
  };

  /**
   * Handle modal close with confirmation if there are unsaved changes
   */
  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) return;
    }
    
    // Reset form state
    setTemplateName('');
    setTemplateContent('');
    setIsPreviewMode(false);
    setHasChanges(false);
    onClose();
  };

  /**
   * Handle template name change
   */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateName(e.target.value);
  };

  if (!isOpen || !template) return null;

  const isFormValid = templateName.trim() && templateContent.trim();
  const canSave = isFormValid && hasChanges && !isLoading;

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-auto">
          
          {/* Header */}
          <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Edit className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <div>
                    <div className="text-lg font-semibold text-neutral-700 dark:text-neutral-100">
                      Edit Template
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      {template.challenge_name}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                </button>
              </div>
              
              {/* Changes indicator */}
              {hasChanges && (
                <div className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                  • You have unsaved changes
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Template Name Input */}
            <div>
              <label htmlFor="template-name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Template Name
              </label>
              <input
                id="template-name"
                type="text"
                value={templateName}
                onChange={handleNameChange}
                placeholder="Enter template name..."
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-8">
              {/* Sidebar */}
              <div className="w-72 bg-white dark:bg-neutral-700 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-600 p-6 h-fit">
                <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-100 mb-4">Elements</h3>
                <div className="space-y-3">
                  {sidebarElements.map((element) => {
                    // Hide UCCA and GLOSS elements for UCCA/GLOSS challenges to avoid confusion
                    if ((element.type === 'ucca' || element.type === 'gloss') && 
                        (challenge.text_category.toLowerCase() === 'ucca' || challenge.text_category.toLowerCase() === 'gloss')) {
                      return null;
                    }
                    return <DraggableItem key={element.type} element={element} />
                  })}
                </div>
                
                <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-600 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    <strong>Smart Editing:</strong> Click to edit, automatically switches to preview when you stop typing.
                  </p>
                </div>
              </div>

              {/* Main Canvas */}
              <div className="flex-1 bg-white dark:bg-neutral-700 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-600 p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-100 mb-2">Template Canvas</h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Click anywhere to edit. All formatting (tabs, spaces, newlines) is preserved.
                  </p>
                </div>

                <EditableCanvas
                  content={templateContent}
                  onContentChange={setTemplateContent}
                  isOver={isOver}
                  setCursorPosition={setCursorPosition}
                  isPreviewMode={isPreviewMode}
                  onTogglePreviewMode={() => setIsPreviewMode(!isPreviewMode)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700">
            {/* Original template info */}
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Created by {template.created_by} • Last updated {new Date(template.updated_at || template.created_at).toLocaleDateString()}
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 border border-neutral-300 dark:border-neutral-600 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={!canSave}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isLoading ? "Updating..." : "Update Template"}</span>
              </button>
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeId ? (
              <div className="flex items-center gap-3 p-4 bg-neutral-100/60 dark:bg-neutral-700/60 rounded-lg shadow-lg border-2 border-primary-500/20">
                <span className="text-2xl">
                  {sidebarElements.find(el => el.type === activeId)?.emoji}
                </span>
                <div className="font-medium text-neutral-700 dark:text-neutral-100">
                  {sidebarElements.find(el => el.type === activeId)?.label}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </div>
      </div>
    </DndContext>
  );
};

export default TemplateEditModal;
