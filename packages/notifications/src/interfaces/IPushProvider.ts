export interface PushNotificationMessage {
  to: string; // Expo Push Token or FCM device token (e.g. "ExponentPushToken[...]")
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | string | null;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
  ttl?: number; // Time-to-live in seconds
}

export interface PushNotificationResponse {
  success: boolean;
  messageId?: string;
  ticketId?: string;
  error?: string;
  details?: any;
}

export interface IPushProvider {
  readonly name: string; // e.g. "expo-fcm", "firebase-admin"
  send(message: PushNotificationMessage): Promise<PushNotificationResponse>;
  sendBatch?(messages: PushNotificationMessage[]): Promise<{
    success: boolean;
    sentCount: number;
    failedCount: number;
    errors?: any[];
  }>;
}
