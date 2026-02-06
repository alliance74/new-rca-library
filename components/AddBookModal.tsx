'use client';

import { X, Upload } from 'lucide-react';
import { useState } from 'react';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export default function AddBookModal({ isOpen, onClose, onSubmit, isLoading = false }: AddBookModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    category: '',
    stock: '',
    author: '',
    description: '',
    cover: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      cover: file,
    }));
    
    // Create preview URL
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(formData);
      if (!isLoading) {
        setFormData({ title: '', isbn: '', category: '', stock: '', author: '', description: '', cover: null });
        setPreviewUrl(null);
      }
    }
  };

  if (!isOpen) return null;

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
          <h2 className="text-xl font-bold text-white">Add Book</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 py-12 overflow-y-auto flex-1">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-gray-600 font-medium">Adding book...</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Book Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Book title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                placeholder="Enter the book title"
                value={formData.title}
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

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">select category</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Biography">Biography</option>
                <option value="Technology">Technology</option>
                <option value="Education">Education</option>
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Stock (Number of books) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
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
                name="author"
                placeholder="Enter author name"
                value={formData.author}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description (optional)
              </label>
              <textarea
                name="description"
                placeholder="Write a book description"
                value={formData.description}
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
              {previewUrl ? (
                <div className="mb-4">
                  <img 
                    src={previewUrl} 
                    alt="Book cover preview" 
                    className="w-32 h-40 object-cover rounded mx-auto mb-2 shadow-md"
                  />
                  <p className="text-sm text-gray-600 mb-2">{formData.cover?.name}</p>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-900 font-medium mb-1">Upload a picture</p>
                  <p className="text-sm text-gray-600 mb-4">Supported formats: Jpg, PNG (Max 10MB)</p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="cover-upload"
              />
              <label
                htmlFor="cover-upload"
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                {previewUrl ? 'Change Cover' : 'Upload'}
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="text-white px-8 py-2 rounded hover:opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ backgroundColor: "#001240" }}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <img 
                    src="/assets/logo.png" 
                    alt="Loading" 
                    className="w-4 h-4 object-contain"
                  />
                  Adding...
                </div>
              ) : (
                'Add Book'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="bg-white border-2 border-gray-300 text-gray-900 px-8 py-2 rounded hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
