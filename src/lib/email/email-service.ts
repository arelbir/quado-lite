/**
 * EMAIL SERVICE
 * Unified email sending service with templates
 * Supports Nodemailer (SMTP) and Resend
 */

import nodemailer from 'nodemailer';

// Email configuration from environment
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Quado Lite',
    address: process.env.EMAIL_FROM_ADDRESS || 'noreply@quado.app',
  },
};

// Create transporter (lazy initialization)
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      secure: EMAIL_CONFIG.secure,
      auth: EMAIL_CONFIG.auth,
    });
  }
  return transporter;
}

/**
 * Send email
 */
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Check if email is configured
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      console.warn('[Email] SMTP not configured, skipping email send');
      return { success: false, error: 'SMTP not configured' };
    }

    const transport = getTransporter();

    const result = await transport.sendMail({
      from: `"${EMAIL_CONFIG.from.name}" <${EMAIL_CONFIG.from.address}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error('[Email] Send error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send bulk emails (batch processing)
 */
export async function sendBulkEmails(
  emails: Array<{
    to: string;
    subject: string;
    html: string;
    text?: string;
  }>
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const email of emails) {
    const result = await sendEmail(email);
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
    
    // Rate limiting: wait 100ms between emails
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { sent, failed };
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      return false;
    }

    const transport = getTransporter();
    await transport.verify();
    return true;
  } catch (error) {
    console.error('[Email] Verification failed:', error);
    return false;
  }
}
