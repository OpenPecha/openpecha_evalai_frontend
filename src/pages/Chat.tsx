import React, { useState, useCallback } from "react";
import { Languages, RotateCcw, ArrowLeft, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import ChatComposer from "../components/ChatComposer";
import ModelResponseCompare from "../components/ModelResponseCompare/index";
import ArenaHeader from "../components/ArenaHeader";
import { useAuth } from "../auth/use-auth-hook";
import type { TranslateRequest, TranslateSession } from "../types/translate";
import type { PromptTemplate } from "../types/template";
import type { ArenaChallenge } from "../types/arena_challenge";

interface ChatProps {
  selectedTemplate?: PromptTemplate;
  onBackToTemplates?: () => void;
  onBackToArena?: () => void;
  challenge?: ArenaChallenge;
  judgeOrBattle?: string;
}

const Chat: React.FC<ChatProps> = ({ selectedTemplate, onBackToTemplates, onBackToArena, challenge, judgeOrBattle }) => {
  const { t } = useTranslation();
  const { isAuthenticated, getToken } = useAuth();
  const [sessions, setSessions] = useState<TranslateSession[]>([]);
  const [currentSession, setCurrentSession] = useState<TranslateSession | null>(null);
  const [token, setToken] = useState<string>("");
  const [mode, setMode] = useState<'translation' | 'chat'>('translation');

  // Get auth token
  React.useEffect(() => {
    if (isAuthenticated) {
      getToken().then((authToken) => {
        if (authToken) {
          setToken(authToken);
        }
      });
    }
  }, [isAuthenticated, getToken]);

  // Handle new translation request
  const handleTranslateSubmit = useCallback((
    payload: TranslateRequest,
  ) => {
    const session: TranslateSession = {
      id: Date.now().toString(),
      input_text: payload.input_text,
      template_id: payload.template_id,
      challenge_id: payload.challenge_id,
    };

    setCurrentSession(session);
    setSessions(prev => [session, ...prev]);
  }, []);

  // Handle session completion
  const handleSessionComplete = useCallback((selectedModel?: string) => {
    if (selectedModel && currentSession) {
      // Update the current session with the selected model
      const updatedSession = { ...currentSession, selectedModel, voted: true };
      setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s));
      setCurrentSession(updatedSession);
    }
  }, [currentSession]);

  // Start new chat
  const handleNewChat = useCallback(() => {
    setCurrentSession(null);
  }, []);


  const hasCurrentSession = currentSession !== null;

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10" 
           style={{
             backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(115 115 115 / 0.3) 1px, transparent 0)',
             backgroundSize: '40px 40px'
           }} />
      {/* Fixed Arena List Button - Top Right */}
          {judgeOrBattle === 'judge' && onBackToArena && (
        <div className="absolute top-3 left-6 z-20">
          <button
            onClick={onBackToArena}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg transition-colors shadow-lg"
          >
            <span className="font-medium">Arena List</span>
          </button>
        </div>
        )}

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full">
         <div className=" px-6 py-4 flex items-center justify-between">
         
          
            <div className="flex flex-col gap-2 md:flex-row items-center space-x-2">
        
              {selectedTemplate && onBackToTemplates && judgeOrBattle !== 'judge' && !hasCurrentSession && (
                <button
                  onClick={onBackToTemplates}
                  className="flex items-center space-x-2 px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 border border-neutral-300 dark:border-neutral-600 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Templates</span>
                </button>
              )}
              {hasCurrentSession && (
                <button
                  onClick={handleNewChat}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>New</span>
                </button>
              )}
            </div>
          </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto ">
          {!hasCurrentSession ? (
            /* Welcome Screen with Centered Layout */
            <div className="min-h-full flex flex-col items-center justify-center p-6 pt-20 ">
              <div className="w-full max-w-6xl mx-auto space-y-8">
                {/* Arena Header */}
                <ArenaHeader 
                  challengeName={challenge?.challenge_name}
                  subtitle={t('arena.compare')}
                  judgeOrBattle={judgeOrBattle}
                />

                {/* Composer */}
                <div className="w-full">
                  {challenge && (
                    <ChatComposer
                      onSubmit={handleTranslateSubmit}
                      token={token}
                      selectedTemplate={selectedTemplate}
                      challenge={challenge}
                      judgeOrBattle={judgeOrBattle}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Active Translation Session - Lighter Background */
            <div className="min-h-full py-6">
              <div className="max-w-7xl mx-auto px-6 space-y-6">
                {/* Input Display */}
                <div className="text-neutral-700 dark:text-neutral-100 bg-neutral-200 dark:bg-neutral-800 backdrop-blur-xl rounded-xl border border-neutral-300 dark:border-neutral-700 font-monlam-2 text-lg p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary-600 dark:bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Languages className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2 relative">
                        <h3 className="font-medium">
                          {t('arena.inputText')}
                        </h3>
                        <button
                          type="button"
                          onClick={handleNewChat}
                          aria-label={t('arena.discardSession') || "Discard"}
                          className={`
                            absolute -top-6 -right-6 z-10
                            inline-flex items-center justify-center
                            p-2
                            rounded-bl-lg
                            border-l-1 border-b-1
                            transition-colors
                            bg-white/80 dark:bg-neutral-800/70
                            hover:bg-rose-50 hover:dark:bg-rose-900/40
                            border-neutral-300 dark:border-neutral-700
                            text-neutral-500 dark:text-neutral-200
                            hover:text-rose-700 hover:dark:text-rose-400
                            shadow-md
                            focus:outline-none focus:ring-2 focus:ring-rose-500
                          `}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="leading-relaxed">
                        {currentSession.input_text}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Model Response Compare */}
                <ModelResponseCompare
                  templateId={currentSession.template_id || null}
                  challengeId={currentSession.challenge_id}
                  inputText={currentSession.input_text}
                  onComplete={handleSessionComplete}
                  onNewTranslation={handleNewChat}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;