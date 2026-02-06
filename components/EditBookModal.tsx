'use client';

import { X, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EditBookModalProps {
  isOpen: boolean;
  book?: {
    id: string;
    title: string;
    isbn: string;
    author: string;
    genre: string;
    stock: string;
    status: 'Available' | 'Borrowed';
  } | null;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

export default function EditBookModal({ isOpen, book, onClose, onSubmit }: EditBookModalProps) {
  const [formData, setFormData] = useState({
    bookTitle: '',
    isbn: '',
    genre: '',
    stock: '',
    authorName: '',
    biography: '',
  });

  useEffect(() => {
    if (book) {
      setFormData({
        bookTitle: book.title,
        isbn: book.isbn,
        genre: book.genre,
        stock: book.stock,
        authorName: book.author,
        biography: '',
      });
    }
  }, [book]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blur background */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200" style={{ backgroundColor: '#001240' }}>
          <h2 className="text-xl font-bold text-white">Edit Book</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 py-12 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Book Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Book title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bookTitle"
                placeholder="Enter the book title"
                value={formData.bookTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ISBN */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                ISBN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="isbn"
                placeholder="Enter the ISBN"
                value={formData.isbn}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Genre */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Genre <span className="text-red-500">*</span>
              </label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">select genre</option>
                <option value="fiction">Fiction</option>
                <option value="non-fiction">Non-Fiction</option>
                <option value="science">Science</option>
                <option value="history">History</option>
                <option value="biography">Biography</option>
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Stock (Number of books) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="stock"
                placeholder="Enter number of books"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Author Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Author name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="authorName"
                placeholder="Enter author name"
                value={formData.authorName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Biography */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Biography (optional) <span className="text-red-500">*</span>
              </label>
              <textarea
                name="biography"
                placeholder="Write a book biography"
                value={formData.biography}
                onChange={handleInputChange}
                rows={1}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Upload Book Cover */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Upload book cover <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-900 font-medium mb-1">Upload a picture</p>
              <p className="text-sm text-gray-600 mb-4">Supported formats: Pdf, Docx, Jpg, PNG(Max 10MB)</p>
              <button
                type="button"
                className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                Upload
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              type="submit"
              className="text-white px-8 py-2 rounded hover:opacity-90 transition-colors font-medium"
              style={{ backgroundColor: "#001240" }}>
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-white border-2 border-gray-300 text-gray-900 px-8 py-2 rounded hover:bg-gray-50 transition-colors font-medium"
            >
              cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
