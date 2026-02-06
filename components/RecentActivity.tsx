'use client';

import { Clock, BookOpen, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Activity {
  id: string;
  status: string;
  borrowDate: string;
  returnDate?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  book: {
    title: string;
    cover_image?: string;
  };
}

interface RecentActivityProps {
  activities: Activity[];
  isLoading?: boolean;
}

const getActionText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'requested this book';
    case 'APPROVED':
      return 'borrowed this book';
    case 'RETURNED':
      return 'returned this book';
    case 'REJECTED':
      return 'had your request rejected';
    case 'OVERDUE':
      return 'have an overdue book';
    default:
      return 'interacted with this book';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'APPROVED':
      return <BookOpen className="h-4 w-4 text-blue-600" />;
    case 'RETURNED':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'REJECTED':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'OVERDUE':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return <BookOpen className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800';
    case 'RETURNED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'OVERDUE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Pending Approval';
    case 'APPROVED':
      return 'Borrowed';
    case 'RETURNED':
      return 'Returned';
    case 'REJECTED':
      return 'Request Rejected';
    case 'OVERDUE':
      return 'Overdue';
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

export default function RecentActivity({ activities, isLoading = false }: RecentActivityProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto hide-scrollbar">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400 mt-1">Start borrowing books to see your activity here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
      <div className="flex-1 overflow-y-auto max-h-96 hide-scrollbar">
        <div className="space-y-3">
          {activities.slice(0, 10).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  {getStatusIcon(activity.status)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-gray-900 break-words line-clamp-2">
                    {activity.book.title}
                  </p>
                  <p className="text-xs text-gray-500 break-words">
                    {activity.user?.name ? `by ${activity.user.name}` : `You ${getActionText(activity.status)}`}
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-xs text-gray-400">
                      {formatDate(activity.returnDate || activity.borrowDate)}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shrink-0 ${getStatusColor(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {activities.length > 10 && (
        <div className="mt-4 pt-4 border-t border-gray-200 shrink-0">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
}