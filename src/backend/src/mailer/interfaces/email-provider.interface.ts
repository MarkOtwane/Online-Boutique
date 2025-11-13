export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<EmailResult>;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}
