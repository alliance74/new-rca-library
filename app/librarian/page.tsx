'use client';

import MetricCard from "@/components/MetricCard";
import BorrowedReturnedChart from "@/components/BorrowedReturnedChart";
import RecentActivity from "@/components/RecentActivity";
import BookLoansTable from "@/components/BookLoansTable";
import ViewBookLoanModal from "@/components/ViewBookLoanModal";
import StatCardSkeleton from "@/components/skeletons/StatCardSkeleton";
import ChartSkeleton from "@/components/skeletons/ChartSkeleton";
import RecentActivitySkeleton from "@/components/skeletons/RecentActivitySkeleton";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { BookOpen, BookMarked, AlertCircle, CheckCircle, Users, Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGlobalNotification } from '@/hooks/useGlobalNotification';

interface DashboardStats {
  stats: {
    totalBooks: number;
    borrowedBooks: number;
    overdueBooks: number;
    returnedBooks: number;
    totalUsers: number;
  };
  recentActivities: any[];
  graphData: any[];
}

interface Borrow {
  id: string;
  userId: string;
  bookId: string;
  borrowDate: string;
  returnDate?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'OVERDUE' | 'RETURN_REQUESTED';
  user: {
    id: string;
    name: string;
    email: string;
    level?: string;
  };
  book: {
    id: string;
    title: string;
    author: string;
    ISBN: string;
    cover_image?: string;
  };
}

interface BorrowDetail {
  id: string;
  userId: string;
  bookId: string;
  borrowDate: string;
  returnDate?: string;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    level?: string;
  };
  book: {
    id: string;
    title: string;
    author: string;
    ISBN: string;
    cover_image?: string;
  };
}

