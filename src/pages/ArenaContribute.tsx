import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "../auth/use-auth-hook";
import { useTemplates, useCreateTemplate, useDeleteTemplate, useUpdateTemplate } from "../hooks/useTemplates";
import { useArenaChallenge } from "../hooks/useArenaChallenge";
import type { CreateTemplateV2, TemplateDetail } from "../types/template";
import TemplateCard from "../components/TemplateCard";
import TemplateBuilder from "../components/TemplateBuilder";
import TemplateEditModal from "../components/TemplateEditModal";

const ArenaContribute: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showOnlyMyTemplates, setShowOnlyMyTemplates] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateDetail | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<TemplateDetail | null>(null);

  // React Query hooks
  const { 
    data: challenge, 
    isLoading: challengeLoading, 
    error: challengeError 
  } = useArenaChallenge(challengeId || '');

  const { 
    data: templatesResponse, 
    isLoading: templatesLoading, 
    error: templatesError 
  } = useTemplates(challengeId || '', currentPage, showOnlyMyTemplates ? currentUser?.id : undefined);

  const createTemplateMutation = useCreateTemplate();
  const deleteTemplateMutation = useDeleteTemplate();
  const updateTemplateMutation = useUpdateTemplate();

  // Handle template creation
  const handleCreateTemplate = async (templateName: string, templateText: string) => {
    if (!challengeId) return;
    
    const templateData: CreateTemplateV2 = {
      template_name: templateName,
      template: templateText,
      challenge_id: challengeId
    };

    try {
      await createTemplateMutation.mutateAsync(templateData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  // Handle template editing
  const handleEditTemplate = (template: TemplateDetail) => {
    setEditingTemplate(template);
    setShowEditModal(true);
  };

  // Handle template update
  const handleUpdateTemplate = async (templateId: string, templateName: string, templateText: string) => {
    try {
      await updateTemplateMutation.mutateAsync({
        id: templateId,
        template_name: templateName,
        template: templateText,
        challenge_id: challengeId || ''
      });
      setShowEditModal(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplateMutation.mutateAsync(templateId);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  // Handle template click
  const handleTemplateClick = (template: TemplateDetail) => {
    setActiveTemplate(template);
  };

  // Handle back to templates
  const handleBackToTemplates = () => {
    setActiveTemplate(null);
  };

  // Handle back to arena
  const handleBackToArena = () => {
    navigate('/arena');
  };

  // Loading state
  if (challengeLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading...</span>
      </div>
    );
  }

  // Error state
  if (challengeError || templatesError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 dark:text-red-400 mb-2">
          Failed to load challenge or templates
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  // No challenge found
  if (!challenge) {
    return (
      <div className="text-center py-12">
        <div className="text-neutral-500 dark:text-neutral-400 mb-2">
          Challenge not found
        </div>
        <button 
          onClick={handleBackToArena}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          Back to Arena
        </button>
      </div>
    );
  }

  // If a template is selected, show the Chat component
  if (activeTemplate) {
    // Import Chat component dynamically to avoid circular dependencies
    const Chat = React.lazy(() => import('./Chat'));
    
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <Chat 
          selectedTemplate={activeTemplate} 
          challenge={challenge} 
          onBackToTemplates={handleBackToTemplates}
          onBackToArena={handleBackToArena}
          judgeOrBattle="battle"
        />
      </React.Suspense>
    );
  }
  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToArena}
                className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Arena</span>
              </button>
              <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-600" />
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                  Contribute Templates
                </h1>
                <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                  {challenge.challenge_name} • {challenge.from_language} → {challenge.to_language}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter and Actions Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* My Templates Switch Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  My Templates
                </span>
                <button
                  onClick={() => {
                    setShowOnlyMyTemplates(!showOnlyMyTemplates);
                    setCurrentPage(1);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    showOnlyMyTemplates ? 'bg-blue-600' : 'bg-neutral-200 dark:bg-neutral-700'
                  }`}
                  role="switch"
                  aria-checked={showOnlyMyTemplates}
                  aria-label="Toggle my templates filter"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showOnlyMyTemplates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {templatesResponse?.items?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-neutral-500 dark:text-neutral-400 mb-2">
              {showOnlyMyTemplates ? 'You haven\'t created any templates yet' : 'No templates found'}
            </div>
            <p className="text-neutral-600 dark:text-neutral-400">
              {showOnlyMyTemplates ? 'Create your first template to get started!' : 'Be the first to create a template for this challenge.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesResponse?.items?.map((template: TemplateDetail) => (
              <TemplateCard 
                key={template?.id} 
                template={template} 
                handleTemplateClick={handleTemplateClick}
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
                currentUser={currentUser}
                isDeleting={deleteTemplateMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* Template Builder Modal */}
      <TemplateBuilder
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTemplate}
        isLoading={createTemplateMutation.isPending}
        challenge={challenge}
      />

      {/* Template Edit Modal */}
      {editingTemplate && (
        <TemplateEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTemplate(null);
          }}
          onUpdate={(templateName: string, templateText: string) => 
            handleUpdateTemplate(editingTemplate.id, templateName, templateText)
          }
          isLoading={updateTemplateMutation.isPending}
          template={editingTemplate}
          challenge={challenge}
        />
      )}
    </div>
  );
};

export default ArenaContribute;
