import React, { useState, useCallback } from "react";
import { Languages, RotateCcw, History } from "lucide-react";
import ChatComposer from "../components/ChatComposer";
import DualCompare from "../components/DualCompare";
import { useAuth } from "../auth/use-auth-hook";
import { DEFAULT_TRANSLATE_PROMPT } from "../types/translate";
import type { TranslateRequest, TranslateSession } from "../types/translate";

const Chat = () => {
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
      inputText: payload.text,
      targetLanguage: payload.target_language,
      template: payload.template,
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
  const handleSessionComplete = useCallback(() => {
    // Session is complete, could add to history or perform other actions
    console.log("Translation session completed");
  }, []);

  // Start new chat
  const handleNewChat = useCallback(() => {
    setCurrentSession(null);
  }, []);

  // View previous session
  const handleViewSession = useCallback((session: TranslateSession) => {
    setCurrentSession(session);
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
                  AI Translation Arena
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800">
                  ✨ Live
                </span>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Compare AI translations and vote for better results
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
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
          <div className="h-full flex items-center justify-center p-6">
            <div className="max-w-4xl mx-auto">
              {/* Welcome Section */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Languages className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-3xl font-bold text-neutral-700 dark:text-neutral-100 mb-4">
                  AI Translation Arena
                </h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
                  Compare translations from different AI models and help improve translation quality through your feedback.
                </p>
                
                {!isAuthenticated && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      <strong>Note:</strong> Authentication is recommended for voting and personalized model suggestions.
                    </p>
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-600 p-6">
                <ChatComposer
                  onSubmit={handleTranslateSubmit}
                  token={token}
                />
              </div>

              {/* History Section */}
              {hasHistory && (
                <div className="mt-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <History className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                    <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-100">
                      Recent Translations
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions.slice(0, 6).map((session) => (
                      <button
                        key={session.id}
                        onClick={() => handleViewSession(session)}
                        className="p-4 text-left bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="space-y-2">
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2 group-hover:text-neutral-700 dark:group-hover:text-white transition-colors">
                            {session.inputText}
                          </p>
                          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                            <span>{session.modelA.name} vs {session.modelB.name}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Active Translation Session */
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Input Display */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-600 p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Languages className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-neutral-700 dark:text-neutral-100 mb-2">
                    Input Text
                  </h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {currentSession.inputText}
                  </p>
                </div>
              </div>
            </div>

            {/* Dual Compare */}
            <DualCompare
              modelA={currentSession.modelA.id}
              modelB={currentSession.modelB.id}
              payload={{
                text: currentSession.inputText,
                prompt: DEFAULT_TRANSLATE_PROMPT,
                template: currentSession.template,
                target_language: currentSession.targetLanguage,
              }}
              token={token}
              onComplete={handleSessionComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;