import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { NOTIFICATIONS_QUEUE, type NotificationJobData } from './queue.constants';

/**
 * Background worker that handles outbound notifications for service requests.
 * Swap the body for real email/SMS/push delivery when integrating providers.
 */
@Processor(NOTIFICATIONS_QUEUE)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  async process(job: Job<NotificationJobData>): Promise<void> {
    const { type, requestId, message } = job.data;
    this.logger.log(`[${type}] request=${requestId} :: ${message}`);
    // TODO: integrate email / SMS / push provider here.
  }
}
