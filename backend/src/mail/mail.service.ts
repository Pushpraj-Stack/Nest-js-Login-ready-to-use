import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  async sendOtpEmail(email: string, otp: string, type: 'registration' | 'forgot-password') {
    const subject =
      type === 'registration'
        ? 'Verify Your Email — CG Community'
        : 'Password Reset OTP — CG Community';

    const heading =
      type === 'registration' ? 'Welcome to CG Community! 🎉' : 'Reset Your Password 🔐';

    const message =
      type === 'registration'
        ? 'Use the OTP below to verify your email and complete registration.'
        : 'Use the OTP below to reset your password. Do not share it with anyone.';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${subject}</title>
        </head>
        <body style="margin:0;padding:0;background:#0f0c29;font-family:'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:40px 20px;">
                <table width="560" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:20px;overflow:hidden;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#6c63ff,#302b63);padding:32px 40px;text-align:center;">
                      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;">${heading}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:36px 40px;color:#e0e0e0;">
                      <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">${message}</p>
                      <div style="background:rgba(108,99,255,0.15);border:1px solid rgba(108,99,255,0.4);border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
                        <p style="margin:0 0 8px;font-size:13px;color:#a0a0b8;letter-spacing:2px;text-transform:uppercase;">Your OTP</p>
                        <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:12px;color:#a78bfa;">${otp}</p>
                      </div>
                      <p style="font-size:13px;color:#888;margin:0;">This OTP expires in <strong style="color:#c084fc;">10 minutes</strong>. If you did not request this, please ignore this email.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
                      <p style="margin:0;font-size:12px;color:#666;">© ${new Date().getFullYear()} CG Community. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"CG Community" <${process.env.GMAIL_USER}>`,
        to: email,
        subject,
        html,
      });
      this.logger.log(`OTP email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}`, error);
      throw new Error('Failed to send OTP email. Please try again.');
    }
  }
}
