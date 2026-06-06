import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from './logger';
import { EMAIL } from '../config/constants';

// Lazily initialise Resend only if the key is present
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

/**
 * Core email sender — uses Resend if API key is configured,
 * otherwise logs the email (graceful degradation for local dev).
 */
const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  if (!resend) {
    logger.warn('RESEND_API_KEY not set — email not sent', {
      to: options.to,
      subject: options.subject,
    });
    return;
  }

  const { error } = await resend.emails.send({
    from: `${EMAIL.FROM_NAME} <${env.EMAIL_FROM}>`,
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    logger.error('Failed to send email via Resend', { error, to: options.to });
    throw new Error(`Email send failed: ${error.message}`);
  }
};

// ── Email templates ───────────────────────────────────────────────────────────

/**
 * Sends a password reset email with a tokenised link.
 * @param to - Recipient email address
 * @param resetToken - The raw reset token (not hashed)
 * @param frontendUrl - Base URL of the React frontend
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  frontendUrl: string
): Promise<void> => {
  const link = `${frontendUrl}/reset-password?token=${resetToken}`;
  await sendEmail({
    to,
    subject: EMAIL.SUBJECTS.PASSWORD_RESET,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1e293b">Reset your password</h2>
        <p>You requested a password reset for your VendorBridge account.</p>
        <p>Click the link below to reset your password. It expires in 1 hour.</p>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">Reset Password</a>
        <p style="color:#64748b;font-size:13px;margin-top:24px">If you did not request this, ignore this email.</p>
      </div>
    `,
  });
};

/**
 * Sends an RFQ invitation email to a vendor.
 * @param to - Vendor email address
 * @param vendorName - Vendor company name
 * @param rfqNumber - The RFQ reference number
 * @param rfqTitle - Title of the RFQ
 * @param deadline - Submission deadline
 * @param frontendUrl - Base URL of the React frontend
 */
export const sendRFQInviteEmail = async (
  to: string,
  vendorName: string,
  rfqNumber: string,
  rfqTitle: string,
  deadline: Date | null,
  frontendUrl: string
): Promise<void> => {
  const link = `${frontendUrl}/rfqs/${rfqNumber}`;
  const deadlineStr = deadline
    ? deadline.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'No deadline specified';

  await sendEmail({
    to,
    subject: `${EMAIL.SUBJECTS.RFQ_INVITE} — ${rfqNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1e293b">RFQ Invitation: ${rfqNumber}</h2>
        <p>Dear <strong>${vendorName}</strong>,</p>
        <p>You have been invited to submit a quotation for the following RFQ:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#64748b">RFQ Number</td><td style="padding:8px;font-weight:600">${rfqNumber}</td></tr>
          <tr><td style="padding:8px;color:#64748b">Title</td><td style="padding:8px">${rfqTitle}</td></tr>
          <tr><td style="padding:8px;color:#64748b">Deadline</td><td style="padding:8px">${deadlineStr}</td></tr>
        </table>
        <a href="${link}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">View RFQ &amp; Submit Quotation</a>
      </div>
    `,
  });
};

/**
 * Sends an invoice email to the procurement team or buyer.
 * @param to - Recipient email address(es)
 * @param invoiceNumber - The INV reference number
 * @param vendorName - Name of the issuing vendor
 * @param totalAmount - Grand total as a string
 * @param pdfUrl - URL to the hosted PDF (optional)
 */
export const sendInvoiceEmail = async (
  to: string | string[],
  invoiceNumber: string,
  vendorName: string,
  totalAmount: string,
  pdfUrl?: string
): Promise<void> => {
  const pdfLink = pdfUrl
    ? `<p><a href="${pdfUrl}" style="color:#6366f1">Download Invoice PDF</a></p>`
    : '';

  await sendEmail({
    to,
    subject: `${EMAIL.SUBJECTS.INVOICE} — ${invoiceNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#1e293b">Invoice: ${invoiceNumber}</h2>
        <p>You have received an invoice from <strong>${vendorName}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#64748b">Invoice #</td><td style="padding:8px;font-weight:600">${invoiceNumber}</td></tr>
          <tr><td style="padding:8px;color:#64748b">From</td><td style="padding:8px">${vendorName}</td></tr>
          <tr><td style="padding:8px;color:#64748b">Total Amount</td><td style="padding:8px;font-weight:600">₹${totalAmount}</td></tr>
        </table>
        ${pdfLink}
      </div>
    `,
  });
};

/**
 * Sends an account approval email to a vendor.
 * @param to - Vendor email address
 * @param vendorName - Vendor company name
 * @param frontendUrl - Base URL of the React frontend
 */
export const sendVendorApprovedEmail = async (
  to: string,
  vendorName: string,
  frontendUrl: string
): Promise<void> => {
  await sendEmail({
    to,
    subject: EMAIL.SUBJECTS.VENDOR_APPROVED,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#16a34a">Your account has been approved!</h2>
        <p>Congratulations <strong>${vendorName}</strong> — your VendorBridge vendor account has been approved.</p>
        <p>You can now log in and start submitting quotations.</p>
        <a href="${frontendUrl}/login" style="display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">Log In Now</a>
      </div>
    `,
  });
};
