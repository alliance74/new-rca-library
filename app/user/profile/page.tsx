'use client';

import { useAuth } from "@/hooks/useAuth";
import { User, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-300">
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.name || 'User'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-amber-400 flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'User'}</h2>
            <p className="text-gray-600 capitalize">{user?.role?.toLowerCase() || 'Student'}</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <p className="text-gray-900 font-medium">{user?.name || 'Not provided'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <p className="text-gray-900 font-medium">{user?.email || 'Not provided'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <p className="text-gray-900 font-medium capitalize">
              {user?.role === 'STUDENT' ? 'Student' : 
               user?.role === 'TEACHER' ? 'Teacher' : 
               user?.role === 'LIBRARIAN' ? 'Librarian' : 'Student'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class/Level</label>
            <p className="text-gray-900 font-medium">{user?.level || 'Not assigned'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
            <p className="text-gray-900 font-medium">{user?.id || 'Not provided'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
            <p className="text-gray-900 font-medium">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}