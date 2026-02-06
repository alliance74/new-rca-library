'use client';

import { useState, useEffect } from 'react';
import { Bell, BookOpen, Clock, CheckCircle, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '@/hooks/useNotifications';
import { Notification } from '@/services/notificationsService';
import NotificationSkeleton from '@/components/skeletons/NotificationSkeleton';
import StatCard from '@/components/StatCard';
import { useGlobalNotification } from '@/hooks/useGlobalNotification';

type NotificationTab = 'all' | 'unread' | 'due_soon' | 'system';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { showSuccess, showError } = useGlobalNotification();

  // Fetch notifications from backend API
  const { data: notificationsData, isLoading, error, refetch } = useNotifications({});
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // Update current time every minute for real-time timestamp updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Helper function to get relative time that updates in real-time
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = currentTime;
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 7) {
      return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Get notification type for filtering
  const getNotificationType = (notification: Notification) => {
    switch (notification.notificationType) {
      case 'OVERDUE':
        return 'overdue';
      case 'DUE_DATE_REMINDER':
        return 'due_soon';
      case 'RETURN_CONFIRMATION':
        return 'returned';
      case 'BORROW_CONFIRMATION':
        return 'approved';
      case 'BORROW_REQUEST':
        return 'pending';
      case 'NEW_BOOK_ARRIVAL':
        return 'system';
      default:
        return 'system';
    }
  };

  // Get priority based on notification type
  const getPriority = (notification: Notification): 'low' | 'medium' | 'high' => {
    switch (notification.notificationType) {
      case 'OVERDUE':
        return 'high';
      case 'DUE_DATE_REMINDER':
        return 'high';
      case 'BORROW_REQUEST':
        return 'medium';
      case 'BORROW_CONFIRMATION':
        return 'medium';
      case 'RETURN_CONFIRMATION':
        return 'low';
      case 'NEW_BOOK_ARRIVAL':
        return 'low';
      default:
        return 'low';
    }
  };

  const notifications = notificationsData?.notifications || [];

  const tabs = [
    { id: 'all' as NotificationTab, label: 'All', count: notifications.length },
    { id: 'unread' as NotificationTab, label: 'Unread', count: notifications.filter(n => !n.isRead).length },
    { id: 'due_soon' as NotificationTab, label: 'Due Soon', count: notifications.filter(n => ['OVERDUE', 'DUE_DATE_REMINDER'].includes(n.notificationType)).length },
    { id: 'system' as NotificationTab, label: 'System', count: notifications.filter(n => ['NEW_BOOK_ARRIVAL', 'BORROW_REQUEST'].includes(n.notificationType)).length },
  ];

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'due_soon':
        return notifications.filter(n => ['OVERDUE', 'DUE_DATE_REMINDER'].includes(n.notificationType));
      case 'system':
        return notifications.filter(n => ['NEW_BOOK_ARRIVAL', 'BORROW_REQUEST'].includes(n.notificationType));
      default:
        return notifications;
    }
  };

  // Get notification title based on type
  const getNotificationTitle = (notificationType: string): string => {
    switch (notificationType) {
      case 'OVERDUE':
        return 'Overdue Book';
      case 'DUE_DATE_REMINDER':
        return 'Book Due Soon';
      case 'RETURN_CONFIRMATION':
        return 'Book Returned Successfully';
      case 'BORROW_CONFIRMATION':
        return 'Book Request Approved';
      case 'BORROW_REQUEST':
        return 'Borrow Request Submitted';
      case 'NEW_BOOK_ARRIVAL':
        return 'New Book Available';
      default:
        return 'Notification';
    }
  };

  const getNotificationIcon = (notificationType: string) => {
    switch (notificationType) {
      case 'DUE_DATE_REMINDER':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'OVERDUE':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'RETURN_CONFIRMATION':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'BORROW_CONFIRMATION':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'BORROW_REQUEST':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'NEW_BOOK_ARRIVAL':
        return <Bell className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-orange-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync(undefined);
      showSuccess('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showError('Error', 'Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotifications = getFilteredNotifications();

  // Loading state
  if (isLoading) {
    return <NotificationSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading notifications</p>
          <p className="text-gray-600">Please try again later</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-xs sm:text-sm text-gray-600">Stay updated with your library activities, book due dates, borrow confirmations, and important system announcements. Manage your notifications efficiently to never miss important updates about your borrowed books and library account.</p>
          </div>
          <button
            onClick={markAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="w-full sm:w-auto px-4 py-2 text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: '#001240' }}
          >
            {markAllAsReadMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <StatCard
          icon={Bell}
          label="Total"
          value={isLoading ? "..." : notifications.length}
          variant="dark"
        />
        <StatCard
          icon={AlertTriangle}
          label="Unread"
          value={isLoading ? "..." : notifications.filter(n => !n.isRead).length}
          variant="dark"
        />
        <StatCard
          icon={Clock}
          label="Due Soon"
          value={isLoading ? "..." : notifications.filter(n => ['OVERDUE', 'DUE_DATE_REMINDER'].includes(n.notificationType)).length}
          variant="dark"
        />
        <StatCard
          icon={CheckCircle}
          label="System"
          value={isLoading ? "..." : notifications.filter(n => ['NEW_BOOK_ARRIVAL', 'BORROW_REQUEST'].includes(n.notificationType)).length}
          variant="dark"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          {/* Desktop Tabs */}
          <nav className="hidden sm:flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 lg:px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-b-2'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === tab.id ? { 
                  backgroundColor: '#001240',
                  borderBottomColor: '#001240'
                } : {}}
              >
                <span className="flex items-center justify-center gap-2">
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id 
                        ? 'bg-white text-gray-900' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </nav>

          {/* Mobile Tabs */}
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as NotificationTab)}
              className="w-full p-4 text-white border-none outline-none"
              style={{ backgroundColor: '#001240' }}
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label} {tab.count > 0 && `(${tab.count})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Bell className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-sm sm:text-base text-gray-600">You're all caught up! No new notifications to show.</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {filteredNotifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  getRelativeTime={getRelativeTime}
                  getNotificationTitle={getNotificationTitle}
                  markAsReadPending={markAsReadMutation.isPending}
                  deletePending={deleteNotificationMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// NotificationRow Component
interface NotificationRowProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  getRelativeTime: (dateString: string) => string;
  getNotificationTitle: (type: string) => string;
  markAsReadPending: boolean;
  deletePending: boolean;
}

function NotificationRow({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  getRelativeTime, 
  getNotificationTitle,
  markAsReadPending,
  deletePending 
}: NotificationRowProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const getShortMessage = (message: string, title: string) => {
    // Create a short summary based on notification type
    switch (notification.notificationType) {
      case 'BORROW_REQUEST':
        return 'Submitted a borrow request';
      case 'BORROW_CONFIRMATION':
        return 'Borrow request approved';
      case 'RETURN_CONFIRMATION':
        return 'Book returned successfully';
      case 'OVERDUE':
        return 'Book is overdue';
      case 'DUE_DATE_REMINDER':
        return 'Book due soon';
      case 'NEW_BOOK_ARRIVAL':
        return 'New book available';
      default:
        return message.length > 50 ? message.substring(0, 50) + '...' : message;
    }
  };

  return (
    <>
      <div className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
        !notification.isRead ? 'bg-purple-50' : 'bg-white'
      }`}>
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => setIsSelected(e.target.checked)}
          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        />

        {/* User Avatar */}
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-gray-600">
            {notification.user?.name ? notification.user.name.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>

        {/* User Name and Message */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {notification.user?.name || 'System'}
            </span>
            <span className="text-gray-600">
              {getShortMessage(notification.message, getNotificationTitle(notification.notificationType))}
            </span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-sm text-gray-500 flex-shrink-0">
          {getRelativeTime(notification.createdAt)}
        </div>

        {/* Status */}
        <div className="flex-shrink-0">
          <span className={`px-2 py-1 text-xs rounded-full ${
            !notification.isRead 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {!notification.isRead ? 'Unread' : 'Read'}
          </span>
        </div>

        {/* Details Button */}
        <button
          onClick={() => setShowDetails(true)}
          className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          Details
        </button>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Blur background */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowDetails(false)}
          />
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200" style={{ backgroundColor: '#001240' }}>
              <h2 className="text-xl font-bold text-white">
                {getNotificationTitle(notification.notificationType)}
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">From:</label>
                  <p className="text-gray-700">{notification.user?.name || 'System'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Message:</label>
                  <p className="text-gray-700">{notification.message}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Time:</label>
                  <p className="text-gray-700">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 justify-center mt-8">
                {!notification.isRead && (
                  <button
                    onClick={() => {
                      onMarkAsRead(notification.id);
                      setShowDetails(false);
                    }}
                    disabled={markAsReadPending}
                    className="text-white px-6 py-2 rounded hover:opacity-90 transition-colors font-medium disabled:opacity-50"
                    style={{ backgroundColor: "#001240" }}
                  >
                    {markAsReadPending ? 'Marking...' : 'Mark as Read'}
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(notification.id);
                    setShowDetails(false);
                  }}
                  disabled={deletePending}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                >
                  {deletePending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}