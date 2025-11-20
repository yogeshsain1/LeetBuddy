import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, Check, AlertCircle, Info, Bell } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'message';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  avatar?: string;
  timestamp?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
  defaultDuration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
}

export function NotificationProvider({
  children,
  maxNotifications = 5,
  defaultDuration = 5000,
  position = 'top-right',
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? defaultDuration,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        // Keep only the latest maxNotifications
        return updated.slice(0, maxNotifications);
      });

      // Auto-dismiss if duration is set
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }
    },
    [maxNotifications, defaultDuration]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearAll }}
    >
      {children}
      
      {/* Toast Container */}
      <div className={`fixed ${positionClasses[position]} z-[9999] space-y-3 w-96 max-w-[calc(100vw-2rem)]`}>
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
}

function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200); // Match animation duration
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'message':
        return <Bell className="w-5 h-5 text-purple-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'info':
        return 'border-l-blue-500';
      case 'message':
        return 'border-l-purple-500';
    }
  };

  return (
    <div
      className={`
        bg-white border-l-4 ${getBorderColor()} shadow-lg rounded-lg overflow-hidden
        transform transition-all duration-200 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar or Icon */}
          {notification.avatar ? (
            <img
              src={notification.avatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="flex-shrink-0">{getIcon()}</div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
              <button
                onClick={handleClose}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
            
            {notification.timestamp && (
              <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
            )}

            {notification.action && (
              <button
                onClick={() => {
                  notification.action?.onClick();
                  handleClose();
                }}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
              >
                {notification.action.label}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      {notification.duration && notification.duration > 0 && (
        <div className="h-1 bg-gray-100 overflow-hidden">
          <div
            className={`h-full ${
              notification.type === 'success'
                ? 'bg-green-500'
                : notification.type === 'error'
                ? 'bg-red-500'
                : notification.type === 'info'
                ? 'bg-blue-500'
                : 'bg-purple-500'
            }`}
            style={{
              animation: `shrink ${notification.duration}ms linear`,
            }}
          />
        </div>
      )}
    </div>
  );
}

// Helper hook for common notification patterns
export function useChatNotifications() {
  const { addNotification } = useNotifications();

  const notifyNewMessage = useCallback(
    (params: {
      senderName: string;
      message: string;
      avatar?: string;
      onView?: () => void;
    }) => {
      addNotification({
        type: 'message',
        title: params.senderName,
        message: params.message,
        avatar: params.avatar,
        timestamp: 'Just now',
        duration: 6000,
        action: params.onView
          ? {
              label: 'View',
              onClick: params.onView,
            }
          : undefined,
      });
    },
    [addNotification]
  );

  const notifyTyping = useCallback(
    (params: { userName: string; avatar?: string }) => {
      addNotification({
        type: 'info',
        title: `${params.userName} is typing...`,
        message: '',
        avatar: params.avatar,
        duration: 3000,
      });
    },
    [addNotification]
  );

  const notifyIncomingCall = useCallback(
    (params: {
      callerName: string;
      callType: 'audio' | 'video';
      avatar?: string;
      onAccept: () => void;
      onReject: () => void;
    }) => {
      addNotification({
        type: 'info',
        title: `Incoming ${params.callType} call`,
        message: `${params.callerName} is calling...`,
        avatar: params.avatar,
        duration: 30000, // 30 seconds
        action: {
          label: 'Answer',
          onClick: params.onAccept,
        },
      });
    },
    [addNotification]
  );

  const notifyMessageStatus = useCallback(
    (params: {
      status: 'sent' | 'delivered' | 'read' | 'failed';
      userName?: string;
    }) => {
      const messages = {
        sent: 'Message sent',
        delivered: `Delivered to ${params.userName || 'recipient'}`,
        read: `Read by ${params.userName || 'recipient'}`,
        failed: 'Failed to send message',
      };

      addNotification({
        type: params.status === 'failed' ? 'error' : 'success',
        title: messages[params.status],
        message: '',
        duration: 2000,
      });
    },
    [addNotification]
  );

  const notifyError = useCallback(
    (message: string) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message,
        duration: 5000,
      });
    },
    [addNotification]
  );

  const notifySuccess = useCallback(
    (message: string) => {
      addNotification({
        type: 'success',
        title: 'Success',
        message,
        duration: 3000,
      });
    },
    [addNotification]
  );

  return {
    notifyNewMessage,
    notifyTyping,
    notifyIncomingCall,
    notifyMessageStatus,
    notifyError,
    notifySuccess,
  };
}

// CSS for progress bar animation (add to your global CSS)
export const notificationStyles = `
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
`;
