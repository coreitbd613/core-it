import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from = this.configService.get<string>(
      'MAIL_FROM',
      'Core IT <onboarding@resend.dev>',
    );
    this.frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }

  async sendVerificationEmail(to: string, name: string | null, rawToken: string) {
    const link = `${this.frontendUrl}/verify-email?token=${rawToken}`;
    await this.send({
      to,
      subject: 'Verify your email',
      html: this.wrap(`
        <p>Hi ${escapeHtml(name ?? "there")},</p>
        <p>Confirm your email address to finish setting up your Core IT account.</p>
        <p><a href="${link}" style="color:#FD6005">Verify email</a></p>
        <p>This link expires in 24 hours. If you didn't request this, you can ignore this email.</p>
      `),
    });
  }

  async sendPasswordResetEmail(to: string, name: string | null, rawToken: string) {
    const link = `${this.frontendUrl}/reset-password?token=${rawToken}`;
    await this.send({
      to,
      subject: 'Reset your password',
      html: this.wrap(`
        <p>Hi ${escapeHtml(name ?? "there")},</p>
        <p>We received a request to reset your Core IT password.</p>
        <p><a href="${link}" style="color:#FD6005">Reset password</a></p>
        <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
      `),
    });
  }

  private wrap(bodyHtml: string): string {
    return `<div style="font-family:sans-serif;font-size:14px;color:#111">${bodyHtml}</div>`;
  }

  private async send(input: { to: string; subject: string; html: string }) {
    if (!this.resend) {
      this.logger.warn(
        `RESEND_API_KEY is not set; skipped sending "${input.subject}" to ${input.to}`,
      );
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });

    if (error) {
      this.logger.error(`Failed to send "${input.subject}" to ${input.to}: ${error.message}`);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
