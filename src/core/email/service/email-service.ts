"use server";

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BaseEmailData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

/**
 * GENERIC EMAIL SERVICE - Framework Core
 * Basic email sending functionality
 * 
 * For domain-specific email templates:
 * - Create your own email templates in your domain module
 * - Use this service to send them
 */
export class EmailService {
  /**
   * Generic email sender
   */
  static async send(data: BaseEmailData) {
    try {
      const emailPayload: any = {
        from: process.env.SMTP_FROM || 'Enterprise Framework <noreply@framework.com>',
        to: data.to,
        subject: data.subject,
      };

      if (data.html) emailPayload.html = data.html;
      if (data.text) emailPayload.text = data.text;

      // Fallback: if neither html nor text provided, use subject as text
      if (!data.html && !data.text) {
        emailPayload.text = data.subject;
      }

      await resend.emails.send(emailPayload);

      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }
  }
}
