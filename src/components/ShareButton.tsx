import { useState } from "react";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";

interface ShareButtonProps {
  challengeId: string;
  challengeTitle: string;
  onShare?: () => void;
}

const ShareButton = ({
  challengeId,
  challengeTitle,
  onShare,
}: ShareButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate the embed URL
  const baseUrl = window.location.origin;
  const embedUrl = `${baseUrl}/embed/leaderboard/${challengeId}`;

  // Generate iframe code
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" scrolling="auto" title="${challengeTitle} Leaderboard"></iframe>`;

  const handleShare = () => {
    setIsModalOpen(true);
    onShare?.();
  };

  const copyToClipboard = async (
    text: string,
    type: "url" | "iframe" = "url"
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      // Show different feedback based on what was copied
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error("Fallback copy failed: ", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const openInNewTab = () => {
    window.open(embedUrl, "_blank");
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 border border-blue-200 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
      >
        <Share2 className="w-4 h-4 mr-1.5" />
        Share
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <button
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity border-0 p-0"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
            ></button>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 sm:mx-0 sm:h-10 sm:w-10">
                    <Share2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Share Leaderboard
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Embed this leaderboard on your website or share the
                        direct link.
                      </p>
                    </div>

                    {/* Direct Link */}
                    <div className="mt-4">
                      <label
                        htmlFor="directLink"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Direct Link
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          id="directLink"
                          type="text"
                          value={embedUrl}
                          readOnly
                          onClick={() => copyToClipboard(embedUrl, "url")}
                          className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                        />
                        <button
                          onClick={() => copyToClipboard(embedUrl, "url")}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={openInNewTab}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Embed Code - Main Feature */}
                    <div className="mt-4">
                      <label
                        htmlFor="embedCode"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Embed Code (Click to Copy)
                      </label>
                      <div className="relative">
                        <textarea
                          id="embedCode"
                          value={iframeCode}
                          readOnly
                          rows={3}
                          onClick={() => copyToClipboard(iframeCode, "iframe")}
                          className="w-full px-3 py-2 text-sm border border-blue-300 dark:border-blue-600 rounded-md bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white resize-none cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                        />
                        <div className="absolute top-2 right-2 inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-800 border border-blue-300 dark:border-blue-600 shadow-sm text-xs leading-4 font-medium rounded text-blue-700 dark:text-blue-300">
                          {copied ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Click to Copy
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Usage Instructions */}
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                        How to use:
                      </h4>
                      <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                        <li>
                          • Copy the iframe code and paste it into your HTML
                        </li>
                        <li>• Adjust width and height as needed</li>
                        <li>• The leaderboard will update automatically</li>
                        <li>• Use the direct link to share with others</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton;
