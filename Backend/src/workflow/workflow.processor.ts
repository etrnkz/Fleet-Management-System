import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { WorkflowService } from './workflow.service';

@Processor('workflow')
export class WorkflowProcessor {
  private readonly logger = new Logger(WorkflowProcessor.name);

  constructor(private readonly workflowService: WorkflowService) {}

  @Process('check-timeout')
  async handleTimeout(job: Job<{ tripId: string }>) {
    this.logger.log(`Processing timeout check for trip: ${job.data.tripId}`);

    try {
      await this.workflowService.handleTimeout(job.data.tripId);
      this.logger.log(`Timeout check completed for trip: ${job.data.tripId}`);
    } catch (error) {
      this.logger.error(
        `Error processing timeout for trip ${job.data.tripId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process('timeout-warning')
  async handleTimeoutWarning(job: Job<{ tripId: string }>) {
    this.logger.log(`Processing timeout warning for trip: ${job.data.tripId}`);

    try {
      await this.workflowService.handleTimeoutWarning(job.data.tripId);
      this.logger.log(`Timeout warning sent for trip: ${job.data.tripId}`);
    } catch (error) {
      this.logger.error(
        `Error sending timeout warning for trip ${job.data.tripId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
