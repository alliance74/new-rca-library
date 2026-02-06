'use client';

import { useNotifications } from '@/contexts/NotificationContext';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export default function NotificationToast() {
  const { currentNotification, notificationQueue, removeCurrentNotification } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-white" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-white" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-white" />;
      default:
        return <Info className="h-4 w-4 text-white" />;
    }
  };

  const getBorderColor = (type: string) => {
    // All toasts now use blue border
    return 'border-l-white';
  };

  const getBackgroundColor = (type: string) => {
    // All toasts now use blue background
    return '#001240'; // Primary dark blue
  };

  if (!currentNotification) return null;

  return (
    <div className="fixed top-4 right-4 max-w-sm" style={{ zIndex: 99999 }}>
      <div
        className={`p-3 border-l-4 shadow-lg animate-in slide-in-from-right-full duration-300 text-white ${getBorderColor(currentNotification.type)}`}
        style={{ backgroundColor: getBackgroundColor(currentNotification.type) }}
      >
        <div className="flex items-start gap-2">
          {getIcon(currentNotification.type)}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-medium text-white truncate">
              {currentNotification.title}
            </h4>
            <p className="text-xs text-white/90 mt-1 line-clamp-2">
              {currentNotification.message}
            </p>
            {/* Show queue indicator if there are more notifications */}
            {notificationQueue.length > 0 && (
              <p className="text-xs text-white/80 mt-1">
                +{notificationQueue.length} more notification{notificationQueue.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={removeCurrentNotification}
            className="shrink-0 p-1 hover:bg-white/10 transition-colors"
          >
            <X className="h-3 w-3 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}