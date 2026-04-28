import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://fingers-pointer-ste-lottery.trycloudflare.com/api/v1'
).replace(/\/$/, '');
const WS_BASE_URL = (
  process.env.NEXT_PUBLIC_WS_URL || 'https://fingers-pointer-ste-lottery.trycloudflare.com'
).replace(/\/$/, '');
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

const getToken = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('accessToken') || localStorage.getItem('access_token')
    : null;

const fetchNotificationsREST = async (): Promise<Notification[]> => {
  const token = getToken();
  if (!token) return [];
  try {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
};

const markAsReadREST = async (id: string) => {
  const token = getToken();
  if (!token) return;
  await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
};

const markAllAsReadREST = async () => {
  const token = getToken();
  if (!token) return;
  await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
};

export const useNotifications = (): UseNotificationsReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchNotificationsREST().then(data => {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    });
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const newSocket = io(NOTIFICATIONS_WS_URL, { auth: { token }, transports: ['websocket'] });
    newSocket.on('connect', () => { setIsConnected(true); newSocket.emit('get_notifications', { limit: 20 }); });
    newSocket.on('disconnect', () => setIsConnected(false));
    newSocket.on('notifications_list', (data: { notifications: Notification[] }) => {
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter(n => !n.isRead).length);
    });
    newSocket.on('unread_count', (data: { count: number }) => setUnreadCount(data.count));
    newSocket.on('new_notification', (n: Notification) => {
      setNotifications(prev => [n, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    newSocket.on('notification_marked_read', (data: { notificationId: string }) => {
      setNotifications(prev => prev.map(n => n.id === data.notificationId ? { ...n, isRead: true } : n));
    });
    newSocket.on('all_notifications_marked_read', () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });
    setSocket(newSocket);
    return () => { newSocket.close(); };
  }, []);

  const markAsRead = useCallback((id: string) => {
    if (socket?.connected) { socket.emit('mark_as_read', { notificationId: id }); }
    else {
      markAsReadREST(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [socket]);

  const markAllAsRead = useCallback(() => {
    if (socket?.connected) { socket.emit('mark_all_as_read'); }
    else {
      markAllAsReadREST();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  }, [socket]);

  const refreshNotifications = useCallback(() => {
    if (socket?.connected) { socket.emit('get_notifications', { limit: 20 }); }
    else { fetchNotificationsREST().then(data => { setNotifications(data); setUnreadCount(data.filter(n => !n.isRead).length); }); }
  }, [socket]);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Notification?.permission === 'default') {
      (window as any).Notification.requestPermission();
    }
  }, []);

  return { notifications, unreadCount, isConnected, markAsRead, markAllAsRead, refreshNotifications };
};

