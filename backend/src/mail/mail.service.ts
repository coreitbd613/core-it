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
        <p style="margin:0 0 16px;font-size:16px;color:#18181b;">Hi ${escapeHtml(name ?? "there")},</p>
        <p style="margin:0 0 24px;">Confirm your email address to finish setting up your Core IT account.</p>
        ${this.button('Verify email', link)}
        <p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;">This link expires in 24 hours. If you didn't request this, you can safely ignore this email.</p>
        ${this.fallbackLink(link)}
      `),
    });
  }

  async sendPasswordResetEmail(to: string, name: string | null, rawToken: string) {
    const link = `${this.frontendUrl}/reset-password?token=${rawToken}`;
    await this.send({
      to,
      subject: 'Reset your password',
      html: this.wrap(`
        <p style="margin:0 0 16px;font-size:16px;color:#18181b;">Hi ${escapeHtml(name ?? "there")},</p>
        <p style="margin:0 0 24px;">We received a request to reset your Core IT password.</p>
        ${this.button('Reset password', link)}
        <p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        ${this.fallbackLink(link)}
      `),
    });
  }

  private button(label: string, href: string): string {
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0;">
        <tr>
          <td style="border-radius:8px;background-color:#FD6005;">
            <a href="${href}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${label}</a>
          </td>
        </tr>
      </table>`;
  }

  private fallbackLink(link: string): string {
    return `<p style="margin:16px 0 0;font-size:13px;color:#a1a1aa;word-break:break-all;">Or paste this link into your browser: <a href="${link}" style="color:#FD6005;">${link}</a></p>`;
  }

  private wrap(bodyHtml: string): string {
    return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f4f4f5;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;border:1px solid #e4e4e7;">
            <tr>
              <td style="padding:28px 32px;text-align:center;border-bottom:1px solid #f0f0f1;">
                <img src="${this.frontendUrl}/logo-light.png" alt="Core IT" width="140" style="display:inline-block;height:auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:32px;font-size:15px;line-height:1.6;color:#3f3f46;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#fafafa;text-align:center;border-top:1px solid #f0f0f1;border-radius:0 0 12px 12px;">
                <p style="margin:0;font-size:12px;color:#a1a1aa;">&copy; ${new Date().getFullYear()} Core IT. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
