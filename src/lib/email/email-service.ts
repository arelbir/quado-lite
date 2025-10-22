"use server";

import { Resend } from 'resend';
import { render } from '@react-email/components';
import { FindingAssignedEmail } from '@/emails/finding-assigned';
import { ActionAssignedEmail } from '@/emails/action-assigned';
import { ActionApprovedEmail } from '@/emails/action-approved';
import { DofAssignedEmail } from '@/emails/dof-assigned';
import { PlanCreatedEmail } from '@/emails/plan-created';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BaseEmailData {
  to: string;
  subject: string;
}

/**
 * Email Service - Ortak Modül
 * Tüm email gönderimi için kullanılır
 */
export class EmailService {
  /**
   * Finding atandı emaili
   */
  static async sendFindingAssigned(data: {
    to: string;
    userName: string;
    findingDetails: string;
    auditTitle: string;
    riskType?: string;
    findingId: string;
  }) {
    try {
      const actionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/denetim/findings/${data.findingId}`;
      
      const html = render(
        FindingAssignedEmail({
          userName: data.userName,
          findingDetails: data.findingDetails,
          auditTitle: data.auditTitle,
          riskType: data.riskType,
          actionUrl,
        })
      );

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Denetim Sistemi <noreply@denetim.com>',
        to: data.to,
        subject: `Yeni Bulgu Atandı: ${data.auditTitle}`,
        html,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending finding assigned email:', error);
      return { success: false, error };
    }
  }

  /**
   * Aksiyon atandı emaili
   */
  static async sendActionAssigned(data: {
    to: string;
    userName: string;
    actionDetails: string;
    findingDetails: string;
    managerName: string;
    actionId: string;
    findingId: string;
  }) {
    try {
      const actionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/denetim/findings/${data.findingId}`;
      
      const html = render(
        ActionAssignedEmail({
          userName: data.userName,
          actionDetails: data.actionDetails,
          findingDetails: data.findingDetails,
          managerName: data.managerName,
          actionUrl,
        })
      );

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Denetim Sistemi <noreply@denetim.com>',
        to: data.to,
        subject: 'Yeni Aksiyon Atandı',
        html,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending action assigned email:', error);
      return { success: false, error };
    }
  }

  /**
   * Aksiyon onaylandı emaili
   */
  static async sendActionApproved(data: {
    to: string;
    userName: string;
    actionDetails: string;
    managerName: string;
    findingId: string;
  }) {
    try {
      const actionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/denetim/findings/${data.findingId}`;
      
      const html = render(
        ActionApprovedEmail({
          userName: data.userName,
          actionDetails: data.actionDetails,
          managerName: data.managerName,
          actionUrl,
        })
      );

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Denetim Sistemi <noreply@denetim.com>',
        to: data.to,
        subject: '✅ Aksiyonunuz Onaylandı',
        html,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending action approved email:', error);
      return { success: false, error };
    }
  }

  /**
   * DÖF atandı emaili
   */
  static async sendDofAssigned(data: {
    to: string;
    userName: string;
    dofTitle: string;
    problemDetails: string;
    managerName: string;
    findingId: string;
  }) {
    try {
      const actionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/denetim/findings/${data.findingId}`;
      
      const html = render(
        DofAssignedEmail({
          userName: data.userName,
          dofTitle: data.dofTitle,
          problemDetails: data.problemDetails,
          managerName: data.managerName,
          actionUrl,
        })
      );

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Denetim Sistemi <noreply@denetim.com>',
        to: data.to,
        subject: `Yeni DÖF Atandı: ${data.dofTitle}`,
        html,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending DOF assigned email:', error);
      return { success: false, error };
    }
  }

  /**
   * Plan oluşturuldu emaili
   */
  static async sendPlanCreated(data: {
    to: string;
    userName: string;
    auditTitle: string;
    scheduledDate: string;
    templateName: string;
    auditId: string;
  }) {
    try {
      const actionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/denetim/audits/${data.auditId}`;
      
      const html = render(
        PlanCreatedEmail({
          userName: data.userName,
          auditTitle: data.auditTitle,
          scheduledDate: data.scheduledDate,
          templateName: data.templateName,
          actionUrl,
        })
      );

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Denetim Sistemi <noreply@denetim.com>',
        to: data.to,
        subject: `Planlı Denetim Oluşturuldu: ${data.auditTitle}`,
        html,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending plan created email:', error);
      return { success: false, error };
    }
  }
}
