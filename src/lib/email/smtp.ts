import nodemailer from 'nodemailer'
import { log } from '@/lib/monitoring/logger'
import { handleError } from '@/lib/monitoring/error-handler'

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      }
    : undefined,
})

export class SMTPEmailService {
  static async send({
    to,
    subject,
    html,
    text,
  }: {
    to: string | string[]
    subject: string
    html?: string
    text?: string
  }) {
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@quado.local',
        to,
        subject,
        html,
        text: text || (html ? undefined : subject),
      })

      log.info('Email sent successfully', {
        messageId: info.messageId,
        to,
        subject,
      });
      
      // MailHog preview URL (development)
      if (process.env.NODE_ENV === 'development') {
        log.debug('MailHog preview available', { url: 'http://localhost:8025' });
      }

      return { success: true, messageId: info.messageId }
    } catch (error) {
      handleError(error as Error, {
        context: 'smtp-send-email',
        to,
        subject,
      });
      return { success: false, error }
    }
  }
}