export default function LibrarianDashboard() {
  const router = useRouter();
  const { showSuccess, showError, showWarning } = useGlobalNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingLoan, setViewingLoan] = useState<BorrowDetail | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [borrowsData, setBorrowsData] = useState<Borrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard stats and borrows on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          router.push('/');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        // Fetch dashboard stats
        const statsResponse = await fetch(`${apiUrl}/admin/dashboard/stats?range=5days`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Fetch all borrows for the table
        const borrowsResponse = await fetch(`${apiUrl}/admin/borrows`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (statsResponse.ok && borrowsResponse.ok) {
          const statsData = await statsResponse.json();
          const borrowsDataResponse = await borrowsResponse.json();
          
          setDashboardStats(statsData);
          setBorrowsData(borrowsDataResponse.borrows || []);
        } else {
          setError('Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error loading dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const metrics = [
    {
      icon: BookOpen,
      title: "Total Books",
      value: dashboardStats?.stats.totalBooks.toLocaleString() || "48,350",
      subtitle: "This month",
      iconBgColor: "bg-blue-100",
    },
    {
      icon: BookMarked,
      title: "Borrowed books",
      value: dashboardStats?.stats.borrowedBooks.toLocaleString() || "48,350",
      subtitle: "This month",
      iconBgColor: "bg-blue-100",
    },
    {
      icon: AlertCircle,
      title: "Overdue items",
      value: dashboardStats?.stats.overdueBooks.toLocaleString() || "48,350",
      subtitle: "This month",
      iconBgColor: "bg-blue-100",
    },
    {
      icon: CheckCircle,
      title: "Returned items",
      value: dashboardStats?.stats.returnedBooks.toLocaleString() || "48,350",
      subtitle: "This month",
      iconBgColor: "bg-blue-100",
    },
    {
      icon: Users,
      title: "Total Users",
      value: dashboardStats?.stats.totalUsers.toLocaleString() || "48,350",
      subtitle: "This month",
      iconBgColor: "bg-blue-100",
    },
  ];

  // Filter borrows based on search query and map to table format (include PENDING for approval)
  const filteredData = borrowsData
    .filter(borrow =>
      (borrow.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrow.book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrow.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .map(borrow => ({
      id: borrow.id,
      cover: borrow.book.cover_image,
      title: borrow.book.title,
      borrower: borrow.user.name,
      borrowDate: new Date(borrow.borrowDate).toLocaleDateString('en-GB'),
      returnDate: borrow.returnDate ? new Date(borrow.returnDate).toLocaleDateString('en-GB') : 'Not returned',
      status: borrow.status === 'PENDING' ? 'Pending' as const :
               borrow.status === 'APPROVED' ? 'Active' as const : 
               borrow.status === 'OVERDUE' ? 'Overdue' as const :
               borrow.status === 'RETURN_REQUESTED' ? 'Return Pending' as const :
               borrow.status === 'RETURNED' ? 'Returned' as const :
               borrow.status === 'REJECTED' ? 'Rejected' as const :
               'Active' as const,
    }));

  const handleViewLoan = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/admin/borrows/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setViewingLoan(data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching borrow details:', err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      const borrowRecord = borrowsData.find(b => b.id === id);
      if (!borrowRecord) {
        showError('Error', 'Borrow record not found');
        return;
      }

      if (borrowRecord.status !== 'PENDING') {
        showWarning(
          'Cannot Approve', 
          `This borrow request cannot be approved. Current status: ${borrowRecord.status}. Only "Pending" requests can be approved.`
        );
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/admin/borrows/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showSuccess('Success', 'Borrow request approved successfully');
        // Refresh borrows list
        const borrowsResponse = await fetch(`${apiUrl}/admin/borrows`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (borrowsResponse.ok) {
          const data = await borrowsResponse.json();
          setBorrowsData(data.borrows || []);
        }
      } else {
        const errorData = await response.json();
        showError('Approval Failed', errorData.message || 'Failed to approve borrow');
      }
    } catch (err) {
      console.error('Error approving borrow:', err);
      showError('Error', 'Error approving borrow');
    }
  };

  const handleReturn = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/');
        return;
      }

      const borrowRecord = borrowsData.find(b => b.id === id);
      if (!borrowRecord) {
        showError('Error', 'Borrow record not found');
        return;
      }

      if (borrowRecord.status !== 'RETURN_REQUESTED') {
        showWarning(
          'Cannot Approve Return', 
          `This book cannot be returned. Current status: ${borrowRecord.status}. Only books with "Return Requested" status can be approved for return.`
        );
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/admin/borrows/${id}/return`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showSuccess('Success', 'Book return approved successfully');
        // Refresh borrows list
        const borrowsResponse = await fetch(`${apiUrl}/admin/borrows`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (borrowsResponse.ok) {
          const data = await borrowsResponse.json();
          setBorrowsData(data.borrows || []);
        }
      } else {
        const errorData = await response.json();
        showError('Return Failed', errorData.message || 'Failed to return book');
      }
    } catch (err) {
      console.error('Error returning book:', err);
      showError('Error', 'Error returning book');
    }
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      {isLoading && (
        <div className="w-full min-w-0">
          {/* Metrics Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {Array.from({ length: 5 }).map((_, index) => (
              <StatCardSkeleton key={index} />
            ))}
          </div>

          {/* Charts and Activity Section Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            <ChartSkeleton title="Borrowed vs Returned" type="area" />
            <RecentActivitySkeleton />
          </div>

          {/* Book Loans Table Skeleton */}
          <TableSkeleton rows={8} columns={7} />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="w-full min-w-0">
          {/* Metrics Cards - Single Line */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-6 md:mb-8">
            {metrics.map((metric, index) => (
              <div key={index} className="w-full min-w-0">
                <MetricCard
                  icon={metric.icon}
                  title={metric.title}
                  value={metric.value}
                  subtitle={metric.subtitle}
                  iconBgColor={metric.iconBgColor}
                />
              </div>
            ))}
          </div>

          {/* Chart and Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
            <div className="lg:col-span-3 min-w-0">
              <BorrowedReturnedChart graphData={dashboardStats?.graphData || []} />
            </div>
            <div className="lg:col-span-2 min-w-0 max-h-[500px]">
              <RecentActivity activities={dashboardStats?.recentActivities || []} />
            </div>
          </div>

          {/* Book Loans Table */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm w-full min-w-0 overflow-hidden">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 items-start md:items-center">
              <div className="w-full md:w-1/2 flex items-center gap-3 border-2 border-gray-300 rounded-lg px-4 py-2 bg-white min-w-0">
                <Search className="h-5 w-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="search books"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-sm min-w-0"
                />
              </div>
              <div className="flex-1 hidden md:block" />
              <button className="bg-white border-2 border-gray-300 text-gray-900 px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 font-medium text-sm shrink-0">
                <Filter className="h-5 w-5" />
                Filters
              </button>
            </div>

            <ViewBookLoanModal
              isOpen={isViewModalOpen}
              loan={viewingLoan}
              onClose={() => {
                setIsViewModalOpen(false);
                setViewingLoan(null);
              }}
              onApprove={handleApprove}
              onReturn={handleReturn}
            />

            <div className="w-full min-w-0 overflow-hidden">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <BookLoansTable 
                  data={filteredData as any}
                  onView={handleViewLoan}
                  onApprove={handleApprove}
                  onReturn={handleReturn}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}