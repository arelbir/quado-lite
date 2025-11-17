import { env } from "@/env";
import { Resend } from 'resend';
import { MagicLinkEmail } from "../templates/magic-link-email";

const resend = new Resend(process.env.RESEND_API_KEY);
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
  if (env.NODE_ENV === "development") {
    return { success: "Please check your email for the confirmation link.", link: confirmLink }
  }
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject,
    react: <MagicLinkEmail magicLink={confirmLink} previewTitle={subject} />
  });
  if (error) {
    console.log(error)
    return { error: "Email server error" }
  }
  return { success: "Please check your email for the confirmation link." }

};


export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<{ success?: string, error?: string, link?: string }> {
  const resetLink = `${domain}/new-password?token=${token}`

  const subject = "Reset your password";
  if (env.NODE_ENV === "development") {
    return { success: "Please check your email for the confirmation link.", link: resetLink }
  }
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject,
    react: <MagicLinkEmail magicLink={resetLink} previewTitle={subject} />
  });

  if (error) {
    console.log(error)
    return { error: "Email server error" }
  }
  return { success: "Reset email sent!" }
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
  if (env.NODE_ENV === "development") {
    return { success: "Please register using this link.", link: confirmLink}
  }
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject,
    react: <MagicLinkEmail magicLink={confirmLink} previewTitle={subject} />
  });
  if (error) {
    return { error: "Email server error" }
  }
  return { success: "Register email sent!" }

}

