'use client';

import BooksManagementTable from "@/components/BooksManagementTable";
import AddBookModal from "@/components/AddBookModal";
import ViewBookModal from "@/components/ViewBookModal";
import DeleteBookModal from "@/components/DeleteBookModal";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { useGlobalNotification } from '@/hooks/useGlobalNotification';

interface Book {
  id: string;
  title: string;
  author: string;
  ISBN: string;
  genre: string;
  publisher: string;
  totalCopies: number;
  availableCopies: number;
  cover_image?: string;
  createdAt: string;
}

export default function BooksPage() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { showSuccess, showError } = useGlobalNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [viewingBook, setViewingBook] = useState<any>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [booksData, setBooksData] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [isDeletingBook, setIsDeletingBook] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch books on mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          router.push('/');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/admin/books`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('DEBUG: Books page - API response:', data);
          console.log('DEBUG: Books page - Books array:', data.books);
          setBooksData(data.books || []);
        } else {
          setError('Failed to fetch books');
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Error loading books');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [router]);

  // Filter books based on search query
  const filteredData = booksData
    .filter(book =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.ISBN.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(book => {
      const totalCopies = book.totalCopies || 0;
      const availableCopies = book.availableCopies || 0;
      
      return {
        id: book.id,
        cover: book.cover_image,
        title: book.title || 'Unknown Title',
        isbn: book.author || 'Unknown Author', // Show author in ISBN column
        category: book.genre || book.publisher || 'Unknown Genre',
        stock: `${availableCopies}/${totalCopies}`,
        status: (availableCopies > 0) ? 'Active' as const : 'Borrowed' as const,
      };
    });

  // Client-side pagination (same as user books page)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleViewBook = async (id: string) => {
    try {
      console.log('DEBUG: handleViewBook called with id:', id);
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/admin/books/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('DEBUG: API response:', data);
        
        // The admin endpoint returns { book: {...}, statistics: {...}, ... }
        const bookData = data.book;
        console.log('DEBUG: Book data:', bookData);
        
        const totalCopies = bookData.totalCopies || 0;
        const availableCopies = bookData.availableCopies || 0;
        
        const modalData = {
          id: bookData.id,
          title: bookData.title || 'Unknown Title',
          isbn: bookData.ISBN || 'N/A',
          author: bookData.author || 'Unknown Author',
          genre: bookData.genre || bookData.publisher || 'Unknown Genre',
          stock: `${availableCopies}/${totalCopies}`,
          availability: (availableCopies > 0) ? 'Available' as const : 'Borrowed' as const,
          cover: bookData.cover_image,
        };
        
        console.log('DEBUG: Modal data:', modalData);
        setViewingBook(modalData);
        setIsViewModalOpen(true);
      } else {
        console.error('DEBUG: API request failed:', response.status);
      }
    } catch (err) {
      console.error('Error fetching book details:', err);
    }
  };

  const handleDeleteBook = async () => {
    try {
      setIsDeletingBook(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/admin/books/${selectedBookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh books list
        const booksResponse = await fetch(`${apiUrl}/admin/books`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (booksResponse.ok) {
          const data = await booksResponse.json();
          setBooksData(data.books || []);
        }
        showSuccess('Book Deleted', 'Book has been deleted successfully.');
        setIsDeleteModalOpen(false);
        setSelectedBookId(null);
      } else {
        const errorData = await response.json();
        showError('Delete Failed', errorData.message || 'Failed to delete book');
      }
    } catch (err) {
      console.error('Error deleting book:', err);
      showError('Delete Error', 'An error occurred while deleting the book. Please try again.');
    } finally {
      setIsDeletingBook(false);
    }
  };

  const handleAddBook = async (data: any) => {
    try {
      setIsAddingBook(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('author', data.author);
      formData.append('ISBN', data.isbn);
      formData.append('genre', data.category); // Send category as genre
      formData.append('publisher', data.category); // Also send as publisher
      formData.append('totalCopies', data.stock.toString()); // Changed from remaining_copies to totalCopies
      if (data.description) formData.append('description', data.description);
      if (data.cover) formData.append('cover_image', data.cover);

      const response = await fetch(`${apiUrl}/admin/books`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        // Refresh books list
        const booksResponse = await fetch(`${apiUrl}/admin/books`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (booksResponse.ok) {
          const updatedData = await booksResponse.json();
          setBooksData(updatedData.books || []);
        }
        setIsModalOpen(false);
        showSuccess('Book Added', 'Book has been added successfully.');
      } else {
        const errorData = await response.json();
        showError('Add Book Failed', errorData.message || 'Failed to add book');
      }
    } catch (err) {
      console.error('Error adding book:', err);
      showError('Add Book Error', 'An error occurred while adding the book. Please try again.');
    } finally {
      setIsAddingBook(false);
    }
  };

  return (
    <div className="w-full">
      {isLoading && (
        <div className="w-full">
          {/* Header Skeleton */}
          <div className="flex gap-4 mb-6 items-center">
            <div className="flex-1 relative max-w-md">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg h-10 bg-gray-200 animate-pulse" />
            </div>
            <div className="px-6 py-2 text-white rounded-lg h-10 w-32 bg-gray-300 animate-pulse" />
          </div>

          {/* Table Skeleton */}
          <TableSkeleton rows={10} columns={8} />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="flex justify-between items-center mb-6 gap-4">
            <div className="flex-shrink-0 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search books"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <select
                value={itemsPerPage >= filteredData.length ? filteredData.length : itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-4 py-2 text-white rounded-[5px] hover:bg-opacity-90 transition-colors border-none outline-none text-sm"
                style={{ backgroundColor: "#001240" }}
              >
                <option value={5} className="bg-white text-gray-900">5 rows</option>
                <option value={10} className="bg-white text-gray-900">10 rows</option>
                <option value={25} className="bg-white text-gray-900">25 rows</option>
                <option value={50} className="bg-white text-gray-900">50 rows</option>
                <option value={filteredData.length} className="bg-white text-gray-900">All rows ({filteredData.length})</option>
              </select>
              <button 
                onClick={() => setIsModalOpen(true)}
                disabled={isAddingBook}
                className="text-white px-6 py-2 rounded hover:opacity-90 transition-colors flex items-center gap-2 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ backgroundColor: "#001240" }}>
                {isAddingBook ? (
                  <>
                    <img 
                      src="/assets/logo.png" 
                      alt="Loading" 
                      className="w-4 h-4 object-contain"
                    />
                    Adding...
                  </>
                ) : (
                  'Add book +'
                )}
              </button>
            </div>
          </div>

          <AddBookModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddBook}
            isLoading={isAddingBook}
          />

          <ViewBookModal
            isOpen={isViewModalOpen}
            book={viewingBook}
            onClose={() => {
              setIsViewModalOpen(false);
              setViewingBook(null);
            }}
          />

          <DeleteBookModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedBookId(null);
            }}
            onConfirm={handleDeleteBook}
            isLoading={isDeletingBook}
          />

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <BooksManagementTable 
              data={paginatedData}
              onView={handleViewBook}
              onDelete={(id) => {
                setSelectedBookId(id);
                setIsDeleteModalOpen(true);
              }}
              isLoading={isLoading}
              isDeletingBook={isDeletingBook}
            />

            <div className="p-4 border-t border-gray-200">
              {/* Desktop Pagination */}
              <div className="hidden sm:flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} results
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          currentPage === pageNum
                            ? 'text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                        style={currentPage === pageNum ? { backgroundColor: "#001240" } : {}}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Mobile Pagination */}
              <div className="flex sm:hidden flex-col gap-3">
                <div className="text-center text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({filteredData.length} total)
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button 
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-white rounded" style={{ backgroundColor: "#001240" }}>
                    {currentPage}
                  </span>
                  <button 
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
