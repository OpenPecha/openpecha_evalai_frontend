import { Languages, ArrowRight, User, Calendar, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import type { TemplateDetail } from "../types/template";
import { formatRelativeTime } from "../utils/date";

const TemplateCard = ({ 
    template, 
    handleTemplateClick, 
    onDelete,
    onEdit,
    currentUser,
    isDeleting = false,
    disabled = false
}: { 
    template: TemplateDetail, 
    handleTemplateClick: (template: TemplateDetail) => void,
    onDelete?: (templateId: string) => void,
    onEdit?: (template: TemplateDetail) => void,
    currentUser?: { username?: string; email?: string } | null,
    isDeleting?: boolean,
    disabled?: boolean
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Check if current user owns this template
    const isOwner = currentUser?.email?.split('@')[0] === template.created_by;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering handleTemplateClick
        
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }

        // Only call the onDelete callback - no direct API call
        onDelete?.(template.id);
        setShowDeleteConfirm(false);
    };

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(false);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering handleTemplateClick
        onEdit?.(template);
    };

    const handleClick = () => {
        if (disabled) {
            return; // Prevent click when disabled
        }
        handleTemplateClick(template);
    };

    
    return (
        <div className="relative">
            <button
                key={template.id}
                onClick={handleClick}
                className={`w-full p-6 text-left bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-xl transition-all duration-200 group ${
                    disabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:border-primary-300 dark:hover:border-primary-500 hover:shadow-lg'
                }`}
                disabled={isDeleting || disabled}
            >
                <div className="space-y-3 flex flex-col">
                    {/* Header with title, icon, and delete button */}
                    <div className="flex items-start justify-between ">
                     <div className="flex  flex-1  flex-col w-full max-w-[80%]">
                        <h3 title={template.template_name} className="  font-semibold  truncate text-lg text-neutral-800 dark:text-neutral-100 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors line-clamp-2 leading-tight pr-2">
                            {template.template_name}
                        </h3>
                          {/* Sample text and zero shot badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {template.text_category && (
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{template.text_category}</span>
                        )}
                        {template.is_zero_shot && (
                            <span className="px-2 py-0.5 text-[8px] font-normal bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full border border-amber-300 dark:border-amber-700">
                                Zero Shot
                            </span>
                        )}
                    </div>
                    </div>
                        <div className="flex items-center gap-2 fflex-1 flex-shrink-0">
                            {onEdit && isOwner && (
                                <div
                                    onClick={handleEdit}
                                    className="p-1 rounded-md transition-colors cursor-pointer text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:text-neutral-500 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                                    title="Edit template"
                                >
                                    <Edit className="w-4 h-4" />
                                </div>
                            )}
                            {onDelete && isOwner && (
                                <div
                                    onClick={handleDelete}
                                    className={`p-1 rounded-md transition-colors cursor-pointer ${
                                        showDeleteConfirm
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                                            : 'text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:text-neutral-500 dark:hover:text-red-400 dark:hover:bg-red-900/20'
                                    } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                                    title={showDeleteConfirm ? "Click again to confirm deletion" : "Delete template"}
                                >
                                    <Trash2 className={`w-4 h-4 ${isDeleting ? 'animate-pulse' : ''}`} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delete confirmation message */}
                    {showDeleteConfirm && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                                Are you sure you want to delete "<strong>{template.template_name}</strong>"?
                            </p>
                            <div className="flex gap-2">
                                <div
                                    onClick={handleDelete}
                                    className={`px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </div>
                                <div
                                    onClick={handleCancelDelete}
                                    className="px-3 py-1 text-xs bg-neutral-200 text-neutral-700 rounded-md hover:bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                                >
                                    Cancel
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Template preview */}
                    <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg px-3 border border-neutral-200 dark:border-neutral-600">
                       
                    {/* Language translation indicator */}
                    <div className="flex items-center gap-3 py-2">
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
                        <textarea
                            className="resize-none text-sm text-neutral-700 dark:text-neutral-300 line-clamp-3 font-mono w-full outline-none foucs:ring-0"
                            readOnly={true}
                            value={template.template.slice(0, 100) + '...' || 'No template content'}
                            rows={5}
                        />
                    </div>

                  


                    {/* Footer with metadata */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-200 dark:border-neutral-600">
                        <div className="flex items-center space-x-1 text-neutral-500 dark:text-neutral-400">
                            <User className="w-3 h-3" />
                            <span>{template.created_by}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-neutral-500 dark:text-neutral-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatRelativeTime(template.updated_at || template.created_at)}</span>
                        </div>
                    </div>
                </div>
            </button>
        </div>
    )
}


export default TemplateCard;