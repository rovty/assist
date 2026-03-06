import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { createLogger } from '@assist/shared-utils';
import type { EmailPayload } from '@assist/shared-types';
import { env } from '../env.js';

const logger = createLogger('email-service');

let transporter: Transporter;

export function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      ...(env.SMTP_USER && env.SMTP_PASS
        ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } }
        : {}),
    });
  }
  return transporter;
}

export async function verifySmtp(): Promise<boolean> {
  try {
    await getTransporter().verify();
    return true;
  } catch (err) {
    logger.warn({ err }, 'SMTP connection verification failed');
    return false;
  }
}

export async function sendEmail(payload: EmailPayload): Promise<{ messageId: string }> {
  const transport = getTransporter();

  const info = await transport.sendMail({
    from: payload.from ?? env.SMTP_FROM,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo,
  });

  logger.info({ messageId: info.messageId, to: payload.to }, 'Email sent');
  return { messageId: info.messageId };
}

// ─── Email Templates ───

export function conversationAssignedEmail(data: {
  agentName: string;
  conversationId: string;
  contactName: string;
  dashboardUrl: string;
}): EmailPayload {
  return {
    to: '', // caller sets this
    subject: `New conversation assigned: ${data.contactName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">Conversation Assigned</h2>
        <p>Hi ${data.agentName},</p>
        <p>A conversation with <strong>${data.contactName}</strong> has been assigned to you.</p>
        <p>
          <a href="${data.dashboardUrl}/conversations/${data.conversationId}"
             style="display: inline-block; padding: 10px 20px; background: #2563EB; color: #fff; text-decoration: none; border-radius: 6px;">
            Open Conversation
          </a>
        </p>
        <p style="color: #6B7280; font-size: 12px;">— Assist Platform</p>
      </div>
    `,
    text: `Hi ${data.agentName}, a conversation with ${data.contactName} has been assigned to you. Open it at ${data.dashboardUrl}/conversations/${data.conversationId}`,
  };
}

export function conversationEscalatedEmail(data: {
  agentName: string;
  conversationId: string;
  contactName: string;
  reason: string;
  dashboardUrl: string;
}): EmailPayload {
  return {
    to: '',
    subject: `⚠️ Escalation: ${data.contactName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">Conversation Escalated</h2>
        <p>Hi ${data.agentName},</p>
        <p>A conversation with <strong>${data.contactName}</strong> requires your attention.</p>
        <p><strong>Reason:</strong> ${data.reason}</p>
        <p>
          <a href="${data.dashboardUrl}/conversations/${data.conversationId}"
             style="display: inline-block; padding: 10px 20px; background: #DC2626; color: #fff; text-decoration: none; border-radius: 6px;">
            Review Now
          </a>
        </p>
        <p style="color: #6B7280; font-size: 12px;">— Assist Platform</p>
      </div>
    `,
    text: `Hi ${data.agentName}, a conversation with ${data.contactName} has been escalated. Reason: ${data.reason}. Review at ${data.dashboardUrl}/conversations/${data.conversationId}`,
  };
}

export function invitationEmail(data: {
  inviterName: string;
  tenantName: string;
  inviteUrl: string;
}): EmailPayload {
  return {
    to: '',
    subject: `You're invited to join ${data.tenantName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">You're Invited!</h2>
        <p>${data.inviterName} has invited you to join <strong>${data.tenantName}</strong> on Assist.</p>
        <p>
          <a href="${data.inviteUrl}"
             style="display: inline-block; padding: 10px 20px; background: #2563EB; color: #fff; text-decoration: none; border-radius: 6px;">
            Accept Invitation
          </a>
        </p>
        <p style="color: #6B7280; font-size: 12px;">If you didn't expect this invitation, you can ignore this email.</p>
      </div>
    `,
    text: `${data.inviterName} has invited you to join ${data.tenantName} on Assist. Accept at: ${data.inviteUrl}`,
  };
}
