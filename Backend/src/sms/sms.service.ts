import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string;
  private readonly sender: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BREVO_API_KEY', '');
    this.sender = this.configService.get<string>('SMS_SENDER_NAME', 'FleetMgmt');
    this.enabled = !!this.apiKey;
    if (!this.enabled) {
      this.logger.warn('SMS disabled — set BREVO_API_KEY to enable');
    }
  }

  /**
   * Send a single SMS via Brevo Transactional SMS API.
   * @param to  Phone number in E.164 format e.g. +251912345678
   * @param message  Plain text message (max 160 chars per segment)
   */
  async sendSms(to: string, message: string): Promise<boolean> {
    if (!this.enabled) return false;
    if (!to?.trim()) return false;

    // Normalise number — strip spaces/dashes
    const phone = to.replace(/[\s\-()]/g, '');

    try {
      const res = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: this.sender,
          recipient: phone,
          content: message,
          type: 'transactional',
        }),
      });

      if (res.ok) {
        const data = await res.json() as any;
        this.logger.log(`SMS sent to ${phone} — messageId: ${data?.messageId ?? 'n/a'}`);
        return true;
      } else {
        const err = await res.text();
        this.logger.error(`SMS failed (${res.status}): ${err.slice(0, 200)}`);
        return false;
      }
    } catch (error: any) {
      this.logger.error(`SMS error: ${error?.message}`);
      return false;
    }
  }

  // ── Convenience templates ────────────────────────────────────────────────

  async sendTripAllocatedSms(phone: string, plateNumber: string, driverName: string, destination: string): Promise<boolean> {
    return this.sendSms(phone,
      `Fleet: Your trip to ${destination} is ready. Vehicle: ${plateNumber}. Driver: ${driverName}. Safe travels!`
    );
  }

  async sendTripApprovedSms(phone: string, destination: string): Promise<boolean> {
    return this.sendSms(phone,
      `Fleet: Your trip request to ${destination} has been approved and is progressing through the workflow.`
    );
  }

  async sendTripRejectedSms(phone: string, destination: string, reason: string): Promise<boolean> {
    return this.sendSms(phone,
      `Fleet: Your trip request to ${destination} was rejected. Reason: ${reason.slice(0, 80)}`
    );
  }

  async sendGeofenceWarningSms(phone: string, plateNumber: string, zoneName: string): Promise<boolean> {
    return this.sendSms(phone,
      `⚠️ Fleet Alert: Vehicle ${plateNumber} is approaching restricted zone "${zoneName}". Engine shutdown will trigger if it enters.`
    );
  }

  async sendGeofenceShutdownSms(phone: string, plateNumber: string, zoneName: string): Promise<boolean> {
    return this.sendSms(phone,
      `🚨 Fleet Alert: Vehicle ${plateNumber} entered restricted zone "${zoneName}". Engine shutdown triggered. Leave immediately.`
    );
  }

  async sendInvitationSms(phone: string, name: string, password: string): Promise<boolean> {
    return this.sendSms(phone,
      `Fleet: Hi ${name}, your account is ready. Temp password: ${password}. Login and change it immediately.`
    );
  }

  async sendApprovalRequiredSms(phone: string, requesterName: string, destination: string): Promise<boolean> {
    return this.sendSms(phone,
      `Fleet: Trip approval needed from ${requesterName} to ${destination}. Please review in the system.`
    );
  }
}
