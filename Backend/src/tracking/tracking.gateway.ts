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
import { Logger, UseGuards } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { UpdateLocationDto } from './dto/update-location.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/tracking',
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);
  private activeConnections = new Map<string, { tripId: string; userId: string }>();

  constructor(private readonly trackingService: TrackingService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.activeConnections.delete(client.id);
  }

  @SubscribeMessage('join-trip')
  async handleJoinTrip(
    @MessageBody() data: { tripId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { tripId, userId } = data;
    
    // Join the trip room
    client.join(`trip-${tripId}`);
    this.activeConnections.set(client.id, { tripId, userId });
    
    this.logger.log(`User ${userId} joined trip ${tripId}`);
    
    // Send recent locations to the newly joined client
    const recentLocations = await this.trackingService.getRecentLocations(tripId, 50);
    client.emit('location-history', recentLocations);
    
    return { success: true, message: 'Joined trip tracking' };
  }

  @SubscribeMessage('leave-trip')
  handleLeaveTrip(
    @MessageBody() data: { tripId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { tripId } = data;
    client.leave(`trip-${tripId}`);
    this.activeConnections.delete(client.id);
    
    this.logger.log(`Client ${client.id} left trip ${tripId}`);
    
    return { success: true, message: 'Left trip tracking' };
  }

  @SubscribeMessage('update-location')
  async handleLocationUpdate(
    @MessageBody() data: { tripId: string; location: UpdateLocationDto },
    @ConnectedSocket() client: Socket,
  ) {
    const { tripId, location } = data;
    
    try {
      // Save location to database
      const savedLocation = await this.trackingService.saveLocation(tripId, location);
      
      // Broadcast to all clients watching this trip
      this.server.to(`trip-${tripId}`).emit('location-update', {
        tripId,
        location: savedLocation,
      });
      
      this.logger.debug(`Location updated for trip ${tripId}`);
      
      return { success: true, location: savedLocation };
    } catch (error) {
      this.logger.error(`Failed to update location: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('bulk-update-locations')
  async handleBulkLocationUpdate(
    @MessageBody() data: { tripId: string; locations: UpdateLocationDto[] },
    @ConnectedSocket() client: Socket,
  ) {
    const { tripId, locations } = data;
    
    try {
      // Save all offline locations
      const savedLocations = await this.trackingService.saveBulkLocations(tripId, locations);
      
      // Broadcast to all clients
      this.server.to(`trip-${tripId}`).emit('location-bulk-update', {
        tripId,
        locations: savedLocations,
      });
      
      this.logger.log(`Bulk update: ${locations.length} locations for trip ${tripId}`);
      
      return { success: true, count: savedLocations.length };
    } catch (error) {
      this.logger.error(`Failed to bulk update locations: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Broadcast location update from REST API
  broadcastLocationUpdate(tripId: string, location: any) {
    this.server.to(`trip-${tripId}`).emit('location-update', {
      tripId,
      location,
    });
  }

  // Get active connections count for a trip
  getActiveViewers(tripId: string): number {
    const room = this.server.sockets.adapter.rooms.get(`trip-${tripId}`);
    return room ? room.size : 0;
  }
}
