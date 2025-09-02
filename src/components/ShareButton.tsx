import { useState } from "react";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";

interface ShareButtonProps {
  challengeId: string;
  challengeTitle: string;
  onShare?: () => void;
  autoOpen?: boolean;
  onClose?: () => void;
}

const ShareButton = ({
  challengeId,
  challengeTitle,
  onShare,
  autoOpen = false,
  onClose,
}: ShareButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(autoOpen);
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
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

  const closeModal = () => {
    setIsModalOpen(false);
    onClose?.();
  };

  return (
    <>
      {!autoOpen && (
        <button
          onClick={handleShare}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium  rounded-lg "
        >
          <Share2 className="w-4 h-4 mr-1.5" />
          Share
        </button>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <button
            className="fixed inset-0 bg-[rgba(0,0,0,0.5)] dark:bg-[rgba(0,0,0,0.5)] bg-opacity-50 border-0 p-0"
            onClick={closeModal}
            aria-label="Close modal"
          ></button>

          {/* YouTube-Style Modal */}
          <div className="relative bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-96 max-w-[90vw] mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-100">
                Share
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {/* Share Options */}
              <div className="flex justify-center space-x-6 mb-6">
                <button
                  onClick={() => copyToClipboard(iframeCode)}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-800/30 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary-200 dark:group-hover:bg-primary-700/40 transition-colors">
                    <svg
                      className="w-6 h-6 text-primary-600 dark:text-primary-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Embed
                  </span>
                </button>

                <button
                  onClick={() => copyToClipboard(embedUrl)}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                    <Copy className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Copy link
                  </span>
                </button>

                <button
                  onClick={openInNewTab}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                    <ExternalLink className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Open
                  </span>
                </button>
              </div>

              {/* Link Input */}
              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <input
                  type="text"
                  value={embedUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-neutral-800 dark:text-neutral-100 outline-none"
                />
                <button
                  onClick={() => copyToClipboard(embedUrl)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center space-x-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Additional Info */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                Click "Embed" to copy iframe code for websites
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton;
