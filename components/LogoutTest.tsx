'use client';

import { useAuth } from '@/hooks/useAuth';

export default function LogoutTest() {
  const { user, logout, isLoading } = useAuth();

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Logout Test Component</h3>
      <p>User: {user.email}</p>
      <p>Role: {user.role}</p>
      <button
        onClick={() => logout()}
        disabled={isLoading}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        {isLoading ? 'Logging out...' : 'Test Logout'}
      </button>
    </div>
  );
}