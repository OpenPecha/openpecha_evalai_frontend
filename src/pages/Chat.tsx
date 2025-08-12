import { useState, useRef } from "react";
import { Send, MessageSquare, ThumbsUp, RotateCcw, Crown } from "lucide-react";

interface Conversation {
  id: string;
  userPrompt: string;
  modelA: {
    name: string;
    response: string;
    isLoading: boolean;
  };
  modelB: {
    name: string;
    response: string;
    isLoading: boolean;
  };
  vote: "A" | "B" | "tie" | null;
  timestamp: Date;
}

const examplePrompts = [
  "Help me analyze the results of my OCR model",
  "What are the best practices for training Tibetan language models?",
  "Explain how to improve my model's accuracy on the leaderboard",
  "How can I prepare my data for this challenge?",
];

const availableModels = [
  "GPT-4 Turbo",
  "Claude-3 Sonnet",
  "Gemini Pro",
  "Llama-2 70B",
  "Mixtral 8x7B",
  "GPT-3.5 Turbo",
  "Claude-3 Haiku",
  "PaLM 2",
];

const Chat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentModels, setCurrentModels] = useState<{ A: string; B: string }>({
    A: availableModels[0],
    B: availableModels[1],
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const getRandomModels = () => {
    const shuffled = [...availableModels].sort(() => Math.random() - 0.5);
    return { A: shuffled[0], B: shuffled[1] };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const conversation: Conversation = {
      id: Date.now().toString(),
      userPrompt: inputValue.trim(),
      modelA: {
        name: currentModels.A,
        response: "",
        isLoading: true,
      },
      modelB: {
        name: currentModels.B,
        response: "",
        isLoading: true,
      },
      vote: null,
      timestamp: new Date(),
    };

    setConversations((prev) => [conversation, ...prev]);
    setInputValue("");

    // Simulate model responses with different delays
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversation.id
            ? {
                ...conv,
                modelA: {
                  ...conv.modelA,
                  response: `Response from ${currentModels.A}: I understand you're asking about "${conversation.userPrompt}". As ${currentModels.A}, I would approach this by providing detailed technical guidance on model training, evaluation metrics, and optimization strategies specifically tailored for your challenge. This includes data preprocessing techniques, hyperparameter tuning, and performance monitoring best practices.`,
                  isLoading: false,
                },
              }
            : conv
        )
      );
    }, 1000 + Math.random() * 1000);

    setTimeout(() => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversation.id
            ? {
                ...conv,
                modelB: {
                  ...conv.modelB,
                  response: `Response from ${currentModels.B}: Regarding "${conversation.userPrompt}", I'd focus on practical implementation steps and best practices. Here's how ${currentModels.B} would recommend tackling this challenge with actionable insights and proven methodologies. Key areas include dataset quality assessment, model architecture selection, and systematic evaluation protocols.`,
                  isLoading: false,
                },
              }
            : conv
        )
      );
    }, 1500 + Math.random() * 1500);

    // Set new random models for next question
    setCurrentModels(getRandomModels());
  };

  const handleVote = (conversationId: string, vote: "A" | "B" | "tie") => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, vote } : conv
      )
    );
  };

  const handleNewChat = () => {
    setConversations([]);
    setCurrentModels(getRandomModels());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExampleClick = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const getModelCardClasses = (
    vote: "A" | "B" | "tie" | null,
    model: "A" | "B"
  ) => {
    if (vote === model) {
      return "border-green-500 bg-green-50 dark:bg-green-900/10";
    }
    if (vote && vote !== model && vote !== "tie") {
      return "border-gray-200 dark:border-gray-600 opacity-75";
    }
    return "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500";
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Model Arena
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  🚀 Coming Soon
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Compare AI models and vote for better responses - Feature in
                development
              </p>
            </div>
          </div>
          {conversations.length > 0 && (
            <button
              onClick={handleNewChat}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          /* Welcome Screen */
          <div className="h-full flex items-center justify-center p-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center justify-center space-x-3 mb-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Model Arena
                </h2>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  🔨 Coming Soon
                </span>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                This feature is currently in development. Soon you'll be able to
                compare responses from different AI models and vote for better
                answers to help improve AI evaluation.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  <strong>Preview Mode:</strong> The interface below shows how
                  the Model Arena will work when it's ready. Stay tuned for
                  updates!
                </p>
              </div>

              {/* Example Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examplePrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleExampleClick(prompt)}
                    className="p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {prompt}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Conversations List */
          <div className="max-w-7xl mx-auto p-6 space-y-8">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="space-y-6">
                {/* User Question */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">Q</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {conversation.userPrompt}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Model Responses Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Model A */}
                  <div
                    className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-200 ${getModelCardClasses(
                      conversation.vote,
                      "A"
                    )}`}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Model A
                          </span>
                          {conversation.vote === "A" && (
                            <Crown className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {conversation.vote
                            ? conversation.modelA.name
                            : "Hidden until vote"}
                        </span>
                      </div>

                      {conversation.modelA.isLoading ? (
                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-sm">
                            Generating response...
                          </span>
                        </div>
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {conversation.modelA.response}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Model B */}
                  <div
                    className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all duration-200 ${getModelCardClasses(
                      conversation.vote,
                      "B"
                    )}`}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Model B
                          </span>
                          {conversation.vote === "B" && (
                            <Crown className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {conversation.vote
                            ? conversation.modelB.name
                            : "Hidden until vote"}
                        </span>
                      </div>

                      {conversation.modelB.isLoading ? (
                        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-sm">
                            Generating response...
                          </span>
                        </div>
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {conversation.modelB.response}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Voting Buttons */}
                {!conversation.modelA.isLoading &&
                  !conversation.modelB.isLoading && (
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={() => handleVote(conversation.id, "A")}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                          conversation.vote === "A"
                            ? "bg-green-600 text-white"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400"
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>A is Better</span>
                      </button>

                      <button
                        onClick={() => handleVote(conversation.id, "tie")}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                          conversation.vote === "tie"
                            ? "bg-gray-600 text-white"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 hover:text-gray-600 dark:hover:text-gray-400"
                        }`}
                      >
                        Tie
                      </button>

                      <button
                        onClick={() => handleVote(conversation.id, "B")}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                          conversation.vote === "B"
                            ? "bg-green-600 text-white"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400"
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>B is Better</span>
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="[Preview Mode] Ask a question to see how model comparison will work..."
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-6 py-4 pr-14 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 text-lg"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors duration-200"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🚧 Preview: Simulated responses for demonstration purposes
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Coming Soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
