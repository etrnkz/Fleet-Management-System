import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { getCorsOrigin } from '../config/cors-origins';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: getCorsOrigin(),
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, AuthenticatedSocket>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        console.log('Client connection rejected: No token provided');
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.userRole = payload.role;

      // Store connection
      if (client.userId) {
        this.connectedUsers.set(client.userId, client);

        // Join user-specific room
        client.join(`user_${client.userId}`);

        // Join role-specific room for broadcast notifications
        if (client.userRole) {
          client.join(`role_${client.userRole}`);
        }

        console.log(
          `User ${client.userId} (${client.userRole}) connected to notifications`,
        );

        // Send initial unread count
        const unreadCount = await this.notificationsService.getUnreadCount(
          client.userId,
        );
        client.emit('unread_count', { count: unreadCount });
      }
    } catch (error) {
      console.log('Client connection rejected: Invalid token', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      console.log(`User ${client.userId} disconnected from notifications`);
    }
  }

  @SubscribeMessage('get_notifications')
  async handleGetNotifications(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { limit?: number; isRead?: boolean },
  ) {
    if (!client.userId) return;

    try {
      const notifications = await this.notificationsService.findByUser(
        client.userId,
        data.isRead,
      );

      client.emit('notifications_list', {
        notifications: notifications.slice(0, data.limit || 20),
      });
    } catch (error) {
      client.emit('error', { message: 'Failed to fetch notifications' });
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: string },
  ) {
    if (!client.userId) return;

    try {
      await this.notificationsService.markAsRead(
        data.notificationId,
        client.userId,
      );

      // Send updated unread count
      const unreadCount = await this.notificationsService.getUnreadCount(
        client.userId,
      );
      client.emit('unread_count', { count: unreadCount });

      client.emit('notification_marked_read', {
        notificationId: data.notificationId,
      });
    } catch (error) {
      client.emit('error', { message: 'Failed to mark notification as read' });
    }
  }

  @SubscribeMessage('mark_all_as_read')
  async handleMarkAllAsRead(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) return;

    try {
      await this.notificationsService.markAllAsRead(client.userId);

      client.emit('unread_count', { count: 0 });
      client.emit('all_notifications_marked_read');
    } catch (error) {
      client.emit('error', {
        message: 'Failed to mark all notifications as read',
      });
    }
  }

  // Methods to send real-time notifications
  async sendNotificationToUser(userId: string, notification: any) {
    const userSocket = this.connectedUsers.get(userId);
    if (userSocket) {
      userSocket.emit('new_notification', notification);

      // Update unread count
      const unreadCount =
        await this.notificationsService.getUnreadCount(userId);
      userSocket.emit('unread_count', { count: unreadCount });
    }
  }

  async sendNotificationToRole(role: string, notification: any) {
    this.server.to(`role_${role}`).emit('role_notification', notification);
  }

  async broadcastSystemNotification(notification: any) {
    this.server.emit('system_notification', notification);
  }

  // Trip-specific real-time updates
  async notifyTripStatusUpdate(
    tripId: string,
    status: string,
    involvedUserIds: string[],
  ) {
    const update = {
      tripId,
      status,
      timestamp: new Date().toISOString(),
    };

    // Notify all involved users
    for (const userId of involvedUserIds) {
      const userSocket = this.connectedUsers.get(userId);
      if (userSocket) {
        userSocket.emit('trip_status_update', update);
      }
    }
  }

  async notifyLiveTracking(
    tripId: string,
    locationData: any,
    involvedUserIds: string[],
  ) {
    const trackingUpdate = {
      tripId,
      location: locationData,
      timestamp: new Date().toISOString(),
    };

    // Notify all involved users about live location
    for (const userId of involvedUserIds) {
      const userSocket = this.connectedUsers.get(userId);
      if (userSocket) {
        userSocket.emit('live_tracking_update', trackingUpdate);
      }
    }
  }

  // Get connected users count for admin dashboard
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  getConnectedUsersByRole(): Record<string, number> {
    const roleCount: Record<string, number> = {};

    this.connectedUsers.forEach((socket) => {
      if (socket.userRole) {
        roleCount[socket.userRole] = (roleCount[socket.userRole] || 0) + 1;
      }
    });

    return roleCount;
  }
}
