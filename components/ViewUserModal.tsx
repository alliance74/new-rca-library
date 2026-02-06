'use client';

import { X } from 'lucide-react';

interface UserDetail {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    level?: string;
    createdAt: string;
  };
  statistics: {
    totalBorrowed: number;
    currentlyBorrowed: number;
    overdueCount: number;
    returnedCount: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
  };
  currentBorrows: any[];
  borrowHistory: any[];
}

interface ViewUserModalProps {
  isOpen: boolean;
  user: UserDetail | null;
  onClose: () => void;
}

export default function ViewUserModal({ isOpen, user, onClose }: ViewUserModalProps) {
  if (!isOpen || !user) return null;

  const userName = user.user?.name || 'Unknown User';
  const userEmail = user.user?.email || 'No email';
  const userRole = user.user?.role === 'STUDENT' ? 'Student' : user.user?.role || 'Unknown';
  const userLevel = user.user?.level || 'Year 2C';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blur background */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4">
        {/* Header */}
        <div className="px-6 py-4" style={{ backgroundColor: '#001240' }}>
          <h2 className="text-lg font-bold text-white">User details</h2>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 md:w-56 md:h-56 bg-gray-300 rounded-lg overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center">
                  <span className="text-4xl font-bold text-amber-900">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm font-medium text-gray-600">User id</p>
                <p className="text-sm font-semibold text-gray-900">#{user.user.id.slice(0, 8)}...</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm font-medium text-gray-600">Full name</p>
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-sm font-semibold text-gray-900">{userEmail}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm font-medium text-gray-600">Role</p>
                <p className="text-sm font-semibold text-gray-900">{userRole}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p className="text-sm font-medium text-gray-600">Class info</p>
                <p className="text-sm font-semibold text-gray-900">{userLevel}</p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
