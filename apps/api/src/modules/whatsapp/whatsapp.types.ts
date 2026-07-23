/**
 * Abstraction over the underlying WhatsApp transport so the rest of the
 * application (campaign queue, controllers) never depends on Baileys
 * directly. Swapping to the official WhatsApp Business Platform (Cloud API)
 * in the future means writing a new class that implements this interface —
 * no changes required anywhere else.
 */
export interface SendMessageInput {
  userId: string;
  to: string; // normalized 62xxxxxxxxxx
  text?: string;
  mediaPath?: string;
  mediaType?: "IMAGE" | "VIDEO" | "DOCUMENT";
  caption?: string;
  // Cloud API template mode
  templateName?: string;
  templateLanguage?: string; // e.g., "id" for Indonesian
  templateParams?: Record<string, string>;
}

export interface SendMessageResult {
  success: boolean;
  waMessageId?: string;
  error?: string;
}

export interface WhatsAppStatusPayload {
  status: "DISCONNECTED" | "CONNECTING" | "QR_PENDING" | "CONNECTED" | "RECONNECTING" | "LOGGED_OUT";
  qr?: string;
  phoneNumber?: string;
  profileName?: string;
}

export interface IWhatsAppEngine {
  startSession(userId: string): Promise<void>;
  logoutSession(userId: string): Promise<void>;
  isConnected(userId: string): boolean;
  sendMessage(input: SendMessageInput): Promise<SendMessageResult>;
}

