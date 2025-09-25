import { FileText, Languages, ArrowRight, User, Calendar, Trash2 } from "lucide-react";
import { useState } from "react";
import type { PromptTemplate } from "../types/template";
import { formatRelativeTime } from "../utils/date";
import { deleteTemplate } from "../api/template";

export const TemplateCard = ({ 
    template, 
    handleTemplateClick, 
    onDelete,
    currentUser
}: { 
    template: PromptTemplate, 
    handleTemplateClick: (template: PromptTemplate) => void,
    onDelete?: (templateId: string) => void,
    currentUser?: { username?: string; email?: string } | null
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Check if current user owns this template
    console.log("currentUser ::: ", currentUser);
    const isOwner = currentUser?.email === template.user_detail.email;

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering handleTemplateClick
        
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }

        try {
            setIsDeleting(true);
            await deleteTemplate(template.template_detail.id);
            onDelete?.(template.template_detail.id);
        } catch (error) {
            console.error("Failed to delete template:", error);
            // You might want to show a toast notification here
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(false);
    };

    console.log("template card ::: ", template);
    
    return (
        <div className="relative">
            <button
                key={template.template_detail.id}
                onClick={() => handleTemplateClick(template)}
                className="w-full p-6 text-left bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-lg transition-all duration-200 group"
                disabled={isDeleting}
            >
                <div className="space-y-3">
                    {/* Header with title, icon, and delete button */}
                    <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-100 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors line-clamp-2 leading-tight flex-1 pr-2">
                            {template.template_detail.template_name}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <FileText className="w-5 h-5 text-neutral-400 dark:text-neutral-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors" />
                            {onDelete && isOwner && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className={`p-1 rounded-md transition-colors ${
                                        showDeleteConfirm
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                                            : 'text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:text-neutral-500 dark:hover:text-red-400 dark:hover:bg-red-900/20'
                                    }`}
                                    title={showDeleteConfirm ? "Click again to confirm deletion" : "Delete template"}
                                >
                                    <Trash2 className={`w-4 h-4 ${isDeleting ? 'animate-pulse' : ''}`} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Delete confirmation message */}
                    {showDeleteConfirm && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                                Are you sure you want to delete "<strong>{template.template_detail.template_name}</strong>"?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                                <button
                                    onClick={handleCancelDelete}
                                    className="px-3 py-1 text-xs bg-neutral-200 text-neutral-700 rounded-md hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Template preview */}
                    <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-3 border border-neutral-200 dark:border-neutral-600">
                        <textarea
                            className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-3 font-mono w-full outline-none foucs:ring-0"
                            readOnly={true}
                            value={template.template_detail.template || 'No template content'}
                            rows={5}
                        />
                    </div>

                    {/* Sample text */}
                    {template.template_detail.text_category && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{template.template_detail.text_category}</span>
                            </div>
                        </div>
                    )}

                    {/* Language translation indicator */}
                    <div className="flex items-center justify-center gap-3 py-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                            <Languages className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                                {template.template_detail.from_language}
                            </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                        <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                            <Languages className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                                {template.template_detail.to_language}
                            </span>
                        </div>
                    </div>

                    {/* Footer with metadata */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-200 dark:border-neutral-600">
                        <div className="flex items-center space-x-1 text-neutral-500 dark:text-neutral-400">
                            <User className="w-3 h-3" />
                            <span>{template.user_detail.username}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-neutral-500 dark:text-neutral-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatRelativeTime(template.template_detail.updated_at || template.template_detail.created_at)}</span>
                        </div>
                    </div>
                </div>
            </button>
        </div>
    )
}