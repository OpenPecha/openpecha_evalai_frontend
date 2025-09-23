import React, { useState, useCallback } from "react";
import { Languages, RotateCcw, History, ArrowLeft, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import ChatComposer from "../components/ChatComposer";
// import DualCompare from "../components/DualCompare"; // Commented out - using ModelResponseCompare instead
import ModelResponseCompare from "../components/ModelResponseCompare";
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
  console.log("challenge", challenge);
  console.log("selectedTemplate", selectedTemplate); 
  const { t } = useTranslation();
  const { isAuthenticated, getToken } = useAuth();
  const [sessions, setSessions] = useState<TranslateSession[]>([]);
  const [currentSession, setCurrentSession] = useState<TranslateSession | null>(null);
  const [token, setToken] = useState<string>("");

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
    modelA: string,
    modelB: string,
    selectionMethod?: string
  ) => {
    const session: TranslateSession = {
      id: Date.now().toString(),
      input_text: payload.input_text,
      template_id: payload.template_id,
      challenge_id: payload.challenge_id,
      modelA: {
        id: modelA,
        name: modelA,
        content: "",
        isStreaming: false,
        error: null,
        isComplete: false,
      },
      modelB: {
        id: modelB,
        name: modelB,
        content: "",
        isStreaming: false,
        error: null,
        isComplete: false,
      },
      selectedModel: null,
      score: null,
      voted: false,
      timestamp: new Date(),
      selectionMethod,
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
    console.log("Translation session completed");
  }, [currentSession]);

  // Start new chat
  const handleNewChat = useCallback(() => {
    setCurrentSession(null);
  }, []);


  const hasCurrentSession = currentSession !== null;
  const hasHistory = sessions.length > 0;

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold text-neutral-700 dark:text-neutral-100">
                  {t('arena.title')}
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800">
                  ✨ {t('arena.live')}
                </span>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t('arena.compare')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {judgeOrBattle === 'judge' && onBackToArena && (
              <button
                onClick={onBackToArena}
                className="flex items-center space-x-2 px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 border border-neutral-300 dark:border-neutral-600 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Arena</span>
              </button>
            )}
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
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Translation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {!hasCurrentSession ? (
          /* Welcome Screen */
          <div className="min-h-full flex items-center justify-center p-6">
            <div className="w-full max-w-6xl mx-auto space-y-8">
              {/* Welcome Section */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-3">
                  {t('arena.welcomeTitle')}
                </h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6 max-w-2xl mx-auto leading-relaxed">
                  {t('arena.welcomeSubtitle')}
                </p>
                
                {!isAuthenticated && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                        {t('arena.authNote')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="max-w-4xl mx-auto">
                { challenge && (
                  <ChatComposer
                    onSubmit={handleTranslateSubmit}
                    token={token}
                    selectedTemplate={selectedTemplate}
                    challenge={challenge}
                    judgeOrBattle={judgeOrBattle}
                  />
                )}
              </div>

              {/* History Section */}
              {hasHistory && (
                <div className="max-w-6xl mx-auto">
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-600 overflow-hidden shadow-lg">
                    <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-700/50 border-b border-neutral-200 dark:border-neutral-600">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-neutral-600 rounded-lg flex items-center justify-center">
                          <History className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-100">
                          {t('arena.recentRequests')}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sessions.slice(0, 6).map((session) => (
                          <div
                            key={session.id}
                            className="p-4 bg-neutral-50 dark:bg-neutral-700/30 border border-neutral-200 dark:border-neutral-600 rounded-xl hover:shadow-md transition-all duration-200"
                          >
                            <div className="space-y-3">
                              <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                                {session.input_text}
                              </p>
                              {/* <div className="flex items-center justify-between text-xs">
                                <div className="text-neutral-500 dark:text-neutral-400">
                                  <span className={
                                    session.selectedModel === session.modelA.name 
                                      ? 'font-semibold text-green-600 dark:text-green-400' 
                                      : 'font-medium'
                                  }>
                                    {session.modelA.name}
                                  </span>
                                  <span className="mx-1 text-neutral-400">vs</span>
                                  <span className={
                                    session.selectedModel === session.modelB.name 
                                      ? 'font-semibold text-green-600 dark:text-green-400' 
                                      : 'font-medium'
                                  }>
                                    {session.modelB.name}
                                  </span>
                                </div>
                              </div> */}
                              {session.selectedModel === 'both' && (
                                <div className="inline-flex items-center px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
                                  {t('translation.tie')}
                                </div>
                              )}
                              {session.selectedModel === 'none' && (
                                <div className="inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                                  {t('translation.neither')}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Active Translation Session */
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Input Display */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border font-[monlam-2] text-lg border-neutral-200 dark:border-neutral-600 p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Languages className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-neutral-700 dark:text-neutral-100 mb-2">
                    {t('arena.inputText')}
                  </h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {currentSession.input_text}
                  </p>
                </div>
              </div>
            </div>

            {/* Model Response Compare - New V2 Component */}
            <ModelResponseCompare
              templateId={currentSession.template_id || null}
              challengeId={currentSession.challenge_id}
              inputText={currentSession.input_text}
              onComplete={handleSessionComplete}
              onNewTranslation={handleNewChat}
            />

            {/* Dual Compare - Original Component (Commented Out) */}
            {/* <DualCompare
              modelA={currentSession.modelA.id}
              modelB={currentSession.modelB.id}
              payload={{
                input_text: currentSession.input_text,
                template_id: currentSession.template_id,
                challenge_id: currentSession.challenge_id,
              }}
              token={token}
              onComplete={handleSessionComplete}
              onNewTranslation={handleNewChat}
            /> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;