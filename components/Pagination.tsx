'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = itemsPerPage >= totalItems ? totalItems : Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages = [];
    
    // Always show previous page if it exists
    if (currentPage > 1) {
      pages.push(currentPage - 1);
    }
    
    // Always show current page
    pages.push(currentPage);
    
    // Always show next page if it exists
    if (currentPage < totalPages) {
      pages.push(currentPage + 1);
    }
    
    // Remove duplicates and sort
    return [...new Set(pages)].sort((a, b) => a - b);
  };

  return (
    <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <span className="text-sm text-gray-600">
          Showing {startItem} to {endItem} of {totalItems} results
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show</span>
          <select
            value={itemsPerPage >= totalItems ? totalItems : itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
            style={{ backgroundColor: "#001240" }}
          >
            <option value={5} className="bg-white text-gray-900">5 rows</option>
            <option value={10} className="bg-white text-gray-900">10 rows</option>
            <option value={25} className="bg-white text-gray-900">25 rows</option>
            <option value={50} className="bg-white text-gray-900">50 rows</option>
            <option value={totalItems} className="bg-white text-gray-900">All rows</option>
          </select>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {getVisiblePages().map((page, index) => (
            <button
              key={`page-${page}-${index}`}
              onClick={() => onPageChange(page)}
              className={`px-2 sm:px-3 py-2 text-sm rounded transition-colors cursor-pointer ${
                page === currentPage
                  ? 'text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
              style={page === currentPage ? { backgroundColor: "#001240" } : {}}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}