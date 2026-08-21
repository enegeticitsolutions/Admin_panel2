import { PushChannel } from '../channels/push.channel';
import { WhatsAppChannel } from '../channels/whatsapp.channel';
import { CareMitraTemplates, formatTemplateText } from '../registry/care-mitra-templates.registry';
import { notificationBus, NotificationEventBus } from '../pubsub/notification-event-bus';

export interface DispatchNotificationTarget {
  userId?: string;
  pushToken?: string; // Expo Push Token / FCM token
  phone?: string;     // E.164 formatted phone number for WhatsApp / SMS
  email?: string;
}

export interface CareMitraNotificationPayloads {
  CARE_MITRA_ONBOARDING_CLEARED: {
    ccName: string;
    fmName: string;
  };
  CARE_MITRA_TRAINING_REMINDER: {
    ccName: string;
    moduleName: string;
    date: string;
    timeLocation: string;
  };
  CARE_MITRA_VISIT_SCHEDULED: {
    ccName: string;
    beneficiaryName: string;
    date: string;
    time: string;
    address: string;
    visitId?: string;
  };
  CARE_MITRA_VISIT_REMINDER: {
    beneficiaryName: string;
    time: string;
    visitId?: string;
  };
  CARE_MITRA_BIRTHDAY_REMINDER: {
    beneficiaryName: string;
    date: string;
    beneficiaryId?: string;
  };
  CARE_MITRA_PERFORMANCE_RATING: {
    rating: number | string;
    beneficiaryName: string;
    comment: string;
    visitId?: string;
  };
  SAATHI_INTERACTION_REQUEST: {
    beneficiaryName: string;
    requestId?: string;
  };
  SAATHI_VISIT_CREDITS_EARNED: {
    beneficiaryName: string;
    credits: number | string;
    visitId?: string;
  };
}

export interface DispatchCareMitraResult {
  templateId: string;
  pushResult?: { success: boolean; ticketId?: string; error?: string };
  whatsAppResult?: { success: boolean; messageId?: string; error?: string };
  success: boolean;
}

/**
 * Object-Oriented Care Mitra & Saathi Multi-Channel Notification Service
 * Dispatches Push notifications (via FCM) and prepares modular WhatsApp / SMS channels.
 * Integrated with the Pub/Sub Notification Event Bus.
 */
export class CareMitraNotificationService {
  private static instance: CareMitraNotificationService;
  private pushChannel: PushChannel;
  private whatsAppChannel: WhatsAppChannel;
  private eventBus: NotificationEventBus;

  constructor(
    pushChannel?: PushChannel,
    whatsAppChannel?: WhatsAppChannel,
    eventBus?: NotificationEventBus
  ) {
    this.pushChannel = pushChannel || new PushChannel();
    this.whatsAppChannel = whatsAppChannel || new WhatsAppChannel();
    this.eventBus = eventBus || notificationBus;
    this.registerPubSubListeners();
  }

  public static getInstance(): CareMitraNotificationService {
    if (!CareMitraNotificationService.instance) {
      CareMitraNotificationService.instance = new CareMitraNotificationService();
    }
    return CareMitraNotificationService.instance;
  }

  /**
   * Generic Dispatcher for any registered Care Mitra Template
   */
  public async dispatch<K extends keyof CareMitraNotificationPayloads>(
    eventKey: K,
    target: DispatchNotificationTarget,
    variables: CareMitraNotificationPayloads[K],
    extraData?: Record<string, any>
  ): Promise<DispatchCareMitraResult> {
    const template = CareMitraTemplates[eventKey];
    if (!template) {
      throw new Error(`Template for event "${eventKey}" is not registered.`);
    }

    const title = template.subject;
    const body = formatTemplateText(template.bodyTemplate, variables as any);
    const dataPayload = {
      templateId: template.id,
      eventKey,
      ...variables,
      ...(extraData || {}),
    };

    let pushResult: any = null;
    let whatsAppResult: any = null;

    // 1. Primary Channel: Push Notification via FCM (Expo Push)
    if (target.pushToken && template.channels.includes('push')) {
      pushResult = await this.pushChannel.send({
        to: target.pushToken,
        title,
        body,
        data: dataPayload,
        priority: template.priority === 'high' ? 'high' : 'normal',
        sound: 'default',
      });
      console.log(`[CareMitraNotification] Push dispatched (${template.id}):`, pushResult.success ? '✅ OK' : `❌ ${pushResult.error}`);
    }

    // 2. Secondary Channel: WhatsApp (when enabled & target phone available)
    if (target.phone && template.channels.includes('whatsapp') && process.env.ENABLE_WHATSAPP_NOTIFICATIONS === 'true') {
      const orderedVars = template.variables.map((v) => String((variables as any)[v] ?? ''));
      whatsAppResult = await this.whatsAppChannel.send({
        to: target.phone,
        templateName: template.whatsappTemplate,
        variables: orderedVars,
      });
      console.log(`[CareMitraNotification] WhatsApp dispatched (${template.id}):`, whatsAppResult.success ? '✅ OK' : `❌ ${whatsAppResult.error}`);
    }

    return {
      templateId: template.id,
      pushResult,
      whatsAppResult,
      success: !!(pushResult?.success || whatsAppResult?.success || (!target.pushToken && !target.phone)),
    };
  }

