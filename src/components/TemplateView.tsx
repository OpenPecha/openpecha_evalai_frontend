import type { PromptTemplate } from "@/types/template";
import { FileText, X, Star, Languages, ArrowRight, User, Calendar } from "lucide-react";
import { formatRelativeTime } from "../utils/date";


interface TemplateViewProps {
    template: PromptTemplate;
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: PromptTemplate) => void;
  }

const TemplateView: React.FC<TemplateViewProps> = ({ template, isOpen, onClose, onSelect }) => {
    console.log('selected Template:', template);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
        {/* Header */}
        <div className="flex w-full items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center  w-full">
            <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <div className="text-lg font-semibold text-neutral-700 dark:text-neutral-100">
              Template Details
            </div>
              <span className=" ml-2 rounded-lg text-blue-800 dark:text-blue-200">
                {template?.text_category}
              </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Template Name
            </label>
            <div className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-200 font-semibold">
              {template.template_name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Template Content
            </label>
            <textarea className="w-full h-48 px-4 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-200 overflow-y-auto font-mono text-sm leading-relaxed" 
            readOnly={true} 
            value={template.template ||'No template content'} 
            rows={5} />
          </div>

         

          {/* Language translation indicator */}
          <div className="flex items-center  gap-4">
        
            <div className="flex items-center justify-center gap-4 py-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Languages className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  {template.from_language}
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Languages className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  {template.to_language}
                </span>
              </div>
            </div>
          </div>

        
        </div>

        {/* Footer */}
        <div className="flex items-center space-x-3 p-2  justify-between ">
            {/* Metadata */}
          <div className="flex items-center gap-4 pt-4 ">
            <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
              <User className="w-4 h-4" />
              <span>{template.created_by}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Calendar className="w-4 h-4" />
              <span>Updated: {formatRelativeTime(template.updated_at || template.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 border border-neutral-300 dark:border-neutral-600 rounded-lg transition-colors"
            >
            Cancel
          </button>
          <button
            onClick={() => onSelect(template)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors duration-200"
            >
            Select
          </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateView;