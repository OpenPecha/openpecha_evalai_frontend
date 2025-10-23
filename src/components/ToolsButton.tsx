import React, { useState } from "react";
import { Grid3X3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import ToolsGrid from "./ToolsGrid";

const ToolsButton: React.FC<{ isSidebarOpen: boolean }> = ({ isSidebarOpen }) => {
  const { t } = useTranslation();
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsToolsOpen(true)}
        className="p-2 flex justify-between w-full text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
        title={t('tools.title')}
      >
        {isSidebarOpen && <div className="flex items-center space-x-3">
          <span className="font-medium text-neutral-700 dark:text-neutral-100">
            {t('sidebar.pechaTools')}
          </span>
        </div>}
        <Grid3X3 className="w-5 h-5" />
      </button>

      <ToolsGrid
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
      />
    </>
  );
};

export default ToolsButton;
