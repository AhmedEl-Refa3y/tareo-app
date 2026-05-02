import nodemailer from "nodemailer";
import { logger } from "../utils/logger";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        ...options,
      });
      logger.info(`📧 Email sent to ${options.to}`);
    } catch (error) {
      logger.error("Email sending failed:", error);
      throw new Error("Failed to send email");
    }
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #08B6CE 0%, #0598AB 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">TAREO</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Your AI-Powered Therapeutic Assistant</p>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
            <p style="color: #666; line-height: 1.6;">Thank you for registering with TAREO. Please use the verification code below to complete your registration:</p>
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #08B6CE;">${code}</span>
            </div>
            <p style="color: #666; font-size: 14px;">This code expires in <strong>10 minutes</strong>.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px;">
            <p>&copy; 2026 TAREO. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    await this.sendEmail({
      to: email,
      subject: "TAREO - Email Verification Code",
      html,
    });
  }

  async sendPasswordReset(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.API_URL}/reset-password?token=${resetToken}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #08B6CE 0%, #0598AB 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">TAREO</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Password Reset Request</p>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #666; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #08B6CE 0%, #0598AB 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px;">This link expires in <strong>10 minutes</strong>.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">Or copy and paste this link: ${resetUrl}</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px;">
            <p>&copy; 2026 TAREO. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    await this.sendEmail({
      to: email,
      subject: "TAREO - Password Reset",
      html,
    });
  }

  async sendWelcomeEmail(firstName: string, email: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #08B6CE 0%, #0598AB 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to TAREO!</h1>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-top: 0;">Hello ${firstName},</h2>
            <p style="color: #666; line-height: 1.6;">Thank you for joining TAREO - Your AI-Powered Therapeutic Assistant. We're excited to have you on board!</p>
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #08B6CE; margin-top: 0;">Get started with:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>💬 Text conversations with AI assistant</li>
                <li>🎥 Video sessions for face-to-face support</li>
                <li>📚 Knowledge base for mental health resources</li>
                <li>👨‍⚕️ Connect with professional doctors</li>
              </ul>
            </div>
            <p style="color: #666; line-height: 1.6;">If you have any questions, feel free to contact our support team.</p>
            <p style="color: #666; line-height: 1.6;">Best regards,<br><strong>The TAREO Team</strong></p>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px;">
            <p>&copy; 2026 TAREO. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    await this.sendEmail({ to: email, subject: "Welcome to TAREO! 🎉", html });
  }
}

export default new EmailService();
