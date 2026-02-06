'use client';

import { X, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface UserFormData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  level: string;
  profilePicture?: File | null;
}

interface EditUserModalProps {
  isOpen: boolean;
  user: UserFormData | null;
  onClose: () => void;
  onSubmit?: (data: UserFormData) => void;
}

export default function EditUserModal({ isOpen, user, onClose, onSubmit }: EditUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    id: '',
    fullName: '',
    email: '',
    role: '',
    level: '',
    profilePicture: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      profilePicture: file,
    }));
    
    // Create preview URL
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blur background */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200" style={{ backgroundColor: '#001240' }}>
          <h2 className="text-xl font-bold text-white">Edit user</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email Id <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">select Role</option>
                <option value="Student">Student</option>
                <option value="Librarian">Librarian</option>
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Level <span className="text-red-500">*</span>
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">select level</option>
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
                <option value="Masters">Masters</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
          </div>

          {/* Upload File */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Upload profile picture
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {previewUrl ? (
                <div className="mb-4">
                  <img 
                    src={previewUrl} 
                    alt="Profile preview" 
                    className="w-24 h-24 object-cover rounded-full mx-auto mb-2"
                  />
                  <p className="text-sm text-gray-600 mb-2">{formData.profilePicture?.name}</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-900 font-medium mb-1">Upload a picture</p>
                  <p className="text-sm text-gray-600 mb-4">Supported formats: Jpg, PNG (Max 10MB)</p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="profile-edit-upload"
              />
              <label
                htmlFor="profile-edit-upload"
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                {previewUrl ? 'Change Picture' : 'Upload'}
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              type="submit"
              className="text-white px-8 py-2 rounded hover:opacity-90 transition-colors font-medium"
              style={{ backgroundColor: "#001240" }}>
              Update user
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
