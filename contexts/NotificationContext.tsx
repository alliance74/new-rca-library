'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

interface NotificationContextType {
  currentNotification: Notification | null;
  notificationQueue: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeCurrentNotification: () => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<Notification[]>([]);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Process notification queue - show next notification when current one is dismissed
  useEffect(() => {
    if (!currentNotification && notificationQueue.length > 0) {
      const nextNotification = notificationQueue[0];
      setCurrentNotification(nextNotification);
      setNotificationQueue(prev => prev.slice(1));

      // Auto-remove notification after 5 seconds
      const timer = setTimeout(() => {
        removeCurrentNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [currentNotification, notificationQueue]);

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Connect to WebSocket
        const socketInstance = io(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
          auth: {
            token: token,
          },
          transports: ['websocket'],
        });

        socketInstance.on('connect', () => {
          console.log('Connected to notification service');
        });

        socketInstance.on('notification', (data: Omit<Notification, 'id'>) => {
          addNotification(data);
          
          // Invalidate notification-related queries to update counts and lists
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        socketInstance.on('disconnect', () => {
          console.log('Disconnected from notification service');
        });

        return () => {
          socketInstance.disconnect();
        };
      }
    }
  }, [user]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newNotification = { ...notification, id };
    
    if (!currentNotification) {
      // If no notification is currently showing, show this one immediately
      setCurrentNotification(newNotification);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        removeCurrentNotification();
      }, 5000);
    } else {
      // Add to queue if there's already a notification showing
      setNotificationQueue(prev => [...prev, newNotification]);
    }
  };

  const removeCurrentNotification = () => {
    setCurrentNotification(null);
  };

  const clearAllNotifications = () => {
    setCurrentNotification(null);
    setNotificationQueue([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        currentNotification,
        notificationQueue,
        addNotification,
        removeCurrentNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};