import React, { useState } from "react";
import { Plus, ArrowLeft, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../auth/use-auth-hook";
import { useTemplates, useCreateTemplate, useDeleteTemplate } from "../hooks/useTemplates";
import type { CreateTemplateV2, TemplateDetail } from "../types/template";
import type { ArenaChallenge } from "../types/arena_challenge";
import Chat from "../pages/Chat";
import TemplateView from "../components/TemplateView";
import TemplateBuilder from "../components/TemplateBuilder";
import { TemplateCard } from "../components/TemplateCard";


const Template: React.FC<{ backToArena: () => void, challenge: ArenaChallenge, judgeOrBattle: string }> = ({ backToArena, challenge, judgeOrBattle }) => {
  const { currentUser } = useAuth();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Local state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDetail | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<TemplateDetail | null>(null);
  const [showOnlyMyTemplates, setShowOnlyMyTemplates] = useState(true);
  // React Query hooks
  const { 
    data: templatesResponse, 
    isLoading, 
    error: templatesError,
    refetch: refetchTemplates 
  } = useTemplates(challenge.id, currentPage, showOnlyMyTemplates ? currentUser?.id : undefined);
  
  const createTemplateMutation = useCreateTemplate();
  const deleteTemplateMutation = useDeleteTemplate();
  
  // Extract templates and pagination info from response
  const allTemplates = templatesResponse?.items || [];
  const totalCount = templatesResponse?.total_count || 0;
  const hasMorePages = currentPage < totalCount;
  
  // Derive error state
  const error = templatesError?.message || createTemplateMutation.error?.message || deleteTemplateMutation.error?.message || null;


  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTemplateClick = (template: TemplateDetail) => {
    // No need for async operations here since we already have the template data
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleSelectTemplate = (template: TemplateDetail) => {
    setActiveTemplate(template);
    setShowTemplateModal(false);
  };

  const handleCreateTemplate = async (templateName: string, templateText: string) => {
    if (!currentUser) return;
    
    const body: CreateTemplateV2 = {
      template_name: templateName,
      template: templateText,
      challenge_id: challenge.id,
    };

    createTemplateMutation.mutate(body, {
      onSuccess: () => {
        setShowCreateModal(false);
      },
      onError: (error) => {
        console.error("Error creating template:", error);
        // Error is already handled by React Query and displayed via the error state
      }
    });
  };

  const handleBackToTemplates = () => {
    setActiveTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    console.log('Deleting template:', templateId, 'for challenge:', challenge.id);
    deleteTemplateMutation.mutate(templateId, {
      onSuccess: () => {
        if (allTemplates.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      },
      onError: (error) => {
        console.error("Error deleting template:", error);
      }
    });
  };

  const renderTemplatesContent = () => {    
    if (allTemplates.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mx-auto mb-4">📄</div>
          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {showOnlyMyTemplates ? "No personal templates found" : "No templates found"}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            {showOnlyMyTemplates 
              ? "You haven't created any templates yet."
              : "No templates are available for this challenge."
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Template</span>
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allTemplates.map((template) => (
          <TemplateCard 
            key={template?.id} 
            template={template} 
            handleTemplateClick={handleTemplateClick}
            onDelete={handleDeleteTemplate}
            currentUser={currentUser}
            isDeleting={deleteTemplateMutation.isPending}
          />
        ))}
      </div>
    );
  };

  // If a template is selected, show the Chat component
  if ((judgeOrBattle === 'judge')|| activeTemplate) {
    return <Chat 
    selectedTemplate={activeTemplate || undefined} 
    challenge={challenge} 
    onBackToTemplates={handleBackToTemplates}
    onBackToArena={backToArena}
    judgeOrBattle={judgeOrBattle} />;
  }

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-700 dark:text-neutral-100">
              Select Template
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Choose a template to start your translation session
            </p>
          </div>
          <button onClick={() => backToArena()} 
        className="flex items-center space-x-2 px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 border border-neutral-300 dark:border-neutral-600 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
           <span>Back to Arena</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                {templatesError && (
                  <button
                    onClick={() => refetchTemplates()}
                    className="px-3 py-1 text-xs bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Filter and Actions Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Filter Toggle */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Show:
                  </span>
                </div>
                <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setShowOnlyMyTemplates(true);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      showOnlyMyTemplates
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    My Templates
                  </button>
                  <button
                    onClick={() => {
                      setShowOnlyMyTemplates(false);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      !showOnlyMyTemplates
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    All Templates
                  </button>
                </div>
              </div>

              {/* Create Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Template</span>
              </button>
            </div>
          </div>

          {/* Templates Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
                <p className="text-neutral-600 dark:text-neutral-400">Loading templates...</p>
              </div>
            </div>
          ) : renderTemplatesContent()}
        </div>
      </div>

      {/* Pagination Controls - Fixed at bottom */}
      {!isLoading && allTemplates.length > 0 && totalCount > 1 && (
        <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 px-6 py-3">
          <div className="max-w-6xl mx-auto flex flex-col items-center space-y-4">
            
            {/* Pagination Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              <span className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Page {currentPage} of {totalCount}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasMorePages}
                className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedTemplate && (
        <TemplateView
          template={selectedTemplate}
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSelect={handleSelectTemplate}
        />
      )}
      
      <TemplateBuilder
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTemplate}
        isLoading={createTemplateMutation.isPending}
        challenge={challenge}
      />
    </div>
  );
};

export default Template;
