'use client';

import { Suspense } from 'react';
import StatCard from "@/components/StatCard";
import RecentActivity from "@/components/RecentActivity";
import ViewBookModal from "@/components/ViewBookModal";
import RequestBorrowModal from "@/components/RequestBorrowModal";
import StatCardSkeleton from "@/components/skeletons/StatCardSkeleton";
import ChartSkeleton from "@/components/skeletons/ChartSkeleton";
import RecentActivitySkeleton from "@/components/skeletons/RecentActivitySkeleton";
import { Calendar, BookOpen, Clock, CheckCircle, Search, Filter, ChevronDown } from "lucide-react";
import { useState } from "react";
import { PieChart, Pie, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardService, Book } from '@/services/dashboardService';
import { useAuth } from '@/hooks/useAuth';

// Loading fallback component
function DashboardFallback() {
  return (
    <div>
      {/* Search Bar Skeleton */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center gap-0 border-2 border-gray-300 rounded-lg bg-white overflow-hidden h-12 max-w-full sm:max-w-md lg:max-w-lg">
          <div className="flex items-center px-4 flex-1">
            <Search className="h-5 w-5 text-gray-400 shrink-0" />
            <div className="flex-1 outline-none text-gray-900 placeholder-gray-400 ml-3 h-4 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="text-white px-4 h-full hover:bg-opacity-90 transition-colors flex items-center justify-center" style={{ backgroundColor: "#001240" }}>
            <Filter className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
        <ChartSkeleton title="Books" type="pie" />
        <ChartSkeleton title="My Borrowing Activity (Last 6 Months)" type="area" />
      </div>

      {/* Recent Activity Skeleton */}
      <RecentActivitySkeleton />
    </div>
  );
}

// Main dashboard content component
function DashboardContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("weekly");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedBookForRequest, setSelectedBookForRequest] = useState<Book | null>(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's borrow data
  const { data: borrowsData, isLoading: borrowsLoading, error: borrowsError } = useQuery({
    queryKey: ['user', 'borrows'],
    queryFn: dashboardService.getUserBorrows,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Borrow book mutation
  const borrowMutation = useMutation({
    mutationFn: dashboardService.borrowBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'borrows'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      setIsRequestModalOpen(false);
      setSelectedBookForRequest(null);
    },
    onError: (error: any) => {
      console.error('Failed to borrow book:', error);
    },
  });

  const handleBorrowConfirm = async () => {
    if (selectedBookForRequest) {
      try {
        await borrowMutation.mutateAsync(selectedBookForRequest.id);
      } catch (error) {
        console.error('Failed to borrow book:', error);
      }
    }
  };

  // Generate chart data based on real data
  const getBooksData = () => {
    if (!borrowsData) {
      return [
        { name: 'No Data', value: 1, color: '#e5e7eb' },
      ];
    }

    const stats = borrowsData.statistics;
    const total = stats.returned + stats.approved + stats.overdue;

    if (total === 0) {
      return [
        { name: 'No Data', value: 1, color: '#e5e7eb' },
      ];
    }

    return [
      { name: 'Returned', value: stats.returned, color: '#1e293b' },
      { name: 'Borrowed', value: stats.approved, color: '#3b82f6' },
      { name: 'Overdue', value: stats.overdue, color: '#64748b' },
    ];
  };

  // Generate borrowings chart data based on real data - monthly activity
  const getBorrowingsData = () => {
    if (!borrowsData || !borrowsData.borrowHistory) {
      return [];
    }

    // Get current date and calculate last 6 months
    const now = new Date();
    const monthsData = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      
      // Count borrows for this month from real data
      const monthBorrows = borrowsData.borrowHistory.filter(borrow => {
        const borrowDate = new Date(borrow.borrowDate);
        return borrowDate.getFullYear() === date.getFullYear() && 
               borrowDate.getMonth() === date.getMonth();
      });

      // Count returns for this month
      const monthReturns = monthBorrows.filter(borrow => 
        borrow.status === 'RETURNED' && borrow.returnDate
      );

      // Count overdue for this month (books that were due in this month but not returned)
      const monthOverdue = monthBorrows.filter(borrow => {
        if (!borrow.dueDate) return false;
        const dueDate = new Date(borrow.dueDate);
        return dueDate.getFullYear() === date.getFullYear() && 
               dueDate.getMonth() === date.getMonth() &&
               borrow.status !== 'RETURNED' &&
               dueDate < now;
      });

      monthsData.push({
        name: `${monthName} ${year === now.getFullYear() ? '' : `'${year.toString().slice(-2)}`}`.trim(),
        Borrowed: monthBorrows.length,
        Returned: monthReturns.length,
        Overdue: monthOverdue.length,
      });
    }

    return monthsData;
  };

  // Generate stats from real data with proper logic (focused on dashboard overview)
  const getStats = () => {
    if (!borrowsData) {
      return [
        { icon: CheckCircle, label: "Books returned", value: "0", change: "No data" },
        { icon: BookOpen, label: "Currently borrowed", value: "0", change: "No data" },
        { icon: Calendar, label: "Due this week", value: "0", change: "No data" },
        { icon: Clock, label: "Overdue books", value: "0", change: "No data" },
      ];
    }

    const stats = borrowsData.statistics;
    
    // Calculate due this week from approved books
    const dueThisWeek = borrowsData.currentBorrows.filter(b => {
      if (b.status !== 'APPROVED' || !b.dueDate) return false;
      const dueDate = new Date(b.dueDate);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length;

    return [
      {
        icon: CheckCircle,
        label: "Books returned",
        value: stats.returned.toString(),
        change: stats.returned > 0 ? "Total completed" : "No returns yet",
      },
      {
        icon: BookOpen,
        label: "Currently borrowed",
        value: stats.currentlyBorrowed.toString(),
        change: stats.currentlyBorrowed > 0 ? "Active loans" : "No active borrows",
      },
      {
        icon: Calendar,
        label: "Due this week",
        value: dueThisWeek.toString(),
        change: dueThisWeek > 0 ? "Plan returns" : "None due soon",
      },
      {
        icon: Clock,
        label: "Overdue books",
        value: stats.overdue.toString(),
        change: stats.overdue > 0 ? "Immediate action needed" : "All up to date",
      },
    ];
  };

  const stats = getStats();
  const booksChartData = getBooksData();
  const borrowingsData = getBorrowingsData();

  // Combine current borrows and recent history for activity feed
  const recentActivities = borrowsData
    ? [...borrowsData.currentBorrows, ...borrowsData.borrowHistory]
      .sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime())
    : [];

  if (borrowsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load dashboard data</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['user', 'borrows'] })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (borrowsLoading) {
    return <DashboardFallback />;
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center gap-0 border-2 border-gray-300 rounded-lg bg-white overflow-hidden h-12 max-w-full sm:max-w-md lg:max-w-lg">
          <div className="flex items-center px-4 flex-1">
            <Search className="h-5 w-5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-gray-900 placeholder-gray-400 ml-3"
            />
          </div>
          <button className="text-white px-4 h-full hover:bg-opacity-90 transition-colors flex items-center justify-center" style={{ backgroundColor: "#001240" }}>
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            variant="dark"
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
        {/* Books Pie Chart */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Books</h3>
            <div className="relative">
              <button
                className="flex items-center gap-2 px-3 py-1 text-white text-sm rounded-[4px] hover:bg-opacity-90 transition-colors"
                style={{ backgroundColor: "#001240" }}
                onClick={() => setTimeFilter(timeFilter === 'weekly' ? 'monthly' : 'weekly')}
              >
                {timeFilter === 'weekly' ? 'This Week' : 'This Month'}
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={booksChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {booksChartData.map((entry, index) => (
                      <path key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                  {borrowsData?.statistics.totalBorrowed || 0}
                </span>
                <span className="text-xs sm:text-sm text-gray-600">Total Books</span>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 space-y-3">
            {booksChartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Borrowings Bar Chart */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">My Borrowing Activity (Last 6 Months)</h3>
            <p className="text-sm text-gray-600 mt-1">Track your borrowing patterns over time</p>
          </div>

          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={borrowingsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Legend />
                <Bar
                  dataKey="Borrowed"
                  fill="#001240"
                  name="Borrowed"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="Returned"
                  fill="#10b981"
                  name="Returned"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="Overdue"
                  fill="#ef4444"
                  name="Overdue"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-semibold" style={{ color: '#001240' }}>
                {borrowsData?.statistics.totalBorrowed || 0}
              </div>
              <div className="text-xs text-gray-600">Total Borrowed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {borrowsData?.statistics.returned || 0}
              </div>
              <div className="text-xs text-gray-600">Returned</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {borrowsData?.statistics.overdue || 0}
              </div>
              <div className="text-xs text-gray-600">Overdue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <RecentActivity
        activities={recentActivities}
        isLoading={false}
      />

      {/* View Modal */}
      <ViewBookModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        book={null}
      />

      {/* Request Borrow Modal */}
      <RequestBorrowModal
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setSelectedBookForRequest(null);
        }}
        book={selectedBookForRequest ? {
          id: selectedBookForRequest.id,
          title: selectedBookForRequest.title,
          author: selectedBookForRequest.author,
          ISBN: selectedBookForRequest.ISBN,
          genre: selectedBookForRequest.publisher || 'Unknown Genre',
          publisher: selectedBookForRequest.publisher,
          description: selectedBookForRequest.description,
          cover_image: selectedBookForRequest.cover_image,
          totalCopies: selectedBookForRequest.remaining_copies + selectedBookForRequest.borrowed,
          availableCopies: selectedBookForRequest.remaining_copies,
          createdAt: selectedBookForRequest.createdAt,
          updatedAt: selectedBookForRequest.updatedAt || selectedBookForRequest.createdAt,
        } : null}
        onConfirm={handleBorrowConfirm}
        isLoading={borrowMutation.isPending}
      />
    </div>
  );
}

export default function UserDashboard() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}