"use server";

import { SMTPEmailService } from '@/lib/email/smtp';

interface BaseEmailData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

/**
 * GENERIC EMAIL SERVICE - Framework Core
 * SMTP-based email sending (vendor-free)
 * 
 * For domain-specific email templates:
 * - Create your own email templates in your domain module
 * - Use this service to send them
 */
export class EmailService {
  /**
   * Generic email sender via SMTP
   */
  static async send(data: BaseEmailData) {
    try {
      // Use SMTP service instead of Resend
      const result = await SMTPEmailService.send({
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text || data.subject, // Fallback to subject if no text
      });

      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }
  }
}
