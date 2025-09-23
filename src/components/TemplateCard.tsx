import { FileText, Languages, ArrowRight, User, Calendar, Star } from "lucide-react";
import type { PromptTemplate } from "../types/template";
import { formatRelativeTime } from "../utils/date";

export const TemplateCard = ({ template, handleTemplateClick }: { template: PromptTemplate, handleTemplateClick: (template: PromptTemplate) => void }) => {
    return (
        <button
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            className="p-6 text-left bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-lg transition-all duration-200 group"
        >
            <div className="space-y-3">
                {/* Header with title and icon */}
                <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-100 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors line-clamp-2 leading-tight">
                        {template.template_name}
                    </h3>
                    <FileText className="w-5 h-5 text-neutral-400 dark:text-neutral-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors flex-shrink-0 ml-3" />
                </div>

                {/* Template preview */}
                <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-3 border border-neutral-200 dark:border-neutral-600">
                    <textarea
                        className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-3 font-mono w-full outline-none foucs:ring-0"
                        readOnly={true}
                        value={template.template || 'No template content'}
                        rows={5}
                    />
                </div>

                {/* Sample text */}
                {template.text && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{template.text}</span>
                        </div>
                    </div>
                )}

                {/* Language translation indicator */}
                <div className="flex items-center justify-center gap-3 py-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                        <Languages className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            {template.from_language}
                        </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                    <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        <Languages className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                            {template.to_language}
                        </span>
                    </div>
                </div>

                {/* Footer with metadata */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-200 dark:border-neutral-600">
                    <div className="flex items-center space-x-1 text-neutral-500 dark:text-neutral-400">
                        <User className="w-3 h-3" />
                        <span>{template.username}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-neutral-500 dark:text-neutral-400">
                        <Calendar className="w-3 h-3" />
                        <span>{formatRelativeTime(template.updated_at || template.created_at)}</span>
                    </div>
                </div>

                {/* Optional score display for backward compatibility */}
                {template.template_score !== undefined && (
                    <div className="flex items-center justify-center">
                        <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                            <Star className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                                {template.template_score}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </button>
    )
}