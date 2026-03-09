import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = {
      host: this.configService.get('email.host', 'smtp.gmail.com'),
      port: this.configService.get('email.port', 587),
      secure: this.configService.get('email.secure', false),
      auth: {
        user: this.configService.get('email.user'),
        pass: this.configService.get('email.password'),
      },
    };

    this.transporter = nodemailer.createTransporter(emailConfig);

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('Email service initialization failed:', error);
      } else {
        this.logger.log('Email service is ready');
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get('email.from', 'Fleet Management <noreply@fleet.school.edu>'),
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      return false;
    }
  }

  // Trip-related email templates
  async sendTripSubmittedEmail(to: string, tripDetails: any): Promise<boolean> {
    const html = `
      <h2>Trip Request Submitted</h2>
      <p>Your trip request has been submitted successfully.</p>
      <h3>Trip Details:</h3>
      <ul>
        <li><strong>Purpose:</strong> ${tripDetails.purpose}</li>
        <li><strong>Destination:</strong> ${tripDetails.destination}</li>
        <li><strong>Start Date:</strong> ${new Date(tripDetails.startDateTime).toLocaleString()}</li>
        <li><strong>End Date:</strong> ${new Date(tripDetails.endDateTime).toLocaleString()}</li>
        <li><strong>Passengers:</strong> ${tripDetails.passengerCount}</li>
        <li><strong>Status:</strong> ${tripDetails.state}</li>
      </ul>
      <p>You will be notified when your trip is approved or if any action is required.</p>
    `;

    return this.sendEmail({
      to,
      subject: 'Trip Request Submitted',
      html,
    });
  }

  async sendTripApprovedEmail(to: string, tripDetails: any, approverName: string): Promise<boolean> {
    const html = `
      <h2>Trip Request Approved</h2>
      <p>Your trip request has been approved by ${approverName}.</p>
      <h3>Trip Details:</h3>
      <ul>
        <li><strong>Purpose:</strong> ${tripDetails.purpose}</li>
        <li><strong>Destination:</strong> ${tripDetails.destination}</li>
        <li><strong>Start Date:</strong> ${new Date(tripDetails.startDateTime).toLocaleString()}</li>
        <li><strong>Current Status:</strong> ${tripDetails.state}</li>
      </ul>
      <p>Your trip is progressing through the approval workflow.</p>
    `;

    return this.sendEmail({
      to,
      subject: 'Trip Request Approved',
      html,
    });
  }

  async sendTripRejectedEmail(to: string, tripDetails: any, rejectorName: string, reason: string): Promise<boolean> {
    const html = `
      <h2>Trip Request Rejected</h2>
      <p>Unfortunately, your trip request has been rejected by ${rejectorName}.</p>
      <h3>Trip Details:</h3>
      <ul>
        <li><strong>Purpose:</strong> ${tripDetails.purpose}</li>
        <li><strong>Destination:</strong> ${tripDetails.destination}</li>
        <li><strong>Start Date:</strong> ${new Date(tripDetails.startDateTime).toLocaleString()}</li>
      </ul>
      <h3>Rejection Reason:</h3>
      <p>${reason}</p>
      <p>You may submit a new trip request if needed.</p>
    `;

    return this.sendEmail({
      to,
      subject: 'Trip Request Rejected',
      html,
    });
  }

  async sendTripAllocatedEmail(to: string, tripDetails: any, vehicleInfo: any, driverInfo: any): Promise<boolean> {
    const html = `
      <h2>Vehicle and Driver Allocated</h2>
      <p>A vehicle and driver have been assigned to your trip.</p>
      <h3>Trip Details:</h3>
      <ul>
        <li><strong>Purpose:</strong> ${tripDetails.purpose}</li>
        <li><strong>Destination:</strong> ${tripDetails.destination}</li>
        <li><strong>Start Date:</strong> ${new Date(tripDetails.startDateTime).toLocaleString()}</li>
      </ul>
      <h3>Vehicle Information:</h3>
      <ul>
        <li><strong>Vehicle:</strong> ${vehicleInfo.make} ${vehicleInfo.model}</li>
        <li><strong>Plate Number:</strong> ${vehicleInfo.plateNumber}</li>
        <li><strong>Capacity:</strong> ${vehicleInfo.capacity} passengers</li>
      </ul>
      <h3>Driver Information:</h3>
      <ul>
        <li><strong>Driver:</strong> ${driverInfo.name}</li>
        <li><strong>Phone:</strong> ${driverInfo.phoneNumber}</li>
        <li><strong>Rating:</strong> ${driverInfo.rating}/5</li>
      </ul>
    `;

    return this.sendEmail({
      to,
      subject: 'Vehicle and Driver Allocated',
      html,
    });
  }

  async sendPendingApprovalEmail(to: string, tripDetails: any, requesterName: string): Promise<boolean> {
    const html = `
      <h2>Trip Approval Required</h2>
      <p>A trip request from ${requesterName} requires your approval.</p>
      <h3>Trip Details:</h3>
      <ul>
        <li><strong>Purpose:</strong> ${tripDetails.purpose}</li>
        <li><strong>Destination:</strong> ${tripDetails.destination}</li>
        <li><strong>Start Date:</strong> ${new Date(tripDetails.startDateTime).toLocaleString()}</li>
        <li><strong>End Date:</strong> ${new Date(tripDetails.endDateTime).toLocaleString()}</li>
        <li><strong>Passengers:</strong> ${tripDetails.passengerCount}</li>
      </ul>
      <p><strong>Action Required:</strong> Please review and approve/reject this trip request.</p>
      <p><em>Note: This request will auto-reject in 48 hours if no action is taken.</em></p>
    `;

    return this.sendEmail({
      to,
      subject: 'Trip Approval Required',
      html,
    });
  }

  async sendTimeoutWarningEmail(to: string, tripDetails: any, hoursRemaining: number): Promise<boolean> {
    const html = `
      <h2>⚠️ Trip Approval Timeout Warning</h2>
      <p>A trip request requires your approval within the next ${hoursRemaining} hours.</p>
      <h3>Trip Details:</h3>
      <ul>
        <li><strong>Purpose:</strong> ${tripDetails.purpose}</li>
        <li><strong>Destination:</strong> ${tripDetails.destination}</li>
        <li><strong>Start Date:</strong> ${new Date(tripDetails.startDateTime).toLocaleString()}</li>
      </ul>
      <p><strong>⏰ Time Remaining:</strong> ${hoursRemaining} hours</p>
      <p><strong>Action Required:</strong> Please review and approve/reject this trip request immediately.</p>
      <p><em>This request will be automatically rejected if no action is taken.</em></p>
    `;

    return this.sendEmail({
      to,
      subject: `⚠️ Trip Approval Timeout Warning - ${hoursRemaining}h Remaining`,
      html,
    });
  }

  // Maintenance-related emails
  async sendMaintenanceRequestEmail(to: string, maintenanceDetails: any, vehicleInfo: any): Promise<boolean> {
    const html = `
      <h2>Maintenance Request Submitted</h2>
      <p>A new maintenance request has been submitted.</p>
      <h3>Vehicle Information:</h3>
      <ul>
        <li><strong>Vehicle:</strong> ${vehicleInfo.make} ${vehicleInfo.model}</li>
        <li><strong>Plate Number:</strong> ${vehicleInfo.plateNumber}</li>
      </ul>
      <h3>Issue Details:</h3>
      <p>${maintenanceDetails.issueDescription}</p>
      <p><strong>Priority:</strong> ${maintenanceDetails.priority}</p>
      <p>Please inspect the vehicle and provide a cost estimate.</p>
    `;

    return this.sendEmail({
      to,
      subject: `Maintenance Request - ${vehicleInfo.plateNumber}`,
      html,
    });
  }

  // Fuel-related emails
  async sendLowFuelAlertEmail(to: string, vehicleInfo: any, fuelLevel: number): Promise<boolean> {
    const html = `
      <h2>⚠️ Low Fuel Alert</h2>
      <p>A vehicle has low fuel and requires refueling.</p>
      <h3>Vehicle Information:</h3>
      <ul>
        <li><strong>Vehicle:</strong> ${vehicleInfo.make} ${vehicleInfo.model}</li>
        <li><strong>Plate Number:</strong> ${vehicleInfo.plateNumber}</li>
        <li><strong>Current Fuel Level:</strong> ${fuelLevel}%</li>
      </ul>
      <p><strong>Action Required:</strong> Please arrange for refueling.</p>
    `;

    return this.sendEmail({
      to,
      subject: `⚠️ Low Fuel Alert - ${vehicleInfo.plateNumber}`,
      html,
    });
  }

  // Generic notification email
  async sendNotificationEmail(to: string, title: string, message: string): Promise<boolean> {
    const html = `
      <h2>${title}</h2>
      <p>${message}</p>
      <hr>
      <p><small>This is an automated message from Fleet Management System.</small></p>
    `;

    return this.sendEmail({
      to,
      subject: title,
      html,
    });
  }
}
