/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {
  EmailOptions,
  EmailProvider,
  EmailResult,
} from '../interfaces/email-provider.interface';

@Injectable()
export class SmtpProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      const info = await this.transporter.sendMail({
        from:
          options.from ||
          `"${process.env.FROM_NAME || 'Your App'}" <${process.env.FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('SMTP Email sending failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
