export interface SmsMessage {
  to: string;          // Phone number formatted with country code: "+919876543210" or "919876543210"
  body: string;        // Plain text message content
  templateId?: string; // DLT registered template ID (required in India)
  variables?: string[];// DLT variable substitution values
}

export interface ISmsProvider {
  readonly name: string; // "msg91" | "twilio" | "stub"
  send(message: SmsMessage): Promise<{ success: boolean; messageId?: string; error?: string }>;
}
