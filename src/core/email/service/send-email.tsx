import { env } from "@/env";
import { SMTPEmailService } from '@/lib/email/smtp';
import { render } from '@react-email/render';
import { MagicLinkEmail } from "../templates/magic-link-email";

const domain = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendVerificationEmail(
  {
    token,
    email,
    verificationPath = "new-verification"
  }: {
    email: string,
    token: string,
    verificationPath?: string
  },
): Promise<{ success?: string, error?: string, link?: string }> {
  const confirmLink = `${domain}/${verificationPath}?token=${token}`;

  const subject = "Confirm your email";
  
  // Development: Return link directly
  if (env.NODE_ENV === "development") {
    console.log('📧 [DEV] Verification Email:', confirmLink);
    return { success: "Please check your email for the confirmation link.", link: confirmLink }
  }

  // Production: Send via SMTP
  try {
    const html = render(<MagicLinkEmail magicLink={confirmLink} previewTitle={subject} />);
    
    const result = await SMTPEmailService.send({
      to: email,
      subject,
      html,
    });

    if (!result.success) {
      console.error('Email send error:', result.error);
      return { error: "Email server error" }
    }
    
    return { success: "Please check your email for the confirmation link." }
  } catch (error) {
    console.error('Email error:', error);
    return { error: "Email server error" }
  }
};


export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<{ success?: string, error?: string, link?: string }> {
  const resetLink = `${domain}/new-password?token=${token}`

  const subject = "Reset your password";
  
  // Development: Return link directly
  if (env.NODE_ENV === "development") {
    console.log('📧 [DEV] Password Reset Email:', resetLink);
    return { success: "Please check your email for the confirmation link.", link: resetLink }
  }

  // Production: Send via SMTP
  try {
    const html = render(<MagicLinkEmail magicLink={resetLink} previewTitle={subject} />);
    
    const result = await SMTPEmailService.send({
      to: email,
      subject,
      html,
    });

    if (!result.success) {
      console.error('Email send error:', result.error);
      return { error: "Email server error" }
    }
    
    return { success: "Reset email sent!" }
  } catch (error) {
    console.error('Email error:', error);
    return { error: "Email server error" }
  }
};

export async function sendRegisterEmail({
  email,
  token,
}: {
  email: string,
  token: string,
}): Promise<{ success?: string, error?: string, link?: string }> {
  const confirmLink = `${domain}/register?token=${token}`;

  const subject = "Register confirmation";
  
  // Development: Return link directly
  if (env.NODE_ENV === "development") {
    console.log('📧 [DEV] Register Email:', confirmLink);
    return { success: "Please register using this link.", link: confirmLink}
  }

  // Production: Send via SMTP
  try {
    const html = render(<MagicLinkEmail magicLink={confirmLink} previewTitle={subject} />);
    
    const result = await SMTPEmailService.send({
      to: email,
      subject,
      html,
    });

    if (!result.success) {
      console.error('Email send error:', result.error);
      return { error: "Email server error" }
    }
    
    return { success: "Register email sent!" }
  } catch (error) {
    console.error('Email error:', error);
    return { error: "Email server error" }
  }
}

