import React, { useState, useEffect } from "react";
import { Plus, FileText, ArrowLeft } from "lucide-react";
import { useAuth } from "../auth/use-auth-hook";
import { getPromptTemplates, createPromptTemplateV2 } from "../api/template";
import type { CreateTemplateV2, PromptTemplate } from "../types/template";
import type { ArenaChallenge } from "../types/arena_challenge";
import Chat from "../pages/Chat";
import TemplateView from "../components/TemplateView";
import TemplateBuilder from "../components/TemplateBuilder";
import { TemplateCard } from "../components/TemplateCard";


const Template: React.FC<{ backToArena: () => void, challenge: ArenaChallenge, judgeOrBattle: string }> = ({ backToArena, challenge, judgeOrBattle }) => {
  const { currentUser } = useAuth();
console.log("challenge template ::: ", challenge);
  const [personalTemplates, setPersonalTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate | null>(null);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, [currentUser, challenge.id]);

  const loadTemplates = async () => {
    if (!currentUser || !challenge.id) return;
    
    setIsLoading(true);
    setError(null);

    try {
        const templates = await getPromptTemplates(currentUser.email?.split("@")[0] || "", challenge.id);
        setPersonalTemplates(templates);
    } catch (err) {
      console.error("Error loading templates:", err);
      setError("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateClick = async (template: PromptTemplate) => {
    try {
      // Fetch full template details
      // const fullTemplate = await getPromptTemplate(template.id);
      setSelectedTemplate(template);
      setShowTemplateModal(true);
    } catch (err) {
      console.error("Error fetching template details:", err);
      setError("Failed to load template details");
    }
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    setActiveTemplate(template);
    setShowTemplateModal(false);
  };

  const handleCreateTemplate = async (templateName: string, templateText: string) => {
    if (!currentUser) return;
    setIsCreating(true);
      const body: CreateTemplateV2 = {
        template_name: templateName,
        username: currentUser.email?.split("@")[0] || "",
        template: templateText,
        challenge_id: challenge.id,
      }
    try {
      const newTemplate = await createPromptTemplateV2(body);
      setPersonalTemplates(prev => [newTemplate, ...prev]);
      setSelectedTemplate(newTemplate);
      setShowTemplateModal(true);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creating template:", err);
      setError("Failed to create template");
    } finally {
      setIsCreating(false);
    }
  };

  const handleBackToTemplates = () => {
    setActiveTemplate(null);
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

  const currentTemplates = personalTemplates;

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
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

            <div className="mb-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Template</span>
              </button>
            </div>

          {/* Templates Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
                <p className="text-neutral-600 dark:text-neutral-400">Loading templates...</p>
              </div>
            </div>
          ) : currentTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                No templates found
              </h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Template</span>
                </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} handleTemplateClick={handleTemplateClick} />
              ))}
            </div>
          )}
        </div>
      </div>

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
        isLoading={isCreating}
        challenge={challenge}
      />
    </div>
  );
};

export default Template;
