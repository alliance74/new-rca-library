'use client';

import { Suspense, useState } from 'react';
import StatCard from "@/components/StatCard";
import StatCardSkeleton from "@/components/skeletons/StatCardSkeleton";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { Search, Filter, DollarSign, AlertTriangle, CheckCircle, Clock, Eye, Download, Plus, Edit, X, Trash2, CreditCard } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  useFines, 
  useFineStats, 
  useCreateFine, 
  useUpdateFine, 
  useDeleteFine,
  useMarkFineAsPaid,
  useExportFines 
} from '@/hooks/useFines';
import { CreateFineData, UpdateFineData, QueryFinesParams } from '@/services/finesService';
import finesService from '@/services/finesService';
import { useNotifications } from '@/contexts/NotificationContext';

// Loading fallback component
function FinesPageFallback() {
  return (
    <div>
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={10} columns={8} />
    </div>
  );
}

// Main data component
function FinesPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFine, setSelectedFine] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddFineModalOpen, setIsAddFineModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'PAID' | 'UNPAID',
    dateRange: 'all' as 'all' | 'today' | 'week' | 'month',
  });

  // Form states
  const [addFineForm, setAddFineForm] = useState({
    userEmail: '',
    userClass: '',
    bookISBN: '',
    amount: '',
    daysOverdue: '',
    reason: '',
  });
  const [isCreatingFine, setIsCreatingFine] = useState(false);
  const [isUpdatingFine, setIsUpdatingFine] = useState(false);

  const [editFineForm, setEditFineForm] = useState({
    amount: '',
    reason: '',
    status: 'UNPAID' as 'PAID' | 'UNPAID',
    daysOverdue: '',
  });

  // Build query parameters
  const queryParams: QueryFinesParams = {
    search: searchQuery || undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    dateRange: filters.dateRange !== 'all' ? filters.dateRange : undefined,
    page: currentPage,
    limit: itemsPerPage,
  };

  // API hooks
  const { data: finesData, isLoading: finesLoading, error: finesError } = useFines(queryParams);
  const { data: stats, isLoading: statsLoading } = useFineStats();
  const createFineMutation = useCreateFine();
  const updateFineMutation = useUpdateFine();
  const deleteFineMutation = useDeleteFine();
  const markAsPaidMutation = useMarkFineAsPaid();
  const exportFinesMutation = useExportFines();
  const { addNotification } = useNotifications();

  const fines = finesData?.fines || [];
  const pagination = finesData?.pagination;

  const statsData = [
    {
      icon: DollarSign,
      label: "Total Fines",
      value: stats?.totalFines?.toString() || "0",
      change: `${stats?.totalAmount?.toLocaleString() || 0} RWF total`,
    },
    {
      icon: AlertTriangle,
      label: "Unpaid Fines",
      value: stats?.unpaidFines?.toString() || "0",
      change: `${stats?.unpaidAmount?.toLocaleString() || 0} RWF pending`,
    },
    {
      icon: CheckCircle,
      label: "Paid Fines",
      value: stats?.paidFines?.toString() || "0",
      change: `${stats?.paidAmount?.toLocaleString() || 0} RWF collected`,
    },
    {
      icon: Clock,
      label: "Avg Days Overdue",
      value: stats?.avgDaysOverdue?.toString() || "0",
      change: "Average across all fines",
    },
  ];

  const handleViewFine = (fine: any) => {
    setSelectedFine(fine);
    setIsViewModalOpen(true);
  };

  const handleEditFine = (fine: any) => {
    setSelectedFine(fine);
    setEditFineForm({
      amount: fine.amount.toString(),
      reason: fine.reason,
      status: fine.status,
      daysOverdue: fine.daysOverdue.toString(),
    });
    setIsEditModalOpen(true);
  };

  const handleAddFine = () => {
    setAddFineForm({
      userEmail: '',
      userClass: '',
      bookISBN: '',
      amount: '',
      daysOverdue: '',
      reason: '',
    });
    setIsCreatingFine(false);
    setIsAddFineModalOpen(true);
  };

  const handleDeleteFine = (fine: any) => {
    setSelectedFine(fine);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteFine = () => {
    if (!selectedFine) return;

    deleteFineMutation.mutate(selectedFine.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        setSelectedFine(null);
        addNotification({
          title: 'Success',
          message: 'Fine deleted successfully',
          type: 'success',
          timestamp: new Date(),
        });
      },
      onError: (error: any) => {
        addNotification({
          title: 'Error',
          message: error.response?.data?.message || 'Failed to delete fine',
          type: 'error',
          timestamp: new Date(),
        });
      },
    });
  };

  const handleMarkAsPaid = (fine: any) => {
    markAsPaidMutation.mutate(fine.id, {
      onSuccess: () => {
        addNotification({
          title: 'Success',
          message: 'Fine marked as paid successfully',
          type: 'success',
          timestamp: new Date(),
        });
      },
      onError: (error: any) => {
        addNotification({
          title: 'Error',
          message: error.response?.data?.message || 'Failed to mark fine as paid',
          type: 'error',
          timestamp: new Date(),
        });
      },
    });
  };

  const handleExportFines = () => {
    exportFinesMutation.mutate(undefined, {
      onError: (error: any) => {
        addNotification({
          title: 'Error',
          message: error.response?.data?.message || 'Failed to export fines',
          type: 'error',
          timestamp: new Date(),
        });
      },
    });
  };

  const handleCreateFine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingFine(true);
    
    try {
      // Find user by email using the fines service
      const user = await finesService.findUserByEmail(addFineForm.userEmail);

      // Find book by ISBN using the fines service
      const book = await finesService.findBookByISBN(addFineForm.bookISBN);

      const createData: CreateFineData = {
        userId: user.id,
        bookId: book.id,
        amount: parseFloat(addFineForm.amount),
        reason: addFineForm.reason,
        daysOverdue: parseInt(addFineForm.daysOverdue),
      };

      createFineMutation.mutate(createData, {
        onSuccess: () => {
          setIsAddFineModalOpen(false);
          setIsCreatingFine(false);
          addNotification({
            title: 'Success',
            message: 'Fine created successfully',
            type: 'success',
            timestamp: new Date(),
          });
        },
        onError: (error: any) => {
          setIsCreatingFine(false);
          addNotification({
            title: 'Error',
            message: error.response?.data?.message || 'Failed to create fine',
            type: 'error',
            timestamp: new Date(),
          });
        },
      });
    } catch (error: any) {
      setIsCreatingFine(false);
      addNotification({
        title: 'Error',
        message: error.message || 'Failed to create fine',
        type: 'error',
        timestamp: new Date(),
      });
    }
  };

  const handleUpdateFine = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFine) return;

    setIsUpdatingFine(true);

    const updateData: UpdateFineData = {
      amount: parseFloat(editFineForm.amount),
      reason: editFineForm.reason,
      status: editFineForm.status,
      daysOverdue: parseInt(editFineForm.daysOverdue),
    };

    updateFineMutation.mutate(
      { id: selectedFine.id, data: updateData },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setIsUpdatingFine(false);
          addNotification({
            title: 'Success',
            message: 'Fine updated successfully',
            type: 'success',
            timestamp: new Date(),
          });
        },
        onError: (error: any) => {
          setIsUpdatingFine(false);
          addNotification({
            title: 'Error',
            message: error.response?.data?.message || 'Failed to update fine',
            type: 'error',
            timestamp: new Date(),
          });
        },
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'UNPAID':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const calculateDaysUnpaid = (createdAt: string, status: string) => {
    if (status === 'PAID') return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Fines Management</h1>
            <p className="text-xs sm:text-sm text-gray-600">Track and manage library fines for overdue books. Monitor payment status and send reminders to users.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddFine}
              className="px-4 py-2 text-white hover:bg-opacity-90 transition-colors text-sm flex items-center gap-2"
              style={{ backgroundColor: '#001240', borderRadius: '5px' }}
            >
              <Plus className="h-4 w-4" />
              Add Fine
            </button>
            <button
              onClick={handleExportFines}
              className="px-4 py-2 text-white hover:bg-opacity-90 transition-colors text-sm flex items-center gap-2"
              style={{ backgroundColor: '#001240', borderRadius: '5px' }}
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        ) : (
          statsData.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              variant="dark"
            />
          ))
        )}
      </div>

      {/* Fines Section */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fines by user, book, or ISBN"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-[5px] transition-colors ${
                  showFilters 
                    ? 'text-white border-transparent' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                style={showFilters ? { backgroundColor: '#001240' } : {}}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <select
                value={itemsPerPage >= (pagination?.total || 0) ? (pagination?.total || itemsPerPage) : itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 sm:px-4 py-2 text-white rounded-[5px] hover:bg-opacity-90 transition-colors border-none outline-none text-sm"
                style={{ backgroundColor: "#001240" }}
              >
                <option value={5} className="bg-white text-gray-900">5 rows</option>
                <option value={10} className="bg-white text-gray-900">10 rows</option>
                <option value={25} className="bg-white text-gray-900">25 rows</option>
                <option value={50} className="bg-white text-gray-900">50 rows</option>
                <option value={pagination?.total || 100} className="bg-white text-gray-900">All rows ({pagination?.total || 0})</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as 'all' | 'PAID' | 'UNPAID' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Fines</option>
                  <option value="UNPAID">Unpaid Only</option>
                  <option value="PAID">Paid Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value as 'all' | 'today' | 'week' | 'month' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({ status: 'all', dateRange: 'all' });
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Empty State */}
        {finesLoading ? (
          <TableSkeleton rows={5} columns={8} />
        ) : fines.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <DollarSign className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fines found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search terms' : 'No fines are currently recorded'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto">
          <Table className="bg-white min-w-full">
            <TableHeader style={{ backgroundColor: "#001240" }} className="text-white">
              <TableRow className="border-0 hover:bg-opacity-90" style={{ backgroundColor: "#001240" }}>
                <TableHead className="text-white min-w-[150px] px-3">User</TableHead>
                <TableHead className="text-white min-w-[180px] pl-4">Book Title</TableHead>
                <TableHead className="text-white w-24 pl-4">Amount</TableHead>
                <TableHead className="text-white w-20 pl-4">Days</TableHead>
                <TableHead className="text-white w-24 pl-4">Status</TableHead>
                <TableHead className="text-white w-28 pl-4">Days Unpaid</TableHead>
                <TableHead className="text-white w-28 pl-4">Created</TableHead>
                <TableHead className="text-white w-48 pl-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fines.map((fine, index) => (
                <TableRow key={fine.id} className={`border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <TableCell className="p-3 min-w-[150px]">
                    <div>
                      <div className="font-medium text-gray-900" title={fine.user.name}>
                        {truncateText(fine.user.name, 15)}
                      </div>
                      <div className="text-sm text-gray-600" title={fine.user.email}>
                        {truncateText(fine.user.email, 20)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-3 min-w-[180px] pl-4">
                    <div>
                      <div className="font-medium text-gray-900" title={fine.book.title}>
                        {truncateText(fine.book.title, 25)}
                      </div>
                      <div className="text-sm text-gray-600" title={fine.book.ISBN}>
                        {fine.book.ISBN}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-3 w-24 pl-4">
                    <span className="font-semibold text-gray-900">
                      {fine.amount.toLocaleString()} RWF
                    </span>
                  </TableCell>
                  <TableCell className="p-3 w-20 pl-4">
                    <span className="text-red-600 font-medium">
                      {fine.daysOverdue}
                    </span>
                  </TableCell>
                  <TableCell className="p-3 w-24 pl-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(fine.status)}`}>
                      {fine.status}
                    </span>
                  </TableCell>
                  <TableCell className="p-3 w-28 text-sm text-gray-600 pl-4">
                    <span className={fine.status === 'PAID' ? 'text-green-600' : 'text-red-600'}>
                      {calculateDaysUnpaid(fine.createdAt, fine.status)} days
                    </span>
                  </TableCell>
                  <TableCell className="p-3 w-28 text-sm text-gray-600 pl-4">
                    {formatDate(fine.createdAt)}
                  </TableCell>
                  <TableCell className="p-3 w-48 pl-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewFine(fine)}
                        className="p-1.5 bg-gray-50 hover:bg-gray-100 transition-colors group"
                        style={{ borderRadius: '5px' }}
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5 text-gray-600 group-hover:text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleEditFine(fine)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 transition-colors group"
                        style={{ borderRadius: '5px' }}
                        title="Edit Fine"
                      >
                        <Edit className="h-3.5 w-3.5 text-blue-600 group-hover:text-blue-700" />
                      </button>
                      {fine.status === 'UNPAID' && (
                        <button
                          onClick={() => handleMarkAsPaid(fine)}
                          disabled={markAsPaidMutation.isPending}
                          className="p-1.5 bg-green-50 hover:bg-green-100 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ borderRadius: '5px' }}
                          title="Mark as Paid"
                        >
                          <CreditCard className="h-3.5 w-3.5 text-green-600 group-hover:text-green-700" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteFine(fine)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 transition-colors group"
                        style={{ borderRadius: '5px' }}
                        title="Delete Fine"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-600 group-hover:text-red-700" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
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
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Fine Modal */}
      {isViewModalOpen && selectedFine && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsViewModalOpen(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#001240' }}>
              <h2 className="text-xl font-bold text-white">Fine Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">User Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="text-gray-900">{selectedFine.user.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedFine.user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Class/Department</label>
                      <p className="text-gray-900">{selectedFine.user.level || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Fine Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <p className="text-gray-900 font-semibold">{selectedFine.amount.toLocaleString()} RWF</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedFine.status)}`}>
                        {selectedFine.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Days Overdue</label>
                      <p className="text-red-600 font-medium">{selectedFine.daysOverdue} days</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reason</label>
                      <p className="text-gray-900">{selectedFine.reason}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Book Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <p className="text-gray-900">{selectedFine.book.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ISBN</label>
                    <p className="text-gray-900">{selectedFine.book.ISBN}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Days Unpaid</label>
                    <p className={`font-medium ${selectedFine.status === 'PAID' ? 'text-green-600' : 'text-red-600'}`}>
                      {calculateDaysUnpaid(selectedFine.createdAt, selectedFine.status)} days
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fine Created</label>
                    <p className="text-gray-900">{formatDate(selectedFine.createdAt)}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 transition-colors"
                  style={{ borderRadius: '5px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Fine Modal */}
      {isEditModalOpen && selectedFine && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#001240' }}>
              <h2 className="text-xl font-bold text-white">Edit Fine</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateFine} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Email
                    </label>
                    <input
                      type="email"
                      defaultValue={selectedFine.user.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Class/Department
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedFine.user.level || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book ISBN
                    </label>
                    <input
                      type="text"
                      defaultValue={selectedFine.book.ISBN}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fine Amount (RWF)
                    </label>
                    <input
                      type="number"
                      value={editFineForm.amount}
                      onChange={(e) => setEditFineForm(prev => ({ ...prev, amount: e.target.value }))}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Days Overdue
                    </label>
                    <input
                      type="number"
                      value={editFineForm.daysOverdue}
                      onChange={(e) => setEditFineForm(prev => ({ ...prev, daysOverdue: e.target.value }))}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editFineForm.status}
                      onChange={(e) => setEditFineForm(prev => ({ ...prev, status: e.target.value as 'PAID' | 'UNPAID' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="UNPAID">Unpaid</option>
                      <option value="PAID">Paid</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={editFineForm.reason}
                    onChange={(e) => setEditFineForm(prev => ({ ...prev, reason: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 transition-colors"
                    style={{ borderRadius: '5px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingFine}
                    className="px-4 py-2 text-white hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ backgroundColor: '#001240', borderRadius: '5px' }}
                  >
                    {isUpdatingFine ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Fine'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Fine Modal */}
      {isAddFineModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => {
              setIsAddFineModalOpen(false);
              setIsCreatingFine(false);
            }}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#001240' }}>
              <h2 className="text-xl font-bold text-white">Add New Fine</h2>
              <button
                onClick={() => {
                  setIsAddFineModalOpen(false);
                  setIsCreatingFine(false);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateFine} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Email
                    </label>
                    <input
                      type="email"
                      placeholder="user@student.rca.ac.rw"
                      value={addFineForm.userEmail}
                      onChange={(e) => setAddFineForm(prev => ({ ...prev, userEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Class/Department
                    </label>
                    <input
                      type="text"
                      placeholder="Computer Science - Year 3"
                      value={addFineForm.userClass}
                      onChange={(e) => setAddFineForm(prev => ({ ...prev, userClass: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Book ISBN
                    </label>
                    <input
                      type="text"
                      placeholder="978-0123456789"
                      value={addFineForm.bookISBN}
                      onChange={(e) => setAddFineForm(prev => ({ ...prev, bookISBN: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fine Amount (RWF)
                    </label>
                    <input
                      type="number"
                      placeholder="500"
                      min="0"
                      value={addFineForm.amount}
                      onChange={(e) => setAddFineForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Days Overdue
                    </label>
                    <input
                      type="number"
                      placeholder="5"
                      min="1"
                      value={addFineForm.daysOverdue}
                      onChange={(e) => setAddFineForm(prev => ({ ...prev, daysOverdue: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    placeholder="Book returned 5 days late..."
                    rows={3}
                    value={addFineForm.reason}
                    onChange={(e) => setAddFineForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddFineModalOpen(false);
                      setIsCreatingFine(false);
                    }}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 transition-colors"
                    style={{ borderRadius: '5px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingFine}
                    className="px-4 py-2 text-white hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ backgroundColor: '#001240', borderRadius: '5px' }}
                  >
                    {isCreatingFine ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      'Add Fine'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Fine Confirmation Modal */}
      {isDeleteModalOpen && selectedFine && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#001240' }}>
              <h2 className="text-xl font-bold text-white">Delete Fine</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Are you sure you want to delete this fine?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This action cannot be undone. The fine will be permanently removed from the system.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">User:</span>
                        <p className="text-gray-900">{selectedFine.user.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Amount:</span>
                        <p className="text-gray-900 font-semibold">{selectedFine.amount.toLocaleString()} RWF</p>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">Book:</span>
                        <p className="text-gray-900">{selectedFine.book.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 transition-colors"
                  style={{ borderRadius: '5px' }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteFine}
                  disabled={deleteFineMutation.isPending}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ borderRadius: '5px' }}
                >
                  {deleteFineMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete Fine
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LibrarianFinesPage() {
  return (
    <Suspense fallback={<FinesPageFallback />}>
      <FinesPageContent />
    </Suspense>
  );
}