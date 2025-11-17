import nodemailer from 'nodemailer'

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

      console.log('Email sent:', info.messageId)
      
      // MailHog preview URL (development)
      if (process.env.NODE_ENV === 'development') {
        console.log('Preview URL: http://localhost:8025')
      }

      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }
  }
}