  // ─── High-Level Semantic Helper Methods ──────────────────────────────────────

  /**
   * NT-006: Care Mitra onboarding — BGV approved, deployment cleared
   */
  public async notifyOnboardingCleared(
    target: DispatchNotificationTarget,
    payload: CareMitraNotificationPayloads['CARE_MITRA_ONBOARDING_CLEARED']
  ) {
    return this.dispatch('CARE_MITRA_ONBOARDING_CLEARED', target, payload);
  }

  /**
   * NT-007: Care Mitra training reminder
   */
  public async notifyTrainingReminder(
    target: DispatchNotificationTarget,
    payload: CareMitraNotificationPayloads['CARE_MITRA_TRAINING_REMINDER']
  ) {
    return this.dispatch('CARE_MITRA_TRAINING_REMINDER', target, payload);
  }

  /**
   * NT-010: Visit scheduled / roster published
   */
  public async notifyVisitScheduled(
    target: DispatchNotificationTarget,
    payload: CareMitraNotificationPayloads['CARE_MITRA_VISIT_SCHEDULED']
  ) {
    return this.dispatch('CARE_MITRA_VISIT_SCHEDULED', target, payload, {
      screen: '/(tabs)/schedule',
      visitId: payload.visitId,
    });
  }

  /**
   * NT-011: Visit reminder (1 hour before)
   */
  public async notifyVisitReminder(
    target: DispatchNotificationTarget,
    payload: CareMitraNotificationPayloads['CARE_MITRA_VISIT_REMINDER']
  ) {
    return this.dispatch('CARE_MITRA_VISIT_REMINDER', target, payload, {
      screen: '/(tabs)/schedule',
      visitId: payload.visitId,
    });
  }

  /**
   * NT-064: Birthday / special occasion reminder
   */
  public async notifyBirthdayReminder(
    target: DispatchNotificationTarget,
    payload: CareMitraNotificationPayloads['CARE_MITRA_BIRTHDAY_REMINDER']
  ) {
    return this.dispatch('CARE_MITRA_BIRTHDAY_REMINDER', target, payload, {
      beneficiaryId: payload.beneficiaryId,
    });
  }

  /**
   * NT-065: CC performance rating received
   */
  public async notifyPerformanceRating(
    target: DispatchNotificationTarget,
    payload: CareMitraNotificationPayloads['CARE_MITRA_PERFORMANCE_RATING']
  ) {
    return this.dispatch('CARE_MITRA_PERFORMANCE_RATING', target, payload, {
      visitId: payload.visitId,
    });
  }

  /**
   * NT-070: Saathi interaction request received
   */
  public async notifySaathiInteractionRequest(
    target: DispatchNotificationTarget,
    payload: CareMitraNotificationPayloads['SAATHI_INTERACTION_REQUEST']
  ) {
    return this.dispatch('SAATHI_INTERACTION_REQUEST', target, payload, {
      screen: '/(tabs)/requests',
      requestId: payload.requestId,
    });
  }

  /**
   * NT-071: Saathi visit completed — credits earned
   */
  public async notifySaathiCreditsEarned(
    target: DispatchNotificationTarget,
    payload: CareMitraNotificationPayloads['SAATHI_VISIT_CREDITS_EARNED']
  ) {
    return this.dispatch('SAATHI_VISIT_CREDITS_EARNED', target, payload, {
      screen: '/(tabs)/profile',
      visitId: payload.visitId,
    });
  }

  /**
   * Pub/Sub Event Listeners Registration
   * Subscribes this service to domain events published to the event bus.
   */
  private registerPubSubListeners() {
    this.eventBus.subscribe('care_mitra.onboarding_cleared', async (data: { target: DispatchNotificationTarget; payload: any }) => {
      await this.notifyOnboardingCleared(data.target, data.payload);
    });

    this.eventBus.subscribe('care_mitra.training_reminder', async (data: { target: DispatchNotificationTarget; payload: any }) => {
      await this.notifyTrainingReminder(data.target, data.payload);
    });

    this.eventBus.subscribe('care_mitra.visit_scheduled', async (data: { target: DispatchNotificationTarget; payload: any }) => {
      await this.notifyVisitScheduled(data.target, data.payload);
    });

    this.eventBus.subscribe('care_mitra.visit_reminder', async (data: { target: DispatchNotificationTarget; payload: any }) => {
      await this.notifyVisitReminder(data.target, data.payload);
    });

    this.eventBus.subscribe('care_mitra.birthday_reminder', async (data: { target: DispatchNotificationTarget; payload: any }) => {
      await this.notifyBirthdayReminder(data.target, data.payload);
    });

    this.eventBus.subscribe('care_mitra.rating_received', async (data: { target: DispatchNotificationTarget; payload: any }) => {
      await this.notifyPerformanceRating(data.target, data.payload);
    });

    this.eventBus.subscribe('saathi.interaction_request', async (data: { target: DispatchNotificationTarget; payload: any }) => {
      await this.notifySaathiInteractionRequest(data.target, data.payload);
    });

    this.eventBus.subscribe('saathi.credits_earned', async (data: { target: DispatchNotificationTarget; payload: any }) => {
      await this.notifySaathiCreditsEarned(data.target, data.payload);
    });
  }
}

export const careMitraNotificationService = CareMitraNotificationService.getInstance();
