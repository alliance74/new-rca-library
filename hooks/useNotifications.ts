import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService, NotificationsQuery, CreateNotificationDto } from '@/services/notificationsService';

export const useNotifications = (query: NotificationsQuery = {}) => {
  return useQuery({
    queryKey: ['notifications', query],
    queryFn: () => notificationsService.getNotifications(query),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useSystemNotifications = (query: NotificationsQuery = {}) => {
  return useQuery({
    queryKey: ['notifications', 'system', query],
    queryFn: () => notificationsService.getSystemNotifications(query),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useUnreadCount = (userId?: string) => {
  return useQuery({
    queryKey: ['notifications', 'unread-count', userId],
    queryFn: () => notificationsService.getUnreadCount(userId),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useNotificationStats = () => {
  return useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: notificationsService.getNotificationStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotificationDto) => notificationsService.createNotification(data),
    onSuccess: () => {
      // Invalidate and refetch all notification-related queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => {
      // Invalidate and refetch all notification-related queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId?: string) => notificationsService.markAllAsRead(userId),
    onSuccess: () => {
      // Invalidate and refetch all notification-related queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsService.deleteNotification,
    onSuccess: () => {
      // Invalidate and refetch all notification-related queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};