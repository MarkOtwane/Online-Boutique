/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { EmailProvider } from './interfaces/email-provider.interface';
import { EmailJobData, EmailQueue } from './queues/email.queue';

export interface EmailTemplateData {
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(
    @Inject('EmailProvider') private readonly emailProvider: EmailProvider,
    private readonly emailQueue: EmailQueue,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.loadTemplates();
  }

  private loadTemplates() {
    const templatesDir = path.join(__dirname, 'templates');

    if (!fs.existsSync(templatesDir)) {
      this.logger.warn(
        'Templates directory not found, skipping template loading',
      );
      return;
    }

    const templateFiles = fs
      .readdirSync(templatesDir)
      .filter((file) => file.endsWith('.html'));

    for (const file of templateFiles) {
      const templateName = file.replace('.html', '');
      const templatePath = path.join(templatesDir, file);
      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const compiledTemplate = handlebars.compile(templateContent);
      this.templates.set(templateName, compiledTemplate);
      this.logger.log(`Loaded email template: ${templateName}`);
    }
  }

  async sendEmail(options: {
    to: string;
    template: string;
    context?: Record<string, any>;
    from?: string;
    priority?: 'low' | 'normal' | 'high';
  }): Promise<void> {
    try {
      const template = this.templates.get(options.template);
      if (!template) {
        throw new Error(`Email template '${options.template}' not found`);
      }

      const html = template(options.context || {});
      const subject =
        this.extractSubjectFromHtml(html) ||
        `Notification from ${this.configService.get('FROM_NAME', 'Your App')}`;

      const emailData: EmailJobData = {
        to: options.to,
        subject,
        html,
        from: options.from,
      };

      // Log email attempt
      await this.prisma.emailLog.create({
        data: {
          to: options.to,
          subject,
          template: options.template,
          status: 'PENDING',
          provider: 'smtp',
        },
      });

      // Queue email for sending
      await this.emailQueue.addEmailJob(emailData);

      this.logger.log(
        `Email queued for ${options.to} using template ${options.template}`,
      );
    } catch (error) {
      this.logger.error(`Failed to queue email: ${error.message}`, error.stack);
      throw error;
    }
  }

  private extractSubjectFromHtml(html: string): string | null {
    const subjectMatch = html.match(/<title>(.*?)<\/title>/i);
    return subjectMatch ? subjectMatch[1].trim() : null;
  }

  // Pre-built email methods for common use cases
  async sendOrderConfirmation(
    orderId: number,
    customerEmail: string,
    orderData: any,
  ): Promise<void> {
    await this.sendEmail({
      to: customerEmail,
      template: 'order-confirmation',
      context: { orderId, ...orderData },
    });
  }

  async sendPaymentReceipt(
    orderId: number,
    customerEmail: string,
    paymentData: any,
  ): Promise<void> {
    await this.sendEmail({
      to: customerEmail,
      template: 'payment-receipt',
      context: { orderId, ...paymentData },
    });
  }

  async sendShippingUpdate(
    orderId: number,
    customerEmail: string,
    trackingData: any,
  ): Promise<void> {
    await this.sendEmail({
      to: customerEmail,
      template: 'shipping-update',
      context: { orderId, ...trackingData },
    });
  }

  async sendPasswordReset(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:4200')}/reset-password?token=${resetToken}`;

    await this.sendEmail({
      to: email,
      template: 'password-reset',
      context: { resetUrl },
    });
  }

  async sendAccountVerification(
    email: string,
    verificationToken: string,
  ): Promise<void> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:4200')}/verify-email?token=${verificationToken}`;

    await this.sendEmail({
      to: email,
      template: 'account-verification',
      context: { verificationUrl },
    });
  }

  // Admin methods
  async getEmailLogs(options?: {
    status?: string;
    template?: string;
    limit?: number;
    offset?: number;
  }) {
    const { status, template, limit = 50, offset = 0 } = options || {};

    return this.prisma.emailLog.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(template && { template }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getEmailStats() {
    const stats = await this.prisma.emailLog.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return stats.reduce(
      (acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
