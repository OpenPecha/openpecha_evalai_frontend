import React from 'react';
import { X, User, Tag, Globe } from 'lucide-react';
import { useTemplate } from '../hooks/useTemplates';

interface TemplateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string | null;
}

const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  isOpen,
  onClose,
  templateId,
}) => {
  const { data: template, isLoading, error } = useTemplate(templateId || '');

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading template...</span>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-red-500 dark:text-red-400 mb-2">
            ⚠️ Error loading template
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            Failed to load template details. Please try again.
          </p>
        </div>
      );
    }
    
    if (!template) {
      return (
        <div className="text-center py-8">
          <div className="text-neutral-500 dark:text-neutral-400 mb-2">
            No template found
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">
            The requested template could not be found.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Template Name */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            {template.template_name}
          </h3>
        </div>

        {/* Template Content */}
        <div>
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Template Content
          </h4>
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
            <pre className="whitespace-pre-wrap text-sm text-neutral-800 dark:text-neutral-200 font-mono">
              {template.template}
            </pre>
          </div>
        </div>

        {/* Template Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Challenge Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Challenge Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Challenge:</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                  {template.challenge_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Languages:</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                  {template.from_language} → {template.to_language}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Category:</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                  {template.text_category}
                </span>
              </div>
            </div>
          </div>

          {/* Creator Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Creator Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Created by:</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                  {template.created_by}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Created:</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                  {new Date(template.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Updated:</span>
                <span className="text-neutral-900 dark:text-neutral-100 font-medium">
                  {new Date(template.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        className="fixed inset-0 bg-black/50 backdrop-blur-sm w-full h-full"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
        aria-label="Close modal"
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Template Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default TemplateDetailModal;
