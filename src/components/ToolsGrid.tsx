import React, { useState } from "react";
import { ExternalLink, Grid, List, Search, RefreshCw, X } from "lucide-react";
import { useTools } from "../hooks/useTools";
import type { Tool } from "../api/tools";

interface ToolsGridProps {
  isOpen: boolean;
  onClose: () => void;
}

const ToolsGrid: React.FC<ToolsGridProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { data: toolsResponse, isLoading, error, refetch } = useTools();

  // Filter tools based on search query
  const filteredTools = React.useMemo(() => {
    if (!toolsResponse?.data) return [];
    
    if (!searchQuery.trim()) return toolsResponse.data;
    
    const query = searchQuery.toLowerCase();
    return toolsResponse.data.filter(tool => 
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query)
    );
  }, [toolsResponse?.data, searchQuery]);

  const handleToolClick = (tool: Tool) => {
    if (tool.link) {
      window.open(tool.link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, tool: Tool) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToolClick(tool);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Grid className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Pecha Studio Tools
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {toolsResponse?.count || 0} available tools
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
              title="Refresh tools"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid" 
                    ? "bg-white dark:bg-neutral-800 text-blue-600 shadow-sm" 
                    : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white"
                }`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list" 
                    ? "bg-white dark:bg-neutral-800 text-blue-600 shadow-sm" 
                    : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white"
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-white transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading tools...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 dark:text-red-400 mb-2">
                Failed to load tools
              </div>
              <button
                onClick={() => refetch()}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Try again
              </button>
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-neutral-600 dark:text-neutral-400 mb-2">
                {searchQuery ? "No tools found matching your search." : "No tools available."}
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                : "space-y-3"
            }>
              {filteredTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  onKeyDown={(e) => handleKeyDown(e, tool)}
                  className={`
                    group cursor-pointer transition-all duration-200 rounded-xl hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 relative
                    ${viewMode === "grid" 
                      ? "p-4 text-center hover:bg-neutral-50 dark:hover:bg-neutral-700/50 hover:scale-105" 
                      : "p-3 flex items-center gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                    }
                  `}
                >
                  {/* Tool Icon */}
                  <div className={`
                    ${viewMode === "grid" ? "w-16 h-16 mx-auto mb-3" : "w-12 h-12 flex-shrink-0"}
                    bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-600 
                    rounded-xl flex items-center justify-center overflow-hidden
                    group-hover:shadow-md transition-shadow
                  `}>
                    {tool.icon ? (
                      <img 
                        src={tool.icon} 
                        alt={tool.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to text if image fails to load
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="text-lg font-semibold text-neutral-600 dark:text-neutral-300">${tool.name.charAt(0)}</span>`;
                          }
                        }}
                      />
                    ) : (
                      <span className="text-lg font-semibold text-neutral-600 dark:text-neutral-300">
                        {tool.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Tool Info */}
                  <div className={viewMode === "grid" ? "text-center" : "flex-1 min-w-0"}>
                    <h3 className={`
                      font-medium text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors
                      ${viewMode === "grid" ? "text-sm mb-1" : "text-base mb-1"}
                    `}>
                      {tool.name}
                    </h3>
                    <p className={`
                      text-neutral-600 dark:text-neutral-400 
                      ${viewMode === "grid" ? "text-xs line-clamp-2" : "text-sm line-clamp-1"}
                    `}>
                      {tool.description}
                    </p>
                    {viewMode === "list" && (
                      <div className="flex items-center gap-2 mt-1">
                        {tool.category && (
                          <span className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-full">
                            {tool.category}
                          </span>
                        )}
                        <ExternalLink className="w-3 h-3 text-neutral-400" />
                      </div>
                    )}
                  </div>

                  {/* External link indicator for grid view */}
                  {viewMode === "grid" && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-3 h-3 text-neutral-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolsGrid;
