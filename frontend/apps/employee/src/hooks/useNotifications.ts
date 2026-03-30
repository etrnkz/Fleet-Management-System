import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_BASE_URL = (process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000').replace(/\/$/, '');
const NOTIFICATIONS_WS_URL = WS_BASE_URL.endsWith('/notifications')
  ? WS_BASE_URL
  : `${WS_BASE_URL}/notifications`;

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  sentAt: string;
  isRead: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
    if (!token) return;

    // Connect to WebSocket
    const newSocket = io(NOTIFICATIONS_WS_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to notifications WebSocket');
      setIsConnected(true);
      
      // Request initial notifications
      newSocket.emit('get_notifications', { limit: 20 });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notifications WebSocket');
      setIsConnected(false);
    });

    newSocket.on('notifications_list', (data: { notifications: Notification[] }) => {
      setNotifications(data.notifications);
    });

    newSocket.on('unread_count', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    newSocket.on('new_notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
        });
      }
    });

    newSocket.on('notification_marked_read', (data: { notificationId: string }) => {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === data.notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    });

    newSocket.on('all_notifications_marked_read', () => {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    });

    newSocket.on('trip_status_update', (update: { tripId: string; status: string; timestamp: string }) => {
      console.log('Trip status update:', update);
      // You can handle trip status updates here
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('WebSocket error:', error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    if (socket) {
      socket.emit('mark_as_read', { notificationId });
    }
  }, [socket]);

  const markAllAsRead = useCallback(() => {
    if (socket) {
      socket.emit('mark_all_as_read');
    }
  }, [socket]);

  const refreshNotifications = useCallback(() => {
    if (socket) {
      socket.emit('get_notifications', { limit: 20 });
    }
  }, [socket]);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
};