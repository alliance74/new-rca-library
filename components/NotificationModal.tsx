'use client';

import { X, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import { useEffect } from 'react';
import ExpandableText from './ExpandableText';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function NotificationModal({
  isOpen,
  onClose,
  title,
  message,
  type,
  autoClose = false,
  autoCloseDelay = 3000,
}: NotificationModalProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    // All icons now use white color for consistency
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-white" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-white" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-white" />;
      case 'info':
        return <Info className="h-6 w-6 text-white" />;
      default:
        return <Info className="h-6 w-6 text-white" />;
    }
  };

  const getBorderColor = () => {
    // All modals now use blue border
    return 'border-blue-600';
  };

  const getBackgroundColor = () => {
    // All modals now use blue background
    return 'bg-blue-600';
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className={`bg-white shadow-xl max-w-md w-full border-2 ${getBorderColor()}`}>
        <div className={`p-6 ${getBackgroundColor()}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {getIcon()}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {title}
                </h3>
                <ExpandableText 
                  text={message} 
                  maxLength={100} 
                  className="text-white/90 text-sm leading-relaxed"
                />
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors ml-4"
              aria-label="Close notification"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-white">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}