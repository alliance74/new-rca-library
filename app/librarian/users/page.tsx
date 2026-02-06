'use client';

import UsersTable from "@/components/UsersTable";
import EditUserModal, { UserFormData } from "@/components/EditUserModal";
import DeleteUserModal from "@/components/DeleteUserModal";
import ViewUserModal from "@/components/ViewUserModal";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePagination } from "@/hooks/usePagination";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

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

export default function UsersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserFormData | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<UserDetail | null>(null);
  const [usersData, setUsersData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          router.push('/');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsersData(data.users || []);
        } else {
          setError('Failed to fetch users');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Error loading users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  // Filter users based on search query and exclude admin
  const filteredData = usersData
    .filter(user => user.role !== 'LIBRARIAN') // Exclude admin/librarian
    .filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role === 'STUDENT' ? 'Student' : user.role,
      loans: 0, // Will be fetched when viewing user details
      status: 'Active' as const,
    }));

  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData,
    totalItems,
    handlePageChange,
  } = usePagination({ data: filteredData, initialItemsPerPage: 10 });

  const handleViewUser = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setViewingUser(data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  const handleEditUser = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUser({
          id: data.user.id,
          fullName: data.user.name,
          email: data.user.email,
          role: data.user.role === 'USER' ? 'Student' : data.user.role === 'LIBRARIAN' ? 'Librarian' : data.user.role,
          level: data.user.level || '',
        });
        setIsEditModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching user details for edit:', err);
    }
  };

  const handleDeleteUser = (id: string) => {
    setSelectedUserId(id);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = async (data: UserFormData) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      // Update user logic here when backend endpoint is ready
      console.log('Updated user:', data);
      setIsEditModalOpen(false);
      setSelectedUser(null);
      // Refresh users list
      const response = await fetch(`${apiUrl}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const updatedData = await response.json();
        setUsersData(updatedData.users || []);
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      // Delete user logic here when backend endpoint is ready
      console.log('Deactivated user:', selectedUserId);
      setIsDeleteModalOpen(false);
      setSelectedUserId(null);
      // Refresh users list
      const response = await fetch(`${apiUrl}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const updatedData = await response.json();
        setUsersData(updatedData.users || []);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  return (
    <div className="w-full">
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <img 
            src="/assets/logo.png" 
            alt="Loading" 
            className="h-12 w-12 object-contain"
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="flex gap-4 mb-6 items-center">
            <div className="w-1/2 flex items-center gap-3 border-2 border-gray-300 rounded-lg px-4 py-2 bg-white">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="search users"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
          </div>

          <EditUserModal
            isOpen={isEditModalOpen}
            user={selectedUser}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedUser(null);
            }}
            onSubmit={handleEditSubmit}
          />

          <DeleteUserModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedUserId(null);
            }}
            onConfirm={handleDeleteConfirm}
          />

          <ViewUserModal
            isOpen={isViewModalOpen}
            user={viewingUser}
            onClose={() => {
              setIsViewModalOpen(false);
              setViewingUser(null);
            }}
          />

          <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            <UsersTable 
              data={paginatedData}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />

            <div className="mt-8 flex items-center justify-between px-8 py-6">
              <p className="text-sm text-gray-600">Showing {paginatedData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button 
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      page === currentPage 
                        ? 'bg-slate-900 text-white' 
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}>
                    {page}
                  </button>
                ))}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
