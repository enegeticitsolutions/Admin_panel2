export interface WhatsAppMessage {
  to: string;            // "+919876543210"
  templateName: string;  // Approved WhatsApp template name
  language?: string;     // "en" | "hi" (defaults to "en")
  variables?: string[];  // Template body variable substitutions
  components?: Record<string, any>; // Direct custom components (e.g. body_1, button_1)
  mediaUrl?: string;     // Optional image/document URL
}

export interface IWhatsAppProvider {
  readonly name: string; // "msg91-whatsapp" | "gupshup"
  send(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }>;
}
