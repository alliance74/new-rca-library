import api from '@/lib/api';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  notificationType: 'NEW_BOOK_ARRIVAL' | 'DUE_DATE_REMINDER' | 'OVERDUE' | 'RETURN_CONFIRMATION' | 'BORROW_CONFIRMATION' | 'BORROW_REQUEST';
  isRead: boolean;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationsQuery {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
  userId?: string;
}

export interface CreateNotificationDto {
  userId: string; // Make this required
  message: string;
  notificationType: 'NEW_BOOK_ARRIVAL' | 'DUE_DATE_REMINDER' | 'OVERDUE' | 'RETURN_CONFIRMATION' | 'BORROW_CONFIRMATION' | 'BORROW_REQUEST';
}

export interface NotificationStats {
  total: number;
  overdue: number;
  borrowRequests: number;
  newBooks: number;
  recent: number;
}

export const notificationsService = {
  // Get notifications (for users and librarians)
  getNotifications: async (query: NotificationsQuery = {}): Promise<NotificationsResponse> => {
    const response = await api.get('/notifications', { params: query });
    return response.data;
  },

  // Get system notifications (librarian only)
  getSystemNotifications: async (query: NotificationsQuery = {}): Promise<NotificationsResponse> => {
    const response = await api.get('/notifications/system', { params: query });
    return response.data;
  },

  // Create notification (librarian only)
  createNotification: async (data: CreateNotificationDto): Promise<Notification> => {
    const response = await api.post('/notifications', data);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (userId?: string): Promise<void> => {
    const params = userId ? { userId } : {};
    await api.patch('/notifications/mark-all-read', {}, { params });
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  // Get unread count
  getUnreadCount: async (userId?: string): Promise<{ count: number }> => {
    const params = userId ? { userId } : {};
    const response = await api.get('/notifications/unread-count', { params });
    return response.data;
  },

  // Get notification statistics (librarian only)
  getNotificationStats: async (): Promise<NotificationStats> => {
    const response = await api.get('/notifications/stats');
    return response.data;
  },
};