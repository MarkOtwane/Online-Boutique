import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  template?: string;
  context?: Record<string, any>;
}

@Injectable()
export class EmailQueue {
  constructor(
    @InjectQueue('email')
    private readonly emailQueue: Queue<EmailJobData>,
  ) {}

  async addEmailJob(data: EmailJobData, delay?: number) {
    const jobOptions = delay ? { delay } : {};
    return this.emailQueue.add('send-email', data, jobOptions);
  }

  async addBulkEmails(jobs: EmailJobData[]) {
    const bulkJobs = jobs.map((data) => ({
      name: 'send-email',
      data,
    }));
    return this.emailQueue.addBulk(bulkJobs);
  }
}
