/**
 * TemplateNameLink Component
 * Displays a clickable template name link
 */

import React from 'react';

interface TemplateNameLinkProps {
  templateName: string | undefined;
  templateId: string | undefined;
  onTemplateClick: (templateId: string) => void;
}

const TemplateNameLink: React.FC<TemplateNameLinkProps> = ({ 
  templateName, 
  templateId, 
  onTemplateClick 
}) => {
  const handleClick = () => {
    if (templateId) {
      onTemplateClick(templateId);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="text-xs text-blue-400 ml-4 hover:text-blue-300 hover:underline transition-colors cursor-pointer"
      title="Click to view template details"
    >
      {templateName}
    </button>
  );
};

export default TemplateNameLink;

