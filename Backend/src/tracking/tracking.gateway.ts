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
import { Logger } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { getCorsOrigin } from '../config/cors-origins';

const LIVE_ROOM = 'live-tracking'; // global room for all active vehicle locations

@WebSocketGateway({
  cors: {
    origin: getCorsOrigin(),
    credentials: true,
  },
  namespace: '/tracking',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  allowEIO3: true,
})
export class TrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);

  constructor(private readonly trackingService: TrackingService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ── Join a specific trip room (driver app / trip detail view) ─────────────

  @SubscribeMessage('join-trip')
  async handleJoinTrip(
    @MessageBody() data: { tripId: string; userId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { tripId } = data;
    client.join(`trip-${tripId}`);
    this.logger.log(`Client ${client.id} joined trip-${tripId}`);

    // Send last 50 locations as history
    try {
      const history = await this.trackingService.getRecentLocations(tripId, 50);
      client.emit('location-history', history);
    } catch (_) {}

    return { success: true };
  }

  @SubscribeMessage('leave-trip')
  handleLeaveTrip(
    @MessageBody() data: { tripId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`trip-${data.tripId}`);
    return { success: true };
  }

  // ── Join global live-tracking room (transport admin map view) ─────────────

  @SubscribeMessage('join-live')
  async handleJoinLive(@ConnectedSocket() client: Socket) {
    client.join(LIVE_ROOM);
    this.logger.log(`Client ${client.id} joined live-tracking`);

    // Send current snapshot of all active vehicles
    try {
      const live = await this.trackingService.getLiveVehicleLocations();
      client.emit('live-snapshot', live);
    } catch (_) {}

    return { success: true };
  }

  @SubscribeMessage('leave-live')
  handleLeaveLive(@ConnectedSocket() client: Socket) {
    client.leave(LIVE_ROOM);
    return { success: true };
  }

  // ── Driver sends location via WebSocket (alternative to REST) ────────────

  @SubscribeMessage('update-location')
  async handleLocationUpdate(
    @MessageBody() data: { tripId: string; location: UpdateLocationDto },
    @ConnectedSocket() client: Socket,
  ) {
    const { tripId, location } = data;
    try {
      const saved = await this.trackingService.saveLocation(tripId, location);
      this.broadcastLocationUpdate(tripId, saved);
      return { success: true, location: saved };
    } catch (error) {
      this.logger.error(`WS location update failed: ${error.message}`);
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
      const saved = await this.trackingService.saveBulkLocations(tripId, locations);
      // Broadcast last location
      if (saved.length > 0) {
        this.server.to(`trip-${tripId}`).emit('location-bulk-update', { tripId, locations: saved });
      }
      return { success: true, count: saved.length };
    } catch (error) {
      this.logger.error(`WS bulk update failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // ── Called by REST controller after saving a location ────────────────────

  /**
   * Broadcast a location update to:
   * 1. All clients watching this specific trip (`trip-{tripId}` room)
   * 2. All clients on the global live map (`live-tracking` room)
   */
  broadcastLocationUpdate(tripId: string, location: any) {
    // Per-trip room (driver app, trip detail)
    this.server.to(`trip-${tripId}`).emit('location-update', { tripId, location });

    // Global live map room (transport admin)
    this.server.to(LIVE_ROOM).emit('vehicle-location', {
      tripId,
      vehicleId: location.vehicleId ?? null,
      plateNumber: location.plateNumber ?? null,
      make: location.make ?? null,
      model: location.model ?? null,
      fuelType: location.fuelType ?? null,
      driverName: location.driverName ?? null,
      requesterName: location.requesterName ?? null,
      destination: location.destination ?? null,
      requestNumber: location.requestNumber ?? null,
      latitude: location.latitude,
      longitude: location.longitude,
      speed: location.speed ?? null,
      heading: location.heading ?? null,
      timestamp: location.timestamp ?? new Date().toISOString(),
      engineSimulatedOff: location.engineSimulatedOff ?? false,
      geofenceStatus: location.geofenceStatus ?? 'clear',
      violationZoneName: location.violationZoneName ?? null,
      // Travel & fuel stats
      traveledKm: location.traveledKm ?? null,
      estimatedDistance: location.estimatedDistance ?? null,
      fuelUsedLiters: location.fuelUsedLiters ?? null,
      fuelRemainingLiters: location.fuelRemainingLiters ?? null,
      fuelRemainingPercent: location.fuelRemainingPercent ?? null,
      fuelRemainingKm: location.fuelRemainingKm ?? null,
      actualFuelCost: location.actualFuelCost ?? null,
      expectedTotalFuelCost: location.expectedTotalFuelCost ?? null,
    });
  }

  /** Broadcast a service vehicle location update to the global live map room */
  broadcastServiceVehicleLocation(vehicleId: string, location: any) {
    this.server.to(LIVE_ROOM).emit('service-vehicle-location', {
      vehicleId,
      plateNumber: location.plateNumber ?? null,
      make: location.make ?? null,
      model: location.model ?? null,
      fuelType: location.fuelType ?? null,
      serviceVehicleType: location.serviceVehicleType ?? null,
      driverName: location.driverName ?? null,
      latitude: location.latitude,
      longitude: location.longitude,
      speed: location.speed ?? null,
      heading: location.heading ?? null,
      timestamp: location.timestamp ?? new Date().toISOString(),
    });
  }

  /**
   * Send a notification to a specific user's socket room.
   * Users join their own room `user-{userId}` on connect.
   */
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user-${userId}`).emit('notification', notification);
  }

  getActiveViewers(tripId: string): number {
    const room = this.server.sockets.adapter.rooms.get(`trip-${tripId}`);
    return room ? room.size : 0;
  }
}
