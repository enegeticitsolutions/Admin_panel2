import { IPushProvider, PushNotificationMessage, PushNotificationResponse } from '../interfaces/IPushProvider';
import { ExpoFcmPushProvider } from '../providers/push/expo-fcm.provider';

export class PushChannel {
  private provider: IPushProvider;

  constructor(provider?: IPushProvider) {
    this.provider = provider || new ExpoFcmPushProvider();
  }

  public setProvider(provider: IPushProvider) {
    this.provider = provider;
  }

  public async send(message: PushNotificationMessage): Promise<PushNotificationResponse> {
    return this.provider.send(message);
  }

  public async sendBatch(messages: PushNotificationMessage[]) {
    if (this.provider.sendBatch) {
      return this.provider.sendBatch(messages);
    }
    const results = await Promise.all(messages.map((m) => this.provider.send(m)));
    const sentCount = results.filter((r) => r.success).length;
    return {
      success: sentCount === messages.length,
      sentCount,
      failedCount: messages.length - sentCount,
    };
  }
}
