'use client';

import { Search, BookOpen, Download, ChevronDown, Users, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { useGlobalNotification } from '@/hooks/useGlobalNotification';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  formats: string[];
  icon: any;
  endpoint: string;
  count?: number;
}

interface DashboardStats {
  stats: {
    totalBooks: number;
    borrowedBooks: number;
    overdueBooks: number;
    returnedBooks: number;
    totalUsers: number;
  };
}

export default function ReportsPage() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const { showSuccess, showError } = useGlobalNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("all");
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Fetch dashboard stats for report counts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          router.push('/');
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/admin/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardStats(data);
        } else {
          setError('Failed to fetch statistics');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Error loading statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  const reports: ReportCard[] = [
    {
      id: "borrowed-books",
      title: "Borrowed Books Report",
      description: "List of all currently borrowed books with borrower details and due dates",
      formats: ["CSV", "PDF"],
      icon: BookOpen,
      endpoint: "/admin/borrows?status=APPROVED",
      count: dashboardStats?.stats.borrowedBooks,
    },
    {
      id: "overdue-books",
      title: "Overdue Books Report",
      description: "List of all overdue books with borrower contact information",
      formats: ["CSV", "PDF"],
      icon: AlertCircle,
      endpoint: "/admin/borrows?status=OVERDUE",
      count: dashboardStats?.stats.overdueBooks,
    },
    {
      id: "borrower-activity",
      title: "Borrower Activity Report",
      description: "Borrowing history and activity statistics for all borrowers",
      formats: ["CSV", "PDF"],
      icon: Users,
      endpoint: "/admin/users",
      count: dashboardStats?.stats.totalUsers,
    },
    {
      id: "popular-books",
      title: "Popular Books Report",
      description: "Most borrowed books ranked by popularity and frequency",
      formats: ["CSV", "PDF"],
      icon: TrendingUp,
      endpoint: "/admin/books",
      count: dashboardStats?.stats.totalBooks,
    },
    {
      id: "returned-books",
      title: "Returned Books Report",
      description: "List of all returned books with return dates and borrower details",
      formats: ["CSV", "PDF"],
      icon: Calendar,
      endpoint: "/admin/borrows?status=RETURNED",
      count: dashboardStats?.stats.returnedBooks,
    },
    {
      id: "library-inventory",
      title: "Library Inventory Report",
      description: "Complete inventory of all books with stock levels and availability",
      formats: ["CSV", "PDF"],
      icon: BookOpen,
      endpoint: "/admin/books",
      count: dashboardStats?.stats.totalBooks,
    },
  ];

  const timeRangeOptions = [
    { value: "all", label: "All time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This week" },
    { value: "month", label: "This month" },
    { value: "year", label: "This year" },
  ];

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateReport = async (report: ReportCard, format: string) => {
    try {
      setIsGenerating(`${report.id}-${format}`);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        router.push('/');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}${report.endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (format === 'CSV') {
          generateCSV(data, report);
        } else if (format === 'PDF') {
          generatePDF(data, report);
        }
        showSuccess('Report Generated', `${report.title} has been generated successfully in ${format} format.`);
      } else {
        showError('Report Generation Failed', 'Failed to generate report. Please try again.');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      showError('Report Generation Error', 'An error occurred while generating the report. Please try again.');
    } finally {
      setIsGenerating(null);
    }
  };

  const generateCSV = (data: any, report: ReportCard) => {
    let csvContent = '';
    let rows: any[] = [];

    console.log('Generating CSV for report:', report.id);
    console.log('Data received:', data);

    switch (report.id) {
      case 'borrowed-books':
      case 'overdue-books':
      case 'returned-books':
        csvContent = 'Book Title,Author,ISBN,Borrower,Email,Borrow Date,Return Date,Status\n';
        rows = data.borrows || [];
        rows.forEach((borrow: any) => {
          csvContent += `"${borrow.book.title}","${borrow.book.author}","${borrow.book.ISBN}","${borrow.user.name}","${borrow.user.email}","${new Date(borrow.borrowDate).toLocaleDateString()}","${borrow.returnDate ? new Date(borrow.returnDate).toLocaleDateString() : 'Not returned'}","${borrow.status}"\n`;
        });
        break;
      case 'borrower-activity':
        csvContent = 'Name,Email,Role,Level,Member Since,Total Borrows\n';
        rows = data.users || [];
        rows.forEach((user: any) => {
          const level = user.level || 'Not Set';
          csvContent += `"${user.name}","${user.email}","${user.role}","${level}","${new Date(user.createdAt).toLocaleDateString()}","0"\n`;
        });
        break;
      case 'popular-books':
      case 'library-inventory':
        csvContent = 'Title,Author,ISBN,Publisher,Available Copies,Borrowed Copies,Total Copies,Status\n';
        rows = data.books || [];
        console.log('Books array:', rows);
        console.log('First book sample:', rows[0]);
        rows.forEach((book: any) => {
          const totalCopies = book.totalCopies || 0;
          const availableCopies = book.availableCopies || 0;
          const borrowedCopies = totalCopies - availableCopies;
          const status = availableCopies > 0 ? 'Available' : 'Unavailable';
          console.log(`Book: ${book.title}, Total: ${totalCopies}, Available: ${availableCopies}, Borrowed: ${borrowedCopies}`);
          csvContent += `"${book.title}","${book.author}","${book.ISBN || 'N/A'}","${book.publisher || book.genre || 'N/A'}","${availableCopies}","${borrowedCopies}","${totalCopies}","${status}"\n`;
        });
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generatePDF = (data: any, report: ReportCard) => {
    // For now, we'll create a simple HTML content and open it in a new window for printing
    let htmlContent = `
      <html>
        <head>
          <title>${report.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #001240; border-bottom: 2px solid #001240; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #001240; color: white; }
            .report-info { margin-bottom: 20px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${report.title}</h1>
          <div class="report-info">
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Description:</strong> ${report.description}</p>
          </div>
          <table>
    `;

    let rows: any[] = [];
    switch (report.id) {
      case 'borrowed-books':
      case 'overdue-books':
      case 'returned-books':
        htmlContent += '<tr><th>Book Title</th><th>Author</th><th>Borrower</th><th>Email</th><th>Borrow Date</th><th>Status</th></tr>';
        rows = data.borrows || [];
        rows.forEach((borrow: any) => {
          htmlContent += `<tr>
            <td>${borrow.book.title}</td>
            <td>${borrow.book.author}</td>
            <td>${borrow.user.name}</td>
            <td>${borrow.user.email}</td>
            <td>${new Date(borrow.borrowDate).toLocaleDateString()}</td>
            <td>${borrow.status}</td>
          </tr>`;
        });
        break;
      case 'borrower-activity':
        htmlContent += '<tr><th>Name</th><th>Email</th><th>Role</th><th>Level</th><th>Member Since</th></tr>';
        rows = data.users || [];
        rows.forEach((user: any) => {
          const level = user.level || 'Not Set';
          htmlContent += `<tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${level}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
          </tr>`;
        });
        break;
      case 'popular-books':
      case 'library-inventory':
        htmlContent += '<tr><th>Title</th><th>Author</th><th>ISBN</th><th>Available</th><th>Borrowed</th><th>Total</th><th>Status</th></tr>';
        rows = data.books || [];
        console.log('PDF - Books array:', rows);
        console.log('PDF - First book sample:', rows[0]);
        rows.forEach((book: any) => {
          const totalCopies = book.totalCopies || 0;
          const availableCopies = book.availableCopies || 0;
          const borrowedCopies = totalCopies - availableCopies;
          const status = availableCopies > 0 ? 'Available' : 'Unavailable';
          console.log(`PDF Book: ${book.title}, Total: ${totalCopies}, Available: ${availableCopies}, Borrowed: ${borrowedCopies}`);
          htmlContent += `<tr>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.ISBN || 'N/A'}</td>
            <td>${availableCopies}</td>
            <td>${borrowedCopies}</td>
            <td>${totalCopies}</td>
            <td>${status}</td>
          </tr>`;
        });
        break;
    }

    htmlContent += '</table></body></html>';

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
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
          <div className="flex gap-4 mb-8 items-center">
            <div className="w-1/2 flex items-center gap-3 border-2 border-gray-300 rounded-lg px-4 py-2 bg-white">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="search report"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-sm"
              />
            </div>
            <div className="flex-1 hidden md:block" />
            <div className="relative">
              <button 
                onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                className="w-full md:w-auto bg-white border-2 border-gray-300 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium text-sm">
                {timeRangeOptions.find(option => option.value === timeRange)?.label || 'All time'}
                <ChevronDown className="h-4 w-4" />
              </button>
              {isTimeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {timeRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTimeRange(option.value);
                        setIsTimeDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredReports.map((report) => {
              return (
                <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-1 rounded-sm">
                      <img 
                        src="/assets/reports.png" 
                        alt="Report icon" 
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                    {report.count !== undefined && (
                      <div className="ml-auto">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-[3px] text-xs font-medium bg-gray-100 text-blue-800">
                          {report.count} records
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Formats: {report.formats.join(", ")}</p>
                    <div className="flex gap-2">
                      {report.formats.map((format) => (
                        <button
                          key={format}
                          onClick={() => generateReport(report, format)}
                          disabled={isGenerating === `${report.id}-${format}`}
                          className="bg-white border-2 border-gray-300 text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGenerating === `${report.id}-${format}` ? (
                            <img 
                              src="/assets/logo.png" 
                              alt="Loading" 
                              className="h-3 w-3 object-contain"
                            />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-600 font-medium mb-2">No reports found</p>
              <p className="text-sm text-gray-500">Try adjusting your search terms</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
