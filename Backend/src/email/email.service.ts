import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

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

    this.transporter = createTransport(emailConfig);

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
        from: this.configService.get(
          'email.from',
          'Fleet Management <noreply@fleet.school.edu>',
        ),
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

  async sendTripApprovedEmail(
    to: string,
    tripDetails: any,
    approverName: string,
  ): Promise<boolean> {
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

  async sendTripRejectedEmail(
    to: string,
    tripDetails: any,
    rejectorName: string,
    reason: string,
  ): Promise<boolean> {
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

  async sendTripAllocatedEmail(
    to: string,
    tripDetails: any,
    vehicleInfo: any,
    driverInfo: any,
  ): Promise<boolean> {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#1B3D2F;">✅ Vehicle & Driver Allocated — Your Trip is Ready</h2>
        <p>Your trip request <strong>${tripDetails.requestNumber}</strong> has been allocated a vehicle and driver.</p>

        <h3 style="color:#374151;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Trip Details</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#6b7280;">Destination</td><td style="padding:6px 0;font-weight:600;">${tripDetails.destination}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Purpose</td><td style="padding:6px 0;">${tripDetails.purpose || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Start</td><td style="padding:6px 0;">${new Date(tripDetails.startDateTime).toLocaleString()}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">End</td><td style="padding:6px 0;">${new Date(tripDetails.endDateTime).toLocaleString()}</td></tr>
        </table>

        <h3 style="color:#374151;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin-top:20px;">🚗 Vehicle</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#6b7280;">Make & Model</td><td style="padding:6px 0;font-weight:600;">${vehicleInfo.make} ${vehicleInfo.model}${vehicleInfo.year ? ` (${vehicleInfo.year})` : ''}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Plate Number</td><td style="padding:6px 0;font-weight:600;font-family:monospace;">${vehicleInfo.plateNumber}</td></tr>
          ${vehicleInfo.color ? `<tr><td style="padding:6px 0;color:#6b7280;">Color</td><td style="padding:6px 0;">${vehicleInfo.color}</td></tr>` : ''}
          ${vehicleInfo.fuelType ? `<tr><td style="padding:6px 0;color:#6b7280;">Fuel Type</td><td style="padding:6px 0;">${vehicleInfo.fuelType}</td></tr>` : ''}
          ${vehicleInfo.capacity ? `<tr><td style="padding:6px 0;color:#6b7280;">Capacity</td><td style="padding:6px 0;">${vehicleInfo.capacity} passengers</td></tr>` : ''}
        </table>

        <h3 style="color:#374151;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin-top:20px;">👤 Driver</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#6b7280;">Name</td><td style="padding:6px 0;font-weight:600;">${driverInfo.name}</td></tr>
          ${driverInfo.phoneNumber ? `<tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;"><a href="tel:${driverInfo.phoneNumber}" style="color:#1B3D2F;font-weight:600;">${driverInfo.phoneNumber}</a></td></tr>` : ''}
          ${driverInfo.licenseNumber ? `<tr><td style="padding:6px 0;color:#6b7280;">License</td><td style="padding:6px 0;">${driverInfo.licenseNumber}</td></tr>` : ''}
        </table>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;margin-top:20px;">
          <p style="margin:0;font-size:14px;color:#166534;">Please coordinate with your driver before the trip start time. Save the driver's phone number for easy contact.</p>
        </div>

        <hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;">
        <p style="text-align:center;color:#9ca3af;font-size:12px;">Fleet Management System — Haramaya University</p>
      </div>
    `;
    return this.sendEmail({ to, subject: `Trip Ready: ${vehicleInfo.plateNumber} — ${driverInfo.name}`, html });
  }

  async sendTripReadyEmail(
    to: string,
    tripDetails: any,
    vehicleInfo: any,
    driverInfo: any,
  ): Promise<boolean> {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#1B3D2F;">🟢 Your Trip is Confirmed & Ready to Start</h2>
        <p>Trip <strong>${tripDetails.requestNumber}</strong> has been confirmed by the transport office. Everything is set — here are your full details.</p>

        <h3 style="color:#374151;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Trip Details</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#6b7280;">Destination</td><td style="padding:6px 0;font-weight:600;">${tripDetails.destination}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Start</td><td style="padding:6px 0;font-weight:600;">${new Date(tripDetails.startDateTime).toLocaleString()}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">End</td><td style="padding:6px 0;">${new Date(tripDetails.endDateTime).toLocaleString()}</td></tr>
        </table>

        <h3 style="color:#374151;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin-top:20px;">🚗 Your Vehicle</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#6b7280;">Make & Model</td><td style="padding:6px 0;font-weight:600;">${vehicleInfo.make} ${vehicleInfo.model}${vehicleInfo.year ? ` (${vehicleInfo.year})` : ''}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Plate Number</td><td style="padding:6px 0;font-weight:700;font-family:monospace;font-size:16px;">${vehicleInfo.plateNumber}</td></tr>
          ${vehicleInfo.color ? `<tr><td style="padding:6px 0;color:#6b7280;">Color</td><td style="padding:6px 0;">${vehicleInfo.color}</td></tr>` : ''}
          ${vehicleInfo.fuelType ? `<tr><td style="padding:6px 0;color:#6b7280;">Fuel Type</td><td style="padding:6px 0;">${vehicleInfo.fuelType}</td></tr>` : ''}
          ${vehicleInfo.capacity ? `<tr><td style="padding:6px 0;color:#6b7280;">Capacity</td><td style="padding:6px 0;">${vehicleInfo.capacity} passengers</td></tr>` : ''}
        </table>

        <h3 style="color:#374151;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin-top:20px;">👤 Your Driver</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#6b7280;">Name</td><td style="padding:6px 0;font-weight:600;">${driverInfo.name}</td></tr>
          ${driverInfo.phoneNumber ? `<tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;"><a href="tel:${driverInfo.phoneNumber}" style="color:#1B3D2F;font-weight:700;font-size:16px;">${driverInfo.phoneNumber}</a></td></tr>` : ''}
          ${driverInfo.licenseNumber ? `<tr><td style="padding:6px 0;color:#6b7280;">License</td><td style="padding:6px 0;">${driverInfo.licenseNumber}</td></tr>` : ''}
        </table>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;margin-top:20px;">
          <p style="margin:0;font-size:14px;color:#166534;font-weight:600;">📞 Contact your driver at <a href="tel:${driverInfo.phoneNumber}" style="color:#166534;">${driverInfo.phoneNumber || 'N/A'}</a> to coordinate pickup.</p>
        </div>

        <hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;">
        <p style="text-align:center;color:#9ca3af;font-size:12px;">Fleet Management System — Haramaya University</p>
      </div>
    `;
    return this.sendEmail({ to, subject: `🟢 Trip Ready: ${vehicleInfo.plateNumber} — Driver: ${driverInfo.name}${driverInfo.phoneNumber ? ` (${driverInfo.phoneNumber})` : ''}`, html });
  }

  async sendDriverTripAssignmentEmail(
    to: string,
    tripDetails: any,
    requesterInfo: { name: string; phoneNumber?: string; email?: string },
  ): Promise<boolean> {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#1B3D2F;">🚗 New Trip Assignment</h2>
        <p>You have been assigned a new trip. Please review the details and coordinate with the requester.</p>

        <h3 style="color:#374151;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Trip Details</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#6b7280;">Trip #</td><td style="padding:6px 0;font-weight:600;font-family:monospace;">${tripDetails.requestNumber}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Destination</td><td style="padding:6px 0;font-weight:600;">${tripDetails.destination}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Purpose</td><td style="padding:6px 0;">${tripDetails.purpose || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Start</td><td style="padding:6px 0;font-weight:600;">${new Date(tripDetails.startDateTime).toLocaleString()}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">End</td><td style="padding:6px 0;">${new Date(tripDetails.endDateTime).toLocaleString()}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Passengers</td><td style="padding:6px 0;">${tripDetails.passengerCount || '—'}</td></tr>
        </table>

        <h3 style="color:#374151;border-bottom:1px solid #e5e7eb;padding-bottom:6px;margin-top:20px;">👤 Requester (Passenger)</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#6b7280;">Name</td><td style="padding:6px 0;font-weight:600;">${requesterInfo.name}</td></tr>
          ${requesterInfo.phoneNumber ? `<tr><td style="padding:6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;"><a href="tel:${requesterInfo.phoneNumber}" style="color:#1B3D2F;font-weight:700;font-size:16px;">${requesterInfo.phoneNumber}</a></td></tr>` : ''}
          ${requesterInfo.email ? `<tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;">${requesterInfo.email}</td></tr>` : ''}
        </table>

        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px;margin-top:20px;">
          <p style="margin:0;font-size:14px;color:#1e40af;">Please confirm this assignment in the driver app and contact the requester to coordinate pickup time and location.</p>
        </div>

        <hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;">
        <p style="text-align:center;color:#9ca3af;font-size:12px;">Fleet Management System — Haramaya University</p>
      </div>
    `;
    return this.sendEmail({ to, subject: `New Trip Assignment: ${tripDetails.destination} — ${requesterInfo.name}`, html });
  }

  async sendPendingApprovalEmail(
    to: string,
    tripDetails: any,
    requesterName: string,
  ): Promise<boolean> {
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

  async sendTimeoutWarningEmail(
    to: string,
    tripDetails: any,
    hoursRemaining: number,
  ): Promise<boolean> {
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
  async sendMaintenanceRequestEmail(
    to: string,
    maintenanceDetails: any,
    vehicleInfo: any,
  ): Promise<boolean> {
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
  async sendLowFuelAlertEmail(
    to: string,
    vehicleInfo: any,
    fuelLevel: number,
  ): Promise<boolean> {
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
  async sendNotificationEmail(
    to: string,
    title: string,
    message: string,
  ): Promise<boolean> {
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

  // Employee invitation email
  async sendInvitationEmail(options: {
    to: string;
    name: string;
    password: string;
    inviterName: string;
    inviterRole: string;
    department?: string;
    college?: string;
    welcomeMessage?: string;
  }): Promise<boolean> {
    const { to, name, password, inviterName, inviterRole, department, college, welcomeMessage } = options;
    
    const organizationInfo = department 
      ? `${department}${college ? ` (${college})` : ''}`
      : college || 'Haramaya University';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; text-align: center;">Welcome to Fleet Management System</h2>
        
        <p>Dear ${name},</p>
        
        <p>You have been invited to join the Fleet Management System by <strong>${inviterName}</strong> (${inviterRole}) from <strong>${organizationInfo}</strong>.</p>
        
        ${welcomeMessage ? `<div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="margin: 0; font-style: italic;">"${welcomeMessage}"</p></div>` : ''}
        
        <h3 style="color: #374151;">Your Account Details:</h3>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
          <p><strong>Email:</strong> ${to}</p>
          <p><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${password}</code></p>
          <p><strong>Organization:</strong> ${organizationInfo}</p>
        </div>
        
        <h3 style="color: #374151;">Next Steps:</h3>
        <ol style="line-height: 1.6;">
          <li>Log in to the system using your email and temporary password</li>
          <li>Complete your profile information (name, phone number, etc.)</li>
          <li>Change your password to something secure and memorable</li>
          <li>Start submitting trip requests as needed</li>
        </ol>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0;"><strong>⚠️ Security Notice:</strong> Please change your password immediately after your first login for security purposes.</p>
        </div>
        
        <p>If you have any questions or need assistance, please contact your system administrator or the transport office.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="text-align: center; color: #6b7280; font-size: 14px;">
          This is an automated message from Fleet Management System<br>
          Haramaya University
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: 'Welcome to Fleet Management System - Account Created',
      html,
    });
  }
}
