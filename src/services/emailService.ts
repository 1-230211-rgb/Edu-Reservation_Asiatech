import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Email Service using Nodemailer (Node.js equivalent of PHPMailer)
 */
export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  let transporter;

  // 1. Check for Gmail (Direct Notification)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });
  }
  // 2. Check for SendGrid (Production)
  else if (process.env.SENDGRID_API_KEY) {
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } 
  // 2. Check for Mailtrap (Development/Testing)
  else if (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
    transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  } 
  // 3. Fallback to Log
  else {
    console.warn('Email Service: No credentials found (SENDGRID_API_KEY or MAILTRAP_USER/PASS). Email not sent.');
    console.log('--- Email Content ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('---------------------');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"EduReserve" <${process.env.ADMIN_EMAIL || 'noreply@edureserve.com'}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email Service Error:', error);
    throw error;
  }
};

/**
 * Professional Email Template Wrapper
 */
export const getEmailTemplate = (title: string, content: string) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    <div style="background-color: #385723; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">EduReserve</h1>
      <p style="color: #d1e7dd; margin: 5px 0 0 0; font-size: 14px;">Asia Technological School of Science and Arts</p>
    </div>
    <div style="padding: 40px; background-color: #ffffff; color: #333333; line-height: 1.6;">
      <h2 style="color: #385723; margin-top: 0; font-size: 20px;">${title}</h2>
      ${content}
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; font-size: 14px; color: #777777;">
        <p>If you have any questions, please contact the school office.</p>
        <p style="margin-bottom: 0;">Best regards,<br><strong>The EduReserve Team</strong></p>
      </div>
    </div>
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
      <p style="margin: 0;">&copy; 2026 Asia Technological School of Science and Arts. All rights reserved.</p>
      <p style="margin: 5px 0 0 0;">This is an automated notification, please do not reply to this email.</p>
    </div>
  </div>
`;
