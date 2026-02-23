import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(
    recipient: User,
    type: NotificationType,
    title: string,
    message: string,
    data?: any,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      recipient,
      type,
      title,
      message,
      data,
    });

    return this.notificationRepository.save(notification);
  }

  async findByUser(userId: string, isRead?: boolean): Promise<Notification[]> {
    const query: any = { recipient: { id: userId } };
    
    if (isRead !== undefined) {
      query.isRead = isRead;
    }

    return this.notificationRepository.find({
      where: query,
      order: { sentAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, recipient: { id: userId } },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();

    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { recipient: { id: userId }, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { recipient: { id: userId }, isRead: false },
    });
  }

  // Helper methods for trip notifications
  async notifyTripSubmitted(trip: any): Promise<void> {
    // Notify approver based on trip type and state
    // Implementation depends on workflow
  }

  async notifyTripApproved(trip: any, approver: User): Promise<void> {
    await this.create(
      trip.requester,
      NotificationType.TripApproved,
      'Trip Request Approved',
      `Your trip request ${trip.requestNumber} has been approved by ${approver.name}`,
      { tripId: trip.id, requestNumber: trip.requestNumber },
    );
  }

  async notifyTripRejected(trip: any, rejector: User, reason: string): Promise<void> {
    await this.create(
      trip.requester,
      NotificationType.TripRejected,
      'Trip Request Rejected',
      `Your trip request ${trip.requestNumber} has been rejected. Reason: ${reason}`,
      { tripId: trip.id, requestNumber: trip.requestNumber, reason },
    );
  }

  async notifyTripAllocated(trip: any): Promise<void> {
    // Notify requester
    await this.create(
      trip.requester,
      NotificationType.TripAllocated,
      'Vehicle and Driver Allocated',
      `Vehicle ${trip.allocatedVehicle.plateNumber} and driver have been allocated to your trip ${trip.requestNumber}`,
      { tripId: trip.id, requestNumber: trip.requestNumber },
    );

    // Notify driver
    if (trip.allocatedDriver && trip.allocatedDriver.user) {
      await this.create(
        trip.allocatedDriver.user,
        NotificationType.TripAllocated,
        'New Trip Assignment',
        `You have been assigned to trip ${trip.requestNumber}`,
        { tripId: trip.id, requestNumber: trip.requestNumber },
      );
    }
  }

  async notifyTripReady(trip: any): Promise<void> {
    await this.create(
      trip.requester,
      NotificationType.TripReady,
      'Trip Ready',
      `Your trip ${trip.requestNumber} is ready to start`,
      { tripId: trip.id, requestNumber: trip.requestNumber },
    );

    if (trip.allocatedDriver && trip.allocatedDriver.user) {
      await this.create(
        trip.allocatedDriver.user,
        NotificationType.TripReady,
        'Trip Ready',
        `Trip ${trip.requestNumber} is ready to start`,
        { tripId: trip.id, requestNumber: trip.requestNumber },
      );
    }
  }

  async notifyTripCompleted(trip: any): Promise<void> {
    await this.create(
      trip.requester,
      NotificationType.TripCompleted,
      'Trip Completed',
      `Your trip ${trip.requestNumber} has been completed`,
      { tripId: trip.id, requestNumber: trip.requestNumber },
    );
  }
}
