import { IEmailProvider, EmailMessage, EmailSendResponse } from '../interfaces/IEmailProvider';
import { AwsSesEmailProvider } from '../providers/email/AwsSesEmailProvider';

export class EmailChannel {
  private provider: IEmailProvider;

  constructor(provider?: IEmailProvider) {
    this.provider = provider || new AwsSesEmailProvider();
  }

  public setProvider(provider: IEmailProvider) {
    this.provider = provider;
  }

  public async send(message: EmailMessage): Promise<EmailSendResponse> {
    return this.provider.send(message);
  }
}
