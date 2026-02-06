'use client';

import { Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function LibrarianProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const router = useRouter();

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          router.push('/');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data.user);
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
          });
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error loading profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/');
        return;
      }

      // For now, we'll just update the local state
      // In a real app, you'd send this to the backend
      setProfile(prev => prev ? {
        ...prev,
        name: formData.name,
        email: formData.email,
      } : null);

      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      router.push('/');
    } catch (err) {
      console.error('Error logging out:', err);
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <img 
          src="/assets/logo.png" 
          alt="Loading" 
          className="h-12 w-12 object-contain"
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <p className="text-red-600">{error || 'Failed to load profile'}</p>
      </div>
    );
  }

  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-600">{initials}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-600">{profile.role}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profile.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profile.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <p className="text-gray-900 font-medium">{profile.role}</p>
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center gap-4 mt-8">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#001240" }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Password & Security */}
      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Password & Security</h3>
        </div>

        <div className="mb-8">
          <p className="text-gray-600 mb-4">Manage your account security and sign out from other sessions.</p>
        </div>

        <button 
          onClick={handleLogout}
          className="text-red-600 hover:text-red-700 font-medium transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}