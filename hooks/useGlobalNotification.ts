import { useNotifications } from '@/contexts/NotificationContext';

export const useGlobalNotification = () => {
  const { addNotification } = useNotifications();

  const showSuccess = (title: string, message: string) => {
    addNotification({
      title,
      message,
      type: 'success',
      timestamp: new Date(),
    });
  };

  const showError = (title: string, message: string) => {
    addNotification({
      title,
      message,
      type: 'error',
      timestamp: new Date(),
    });
  };

  const showWarning = (title: string, message: string) => {
    addNotification({
      title,
      message,
      type: 'warning',
      timestamp: new Date(),
    });
  };

  const showInfo = (title: string, message: string) => {
    addNotification({
      title,
      message,
      type: 'info',
      timestamp: new Date(),
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};