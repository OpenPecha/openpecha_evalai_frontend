import usePagination from '../hooks/usePagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({
    items,
    totalPages,
}: {
   readonly items: any[];
   readonly totalPages: number;
}) {
    const { currentPage, setCurrentPage } = usePagination();
    const hasMorePages = currentPage < totalPages;

    const handlePageChange = (page: 'previous' | 'next') => {
        const newPageNumber = page === 'previous' ? currentPage - 1 : currentPage + 1;
        setCurrentPage(newPageNumber);
    };
  return (
    <div>
      { items.length > 0 && totalPages > 1 && (
        <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col items-center space-y-4">
              {/* Pagination Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handlePageChange('previous')}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                
                <span className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange('next')}
                  disabled={!hasMorePages}
                  className="flex items-center px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pagination
