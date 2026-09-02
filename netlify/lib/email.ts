import nodemailer from "nodemailer";
import { env } from "./env";

let _transport: nodemailer.Transporter | null = null;

function transport(): nodemailer.Transporter {
  if (!_transport) {
    _transport = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return _transport;
}

export interface OrderMail {
  subject: string;
  text: string;
  cc?: string[];
  pdf: Buffer;
  pdfFilename: string;
}

/**
 * Sends the order email with the PDF attached. Returns `{ ok }`; never throws,
 * so a mail outage cannot lose an order that is already persisted.
 */
export async function sendOrderEmail(mail: OrderMail): Promise<{ ok: boolean; error: string | null }> {
  if (!env.emailConfigured) {
    return { ok: false, error: "SMTP is not configured (missing SMTP_USER / SMTP_PASS)" };
  }
  const to = env.orderEmailTo;
  if (to.length === 0) {
    return { ok: false, error: "ORDER_EMAIL_TO is empty" };
  }
  try {
    await transport().sendMail({
      from: env.smtp.from,
      to,
      cc: mail.cc && mail.cc.length ? mail.cc : undefined,
      subject: mail.subject,
      text: mail.text,
      attachments: [{ filename: mail.pdfFilename, content: mail.pdf, contentType: "application/pdf" }],
    });
    return { ok: true, error: null };
  } catch (err) {
    console.error("sendOrderEmail failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown email error" };
  }
}
