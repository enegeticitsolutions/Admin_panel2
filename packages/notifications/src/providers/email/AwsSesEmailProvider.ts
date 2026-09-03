import nodemailer from 'nodemailer';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { IEmailProvider, EmailMessage, EmailSendResponse } from '../../interfaces/IEmailProvider';

export class AwsSesEmailProvider implements IEmailProvider {
  readonly name = 'aws-ses';
  private transporter: nodemailer.Transporter | null = null;
  private defaultFrom: string;

  constructor() {
    const fromName = process.env.AWS_SES_FROM_NAME || 'MaiHoonNa Care';
    const fromEmail = process.env.AWS_SES_FROM_EMAIL || process.env.EMAIL_USER || 'info@maihoonna.com';
    this.defaultFrom = `"${fromName}" <${fromEmail}>`;
    this.initTransporter();
  }

  private initTransporter() {
    const accessKeyId = process.env.AWS_SES_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SES_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_SES_REGION || process.env.AWS_REGION || 'ap-south-1';

    // 1. If AWS SES credentials are provided, use AWS SES SDK v3
    if (accessKeyId && secretAccessKey) {
      try {
        const ses = new SESClient({
          region,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });

        this.transporter = nodemailer.createTransport({
          SES: { ses, aws: { SendRawEmailCommand } },
        } as any);

        console.log(`[AwsSesEmailProvider] Initialized with AWS SES (${region})`);
        return;
      } catch (err: any) {
        console.error('[AwsSesEmailProvider] Failed to initialize AWS SES transport:', err.message);
      }
    }

    // 2. Fallback to SMTP (e.g. Zoho smtppro.zoho.in)
    const host = process.env.EMAIL_HOST;
    const port = Number(process.env.EMAIL_PORT) || 465;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      console.log(`[AwsSesEmailProvider] Using SMTP fallback (${host}:${port})`);
      return;
    }

    console.warn('[AwsSesEmailProvider] No AWS SES keys or SMTP configuration found. Emails will run in dry-run mode.');
  }

  async send(message: EmailMessage): Promise<EmailSendResponse> {
    if (!this.transporter) {
      // Re-try initializing in case env variables were loaded dynamically
      this.initTransporter();
    }

    const fromAddress = message.from || this.defaultFrom;
    const recipients = Array.isArray(message.to) ? message.to.join(', ') : message.to;

    if (!this.transporter) {
      console.log(`[AwsSesEmailProvider:DryRun] Sending to ${recipients} | Subject: "${message.subject}"`);
      return {
        success: true,
        messageId: `dry-run-${Date.now()}`,
      };
    }

    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: fromAddress,
        to: recipients,
        subject: message.subject,
        html: message.html,
        text: message.text || (message.html ? message.html.replace(/<[^>]*>/g, '') : ''),
        replyTo: message.replyTo,
        cc: message.cc,
        bcc: message.bcc,
        attachments: message.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[AwsSesEmailProvider] Email delivered to ${recipients} (MessageId: ${info.messageId})`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error(`[AwsSesEmailProvider] Failed to send email to ${recipients}:`, err.message || err);
      return {
        success: false,
        error: err.message || 'Unknown email transmission error',
      };
    }
  }
}
