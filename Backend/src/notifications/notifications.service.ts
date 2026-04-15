import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SmsService } from '../sms/sms.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly usersService: UsersService,
    private readonly smsService: SmsService,
    @Inject(forwardRef(() => NotificationsGateway))
    private readonly notificationsGateway: NotificationsGateway,
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

    const savedNotification =
      await this.notificationRepository.save(notification);

    // Send real-time notification if gateway is available
    if (this.notificationsGateway) {
      try {
        await this.notificationsGateway.sendNotificationToUser(recipient.id, {
          id: savedNotification.id,
          type: savedNotification.type,
          title: savedNotification.title,
          message: savedNotification.message,
          data: savedNotification.data,
          sentAt: savedNotification.sentAt,
          isRead: savedNotification.isRead,
        });
      } catch (error) {
        console.error('Failed to send real-time notification:', error);
      }
    }

    return savedNotification;
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

  // Helper method to send notifications to multiple users
  async createBulkNotifications(
    recipients: User[],
    type: NotificationType,
    title: string,
    message: string,
    data?: any,
  ): Promise<Notification[]> {
    const notifications = recipients.map((recipient) =>
      this.notificationRepository.create({
        recipient,
        type,
        title,
        message,
        data,
      }),
    );

    const savedNotifications =
      await this.notificationRepository.save(notifications);

    // Send real-time notifications if gateway is available
    if (this.notificationsGateway) {
      try {
        for (const notification of savedNotifications) {
          await this.notificationsGateway.sendNotificationToUser(notification.recipient.id, {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            sentAt: notification.sentAt,
            isRead: notification.isRead,
          });
        }
      } catch (error) {
        console.error('Failed to send bulk real-time notifications:', error);
      }
    }

    return savedNotifications;
  }

  // Get all stakeholders for a trip
  async getTripStakeholders(trip: any): Promise<{
    requester: User;
    departmentHead?: User | null;
    dean?: User | null;
    president?: User | null;
    deploymentTeam: User[];
    transportOffice: User[];
    driver?: User;
    allAdmins: User[];
  }> {
    const stakeholders = {
      requester: trip.requester,
      departmentHead: null as User | null,
      dean: null as User | null,
      president: null as User | null,
      deploymentTeam: [] as User[],
      transportOffice: [] as User[],
      driver: undefined as User | undefined,
      allAdmins: [] as User[],
    };

    // Get department head
    if (trip.requester.department) {
      stakeholders.departmentHead = await this.usersService.findDepartmentHead(
        trip.requester.department.id,
      );
    }

    // Get dean (college head)
    if (trip.requester.college) {
      stakeholders.dean = await this.usersService.findCollegeHead(
        trip.requester.college.id,
      );
    }

    // Get president
    stakeholders.president = await this.usersService.findPresident();

    // Get deployment team members
    stakeholders.deploymentTeam = await this.usersService.findByRole(
      UserRole.DeploymentTeam,
    );

    // Get transport office members
    stakeholders.transportOffice = await this.usersService.findByRole(
      UserRole.TransportOffice,
    );

    // Get driver if allocated
    if (trip.allocatedDriver && trip.allocatedDriver.user) {
      stakeholders.driver = trip.allocatedDriver.user;
    }

    // Build allAdmins: only the relevant dean (requester's college), president,
    // deployment team, and transport office — NOT all deans system-wide.
    const relevantAdmins: User[] = [];
    if (stakeholders.dean) relevantAdmins.push(stakeholders.dean);
    if (stakeholders.president) relevantAdmins.push(stakeholders.president);
    relevantAdmins.push(...stakeholders.deploymentTeam);
    relevantAdmins.push(...stakeholders.transportOffice);
    // Deduplicate by id
    const seen = new Set<string>();
    stakeholders.allAdmins = relevantAdmins.filter((u) => {
      if (seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });

    return stakeholders;
  }

  // Enhanced trip notification methods
  async notifyTripSubmitted(trip: any): Promise<void> {
    const stakeholders = await this.getTripStakeholders(trip);

    // Notify the employee that their trip has been submitted
    await this.create(
      stakeholders.requester,
      NotificationType.TripSubmitted,
      'Trip Request Submitted',
      `Your trip request ${trip.requestNumber} has been submitted for approval`,
      { 
        tripId: trip.id, 
        requestNumber: trip.requestNumber,
        startDateTime: trip.startDateTime,
        endDateTime: trip.endDateTime,
        destination: trip.destination
      },
    );

    // Notify the correct next approver based on trip state
    let nextApprover: any = null;
    if (trip.state === 'PENDING_DEPARTMENT') {
      nextApprover = stakeholders.departmentHead;
    } else if (trip.state === 'PENDING_COLLEGE') {
      nextApprover = stakeholders.dean;
    } else if (trip.state === 'PENDING_PRESIDENT') {
      nextApprover = stakeholders.president;
    }
    if (nextApprover) {
      await this.create(
        nextApprover,
        NotificationType.ApprovalPending,
        'New Trip Approval Required',
        `Trip request ${trip.requestNumber} from ${stakeholders.requester.name} requires your approval`,
        {
          tripId: trip.id,
          requestNumber: trip.requestNumber,
          requesterName: stakeholders.requester.name,
          startDateTime: trip.startDateTime,
          endDateTime: trip.endDateTime,
          destination: trip.destination
        },
      );
    }

    // Notify all admins about new trip request
    const adminNotificationRecipients = [
      ...stakeholders.deploymentTeam,
      ...stakeholders.transportOffice,
    ].filter((user) => user.id !== nextApprover?.id); // Avoid duplicate for next approver

    // Only notify deployment/transport when the trip is already approved for allocation.
    // For trips still in the approval chain, they don't need to act yet.
    const notifyOpsTeam = trip.state === 'APPROVED_FOR_ALLOCATION';

    if (notifyOpsTeam && adminNotificationRecipients.length > 0) {
      await this.createBulkNotifications(
        adminNotificationRecipients,
        NotificationType.NewTripRequest,
        'New Trip Request in System',
        `${stakeholders.requester.name} submitted trip request ${trip.requestNumber} to ${trip.destination}`,
        {
          tripId: trip.id,
          requestNumber: trip.requestNumber,
          requesterName: stakeholders.requester.name,
          startDateTime: trip.startDateTime,
          endDateTime: trip.endDateTime,
          destination: trip.destination
        },
      );
    }

    console.log(
      `Trip submission notifications sent for trip ${trip.id} to ${1 + (nextApprover ? 1 : 0) + adminNotificationRecipients.length} recipients`,
    );
  }

  async notifyTripApproved(trip: any, approver: User): Promise<void> {
    const stakeholders = await this.getTripStakeholders(trip);

    // Notify the requester
    await this.create(
      stakeholders.requester,
      NotificationType.TripApproved,
      'Trip Request Approved',
      `Your trip request ${trip.requestNumber} has been approved by ${approver.name}`,
      {
        tripId: trip.id,
        requestNumber: trip.requestNumber,
        approverName: approver.name,
      },
    );

    // Notify all admins about the approval
    const adminRecipients = stakeholders.allAdmins.filter(
      (user) => user.id !== approver.id,
    );
    if (adminRecipients.length > 0) {
      await this.createBulkNotifications(
        adminRecipients,
        NotificationType.TripApproved,
        'Trip Request Approved',
        `Trip request ${trip.requestNumber} from ${stakeholders.requester.name} was approved by ${approver.name}`,
        {
          tripId: trip.id,
          requestNumber: trip.requestNumber,
          approverName: approver.name,
          requesterName: stakeholders.requester.name,
        },
      );
    }

    // If this moves to next approval level, notify the next approver
    if (trip.state === 'PENDING_COLLEGE' && stakeholders.dean) {
      await this.create(
        stakeholders.dean,
        NotificationType.ApprovalPending,
        'Trip Approval Required - College Level',
        `Trip request ${trip.requestNumber} from ${stakeholders.requester.name} requires your college-level approval`,
        {
          tripId: trip.id,
          requestNumber: trip.requestNumber,
          requesterName: stakeholders.requester.name,
        },
      );
    } else if (trip.state === 'PENDING_PRESIDENT' && stakeholders.president) {
      await this.create(
        stakeholders.president,
        NotificationType.ApprovalPending,
        'Trip Approval Required - Presidential Level',
        `Trip request ${trip.requestNumber} from ${stakeholders.requester.name} requires presidential approval`,
        {
          tripId: trip.id,
          requestNumber: trip.requestNumber,
          requesterName: stakeholders.requester.name,
        },
      );
    } else if (trip.state === 'APPROVED_FOR_ALLOCATION') {
      // Notify deployment team for allocation
      if (stakeholders.deploymentTeam.length > 0) {
        await this.createBulkNotifications(
          stakeholders.deploymentTeam,
          NotificationType.ApprovalPending,
          'Trip Ready for Resource Allocation',
          `Trip request ${trip.requestNumber} from ${stakeholders.requester.name} is approved and ready for vehicle/driver allocation`,
          {
            tripId: trip.id,
            requestNumber: trip.requestNumber,
            requesterName: stakeholders.requester.name,
          },
        );
      }
    }

    console.log(`Trip approval notifications sent for trip ${trip.id}`);

    // SMS to requester
    if (stakeholders.requester.phoneNumber) {
      this.smsService.sendTripApprovedSms(stakeholders.requester.phoneNumber, trip.destination).catch(() => {});
    }
  }

  async notifyTripRejected(
    trip: any,
    rejector: User,
    reason: string,
  ): Promise<void> {
    const stakeholders = await this.getTripStakeholders(trip);

    // Notify the requester
    await this.create(
      stakeholders.requester,
      NotificationType.TripRejected,
      'Trip Request Rejected',
      `Your trip request ${trip.requestNumber} has been rejected by ${rejector.name}. Reason: ${reason}`,
      {
        tripId: trip.id,
        requestNumber: trip.requestNumber,
        rejectorName: rejector.name,
        reason,
      },
    );

    // Notify all admins about the rejection
    const adminRecipients = stakeholders.allAdmins.filter(
      (user) => user.id !== rejector.id,
    );
    if (adminRecipients.length > 0) {
      await this.createBulkNotifications(
        adminRecipients,
        NotificationType.TripRejected,
        'Trip Request Rejected',
        `Trip request ${trip.requestNumber} from ${stakeholders.requester.name} was rejected by ${rejector.name}`,
        {
          tripId: trip.id,
          requestNumber: trip.requestNumber,
          rejectorName: rejector.name,
          requesterName: stakeholders.requester.name,
          reason,
        },
      );
    }

    console.log(`Trip rejection notifications sent for trip ${trip.id}`);

    // SMS to requester
    if (stakeholders.requester.phoneNumber) {
      this.smsService.sendTripRejectedSms(stakeholders.requester.phoneNumber, trip.destination, reason).catch(() => {});
    }
  }

  async notifyTripAllocated(trip: any): Promise<void> {
    const stakeholders = await this.getTripStakeholders(trip);

    const vehiclePlate = trip.allocatedVehicle?.plateNumber ?? '—';
    const vehicleMake = trip.allocatedVehicle?.make ?? '';
    const vehicleModel = trip.allocatedVehicle?.model ?? '';
    const vehicleYear = trip.allocatedVehicle?.year ?? '';
    const vehicleColor = trip.allocatedVehicle?.color ?? '';
    const vehicleFuelType = trip.allocatedVehicle?.fuelType ?? '';
    const vehicleCapacity = trip.allocatedVehicle?.capacity ?? '';
    const driverName = trip.allocatedDriver?.user?.name ?? '—';
    const driverPhone = trip.allocatedDriver?.user?.phoneNumber ?? null;
    const driverLicense = trip.allocatedDriver?.licenseNumber ?? null;

    const allocationData = {
      tripId: trip.id,
      requestNumber: trip.requestNumber,
      destination: trip.destination,
      startDateTime: trip.startDateTime,
      endDateTime: trip.endDateTime,
      // Vehicle details
      vehiclePlate,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      vehicleFuelType,
      vehicleCapacity,
      // Driver details
      driverName,
      driverPhone,
      driverLicense,
    };

    // Notify requester with full vehicle + driver details
    await this.create(
      stakeholders.requester,
      NotificationType.TripAllocated,
      'Vehicle and Driver Allocated',
      `Your trip ${trip.requestNumber} has been allocated: ${vehicleMake} ${vehicleModel} (${vehiclePlate}) — Driver: ${driverName}${driverPhone ? ` · ${driverPhone}` : ''}`,
      allocationData,
    );

    // Notify driver
    if (stakeholders.driver) {
      await this.create(
        stakeholders.driver,
        NotificationType.TripAllocated,
        'New Trip Assignment',
        `You have been assigned to trip ${trip.requestNumber} to ${trip.destination} for ${stakeholders.requester.name}`,
        {
          tripId: trip.id,
          requestNumber: trip.requestNumber,
          destination: trip.destination,
          requesterName: stakeholders.requester.name,
          startDateTime: trip.startDateTime,
          endDateTime: trip.endDateTime,
        },
      );
    }

    // Notify transport office for next steps
    if (stakeholders.transportOffice.length > 0) {
      await this.createBulkNotifications(
        stakeholders.transportOffice,
        NotificationType.ApprovalPending,
        'Transport Confirmation Required',
        `Trip ${trip.requestNumber} has been allocated vehicle ${vehiclePlate} and requires your transport confirmation`,
        { tripId: trip.id, requestNumber: trip.requestNumber, vehiclePlate },
      );
    }

    // Notify other admins
    const otherAdmins = [
      stakeholders.departmentHead,
      stakeholders.dean,
      stakeholders.president,
    ].filter((u): u is User => !!u);
    if (otherAdmins.length > 0) {
      await this.createBulkNotifications(
        otherAdmins,
        NotificationType.TripAllocated,
        'Trip Resources Allocated',
        `Trip ${trip.requestNumber} from ${stakeholders.requester.name} has been allocated vehicle ${vehiclePlate}`,
        { tripId: trip.id, requestNumber: trip.requestNumber, requesterName: stakeholders.requester.name, vehiclePlate },
      );
    }

    console.log(`Trip allocation notifications sent for trip ${trip.id}`);

    // SMS to requester
    if (stakeholders.requester.phoneNumber && trip.allocatedVehicle && trip.allocatedDriver) {
      this.smsService.sendTripAllocatedSms(
        stakeholders.requester.phoneNumber,
        vehiclePlate,
        driverName,
        trip.destination,
      ).catch(() => {});
    }
    // SMS to driver
    if (stakeholders.driver?.phoneNumber) {
      this.smsService.sendSms(
        stakeholders.driver.phoneNumber,
        `Fleet: You have been assigned trip ${trip.requestNumber} to ${trip.destination}. Please confirm in the app.`,
      ).catch(() => {});
    }
  }

  async notifyTripReady(trip: any): Promise<void> {
    const stakeholders = await this.getTripStakeholders(trip);

    const vehiclePlate = trip.allocatedVehicle?.plateNumber ?? '—';
    const vehicleMake = trip.allocatedVehicle?.make ?? '';
    const vehicleModel = trip.allocatedVehicle?.model ?? '';
    const vehicleYear = trip.allocatedVehicle?.year ?? '';
    const vehicleColor = trip.allocatedVehicle?.color ?? '';
    const vehicleFuelType = trip.allocatedVehicle?.fuelType ?? '';
    const vehicleCapacity = trip.allocatedVehicle?.capacity ?? '';
    const driverName = trip.allocatedDriver?.user?.name ?? '—';
    const driverPhone = trip.allocatedDriver?.user?.phoneNumber ?? null;
    const driverLicense = trip.allocatedDriver?.licenseNumber ?? null;

    const readyData = {
      tripId: trip.id,
      requestNumber: trip.requestNumber,
      destination: trip.destination,
      startDateTime: trip.startDateTime,
      endDateTime: trip.endDateTime,
      vehiclePlate,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleColor,
      vehicleFuelType,
      vehicleCapacity,
      driverName,
      driverPhone,
      driverLicense,
    };

    // Notify requester with full details
    await this.create(
      stakeholders.requester,
      NotificationType.TripReady,
      'Trip Ready — Your Vehicle & Driver Details',
      `Your trip ${trip.requestNumber} is confirmed and ready. Vehicle: ${vehicleMake} ${vehicleModel} (${vehiclePlate})${vehicleColor ? `, ${vehicleColor}` : ''}. Driver: ${driverName}${driverPhone ? ` · ${driverPhone}` : ''}. Please coordinate with your driver.`,
      readyData,
    );

    // Notify driver
    if (stakeholders.driver) {
      await this.create(
        stakeholders.driver,
        NotificationType.TripReady,
        'Trip Ready to Start',
        `Trip ${trip.requestNumber} to ${trip.destination} is ready to start. Please coordinate with ${stakeholders.requester.name}.`,
        {
          tripId: trip.id,
          requestNumber: trip.requestNumber,
          destination: trip.destination,
          requesterName: stakeholders.requester.name,
          startDateTime: trip.startDateTime,
        },
      );
    }

    // Notify all admins
    if (stakeholders.allAdmins.length > 0) {
      await this.createBulkNotifications(
        stakeholders.allAdmins,
        NotificationType.TripReady,
        'Trip Ready to Start',
        `Trip ${trip.requestNumber} from ${stakeholders.requester.name} is confirmed and ready to start`,
        { tripId: trip.id, requestNumber: trip.requestNumber, requesterName: stakeholders.requester.name },
      );
    }

    console.log(`Trip ready notifications sent for trip ${trip.id}`);
  }

  async notifyTripCompleted(trip: any): Promise<void> {
    const stakeholders = await this.getTripStakeholders(trip);

    // Notify requester
    await this.create(
      stakeholders.requester,
      NotificationType.TripCompleted,
      'Trip Completed Successfully',
      `Your trip ${trip.requestNumber} to ${trip.destination} has been completed successfully. Please consider submitting feedback.`,
      {
        tripId: trip.id,
        requestNumber: trip.requestNumber,
        destination: trip.destination,
      },
    );

    // Notify driver
    if (stakeholders.driver) {
      await this.create(
        stakeholders.driver,
        NotificationType.TripCompleted,
        'Trip Completed',
        `Trip ${trip.requestNumber} to ${trip.destination} has been marked as completed.`,
        {
          tripId: trip.id,
          requestNumber: trip.requestNumber,
          destination: trip.destination,
        },
      );
    }

    // Notify all admins
    if (stakeholders.allAdmins.length > 0) {
      await this.createBulkNotifications(
        stakeholders.allAdmins,
        NotificationType.TripCompleted,
        'Trip Completed',
        `Trip ${trip.requestNumber} from ${stakeholders.requester.name} to ${trip.destination} has been completed`,
        {
          tripId: trip.id,
          requestNumber: trip.requestNumber,
          requesterName: stakeholders.requester.name,
          destination: trip.destination,
        },
      );
    }

    console.log(`Trip completion notifications sent for trip ${trip.id}`);
  }

  async notifyTripCompletedEarly(trip: any, reason?: string): Promise<void> {
    const stakeholders = await this.getTripStakeholders(trip);
    const message = `Trip ${trip.requestNumber} to ${trip.destination} has been completed early. ${reason ? `Reason: ${reason}` : ''}`;

    // Notify the requester
    await this.create(
      stakeholders.requester,
      NotificationType.TripCompletedEarly,
      'Trip Completed Early',
      message + ' Please consider submitting feedback.',
      {
        tripId: trip.id,
        requestNumber: trip.requestNumber,
        reason,
        destination: trip.destination,
      },
    );

    // Notify driver
    if (stakeholders.driver) {
      await this.create(
        stakeholders.driver,
        NotificationType.TripCompletedEarly,
        'Trip Completed Early',
        message,
        {
          tripId: trip.id,
          requestNumber: trip.requestNumber,
          reason,
          destination: trip.destination,
        },
      );
    }

    // Notify all admins
    if (stakeholders.allAdmins.length > 0) {
      await this.createBulkNotifications(
        stakeholders.allAdmins,
        NotificationType.TripCompletedEarly,
        'Trip Completed Early',
        `Trip ${trip.requestNumber} from ${stakeholders.requester.name} ${message}`,
        {
          tripId: trip.id,
          requestNumber: trip.requestNumber,
          reason,
          requesterName: stakeholders.requester.name,
          destination: trip.destination,
        },
      );
    }

    console.log(`Early completion notifications sent for trip ${trip.id}`);
  }

  async notifyFeedbackSubmitted(trip: any, feedback: any): Promise<void> {
    const stakeholders = await this.getTripStakeholders(trip);
    const message = `Feedback has been submitted for trip ${trip.requestNumber} to ${trip.destination}. Overall rating: ${feedback.overallRating}/5`;

    // Notify all admins about feedback
    if (stakeholders.allAdmins.length > 0) {
      await this.createBulkNotifications(
        stakeholders.allAdmins,
        NotificationType.FeedbackSubmitted,
        'Trip Feedback Received',
        `${stakeholders.requester.name} submitted feedback for trip ${trip.requestNumber}. Rating: ${feedback.overallRating}/5 stars`,
        {
          tripId: trip.id,
          feedbackId: feedback.id,
          rating: feedback.overallRating,
          requesterName: stakeholders.requester.name,
          requestNumber: trip.requestNumber,
        },
      );
    }

    // Notify driver about their performance feedback
    if (stakeholders.driver && feedback.driverRating) {
      await this.create(
        stakeholders.driver,
        NotificationType.FeedbackSubmitted,
        'Performance Feedback Received',
        `You received a ${feedback.driverRating}/5 rating for trip ${trip.requestNumber}. ${feedback.comments ? `Comment: "${feedback.comments}"` : ''}`,
        {
          tripId: trip.id,
          feedbackId: feedback.id,
          driverRating: feedback.driverRating,
          comments: feedback.comments,
        },
      );
    }

    console.log(`Feedback notifications sent for trip ${trip.id}`);
  }
}
