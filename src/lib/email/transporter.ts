import nodemailer from 'nodemailer';
import { getSmtpConfig } from '../config/env';

let cachedTransporter: nodemailer.Transporter | null = null;

export function getSmtpTransporter(): nodemailer.Transporter | null {
  const config = getSmtpConfig();
  if (!config) {
    return null;
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  return cachedTransporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ success: boolean; error?: string }> {
  const transporter = getSmtpTransporter();
  const config = getSmtpConfig();

  if (!transporter || !config) {
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    await transporter.sendMail({
      from: config.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown SMTP error';
    return { success: false, error: message };
  }
}
