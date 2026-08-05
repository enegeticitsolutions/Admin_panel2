import { WhatsAppRegistry } from '../registry/whatsapp.registry';
import { WhatsAppChannel } from '../channels/whatsapp.channel';

const whatsAppChannel = new WhatsAppChannel();

export interface SendNotificationParams {
  channel: 'whatsapp' | 'sms' | 'email';
  event: string;
  to: string;
  variables?: Record<string, any>;
}

export const notificationService = {
  async send(params: SendNotificationParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const { channel, event, to, variables = {} } = params;

    if (channel === 'whatsapp') {
      const templateConfig = WhatsAppRegistry[event];
      
      if (!templateConfig) {
        console.warn(`[NotificationService] Event ${event} not found in WhatsAppRegistry.`);
        return { success: false, error: `Event ${event} not mapped for WhatsApp` };
      }

      // Map the dictionary variables to an ordered array as required by the template config
      const orderedVariables: string[] = [];
      for (const key of templateConfig.body) {
        const val = variables[key];
        if (val === undefined || val === null) {
          console.warn(`[NotificationService] Missing required variable '${key}' for event '${event}'`);
          return { success: false, error: `Missing required variable '${key}'` };
        }
        orderedVariables.push(String(val));
      }

      return whatsAppChannel.send({
        to,
        templateName: templateConfig.template,
        variables: orderedVariables,
      });
    }

    // Default handlers for sms/email
    console.warn(`[NotificationService] Channel '${channel}' not fully implemented via generic send yet.`);
    return { success: false, error: `Channel '${channel}' not implemented via generic send.` };
  }
};
