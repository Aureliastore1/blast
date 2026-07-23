import axios, { AxiosInstance } from "axios";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { prisma } from "@/config/prisma";
import { Server as SocketIOServer } from "socket.io";
import {
  IWhatsAppEngine,
  SendMessageInput,
  SendMessageResult,
  WhatsAppStatusPayload,
} from "./whatsapp.types";

class CloudAPIWhatsAppEngine implements IWhatsAppEngine {
  private client: AxiosInstance;
  private io?: SocketIOServer;
  private graphUrl = "https://graph.facebook.com";

  constructor() {
    this.client = axios.create({
      baseURL: this.graphUrl,
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_CLOUD_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
  }

  attachSocketServer(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Cloud API: always connected if credentials are valid (no per-user session concept).
   * Return true if all required env vars are present.
   */
  isConnected(userId: string): boolean {
    const hasAllCreds =
      !!env.WHATSAPP_CLOUD_API_TOKEN &&
      !!env.WHATSAPP_PHONE_NUMBER_ID &&
      !!env.WHATSAPP_BUSINESS_ACCOUNT_ID &&
      !!env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    return hasAllCreds;
  }

  /**
   * No-op: Cloud API doesn't require per-user session initialization.
   * Credentials are app-wide.
   */
  async startSession(userId: string): Promise<void> {
    logger.info({ userId }, "Cloud API startSession called (no-op, credentials are app-wide)");
    // Update persistent status to indicate this is Cloud API mode (always "CONNECTED")
    await this.persistStatus(userId, "CONNECTED", {
      phoneNumber: null,
      profileName: "WhatsApp Cloud API",
      lastConnectedAt: new Date(),
    });
    this.broadcastStatus(userId, {
      status: "CONNECTED",
      phoneNumber: env.WHATSAPP_PHONE_NUMBER_ID,
      profileName: "WhatsApp Cloud API",
    });
  }

  /**
   * No-op: Cloud API doesn't have logout concept (credentials are global, not per-user).
   */
  async logoutSession(userId: string): Promise<void> {
    logger.info({ userId }, "Cloud API logoutSession called (no-op, credentials managed globally)");
    await this.persistStatus(userId, "DISCONNECTED", {
      disconnectReason: "user_logout",
    });
    this.broadcastStatus(userId, { status: "DISCONNECTED" });
  }

  /**
   * Send message via WhatsApp Cloud API (Graph API).
   * Supports two modes:
   * 1. Template mode: templateName + templateLanguage + templateParams (for cold outreach/broadcast)
   * 2. Free text mode: text + optional media (for replies within 24h window)
   */
  async sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
    if (!this.isConnected(input.userId)) {
      return {
        success: false,
        error: "WhatsApp Cloud API credentials tidak lengkap atau belum dikonfigurasi",
      };
    }

    const to = `${input.to}@s.whatsapp.net`.replace("@s.whatsapp.net@s.whatsapp.net", "@s.whatsapp.net");
    const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
    const endpoint = `/${env.WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;

    try {
      let payload: Record<string, unknown>;

      // Template mode (for new contacts, broadcasts)
      if (input.templateName) {
        const components: Record<string, unknown>[] = [];
        if (input.templateParams && Object.keys(input.templateParams).length > 0) {
          components.push({
            type: "body",
            parameters: Object.values(input.templateParams).map((value) => ({
              type: "text",
              text: value,
            })),
          });
        }

        payload = {
          messaging_product: "whatsapp",
          to: input.to,
          type: "template",
          template: {
            name: input.templateName,
            language: {
              code: input.templateLanguage || "id",
            },
            ...(components.length > 0 && { components }),
          },
        };
      }
      // Free text mode (for replies, within 24h window)
      else {
        payload = {
          messaging_product: "whatsapp",
          to: input.to,
          type: "text",
          text: {
            body: input.text || "",
          },
        };
      }

      const response = await this.client.post(endpoint, payload);

      const messageId = response.data?.messages?.[0]?.id;
      if (!messageId) {
        logger.warn({ response: response.data, to: input.to }, "Message sent but no ID returned");
      }

      logger.info(
        { to: input.to, messageId, templateName: input.templateName },
        "Message sent via Cloud API"
      );

      return {
        success: true,
        waMessageId: messageId,
      };
    } catch (err) {
      const errorMsg =
        axios.isAxiosError(err) && err.response?.data?.error?.message
          ? err.response.data.error.message
          : err instanceof Error
            ? err.message
            : "Unknown error";

      logger.error(
        {
          err,
          userId: input.userId,
          to: input.to,
          templateName: input.templateName,
          errorDetail: axios.isAxiosError(err) ? err.response?.data : undefined,
        },
        "Failed to send WhatsApp message via Cloud API"
      );

      return {
        success: false,
        error: `Cloud API error: ${errorMsg}`,
      };
    }
  }

  /**
   * Process incoming webhook payload from Meta:
   * - Message status updates (sent, delivered, read, failed)
   * - Inbound messages from customers
   */
  async handleWebhookEvent(payload: any): Promise<void> {
    try {
      if (!payload.entry?.[0]?.changes?.[0]?.value) {
        logger.warn({ payload }, "Invalid webhook payload structure");
        return;
      }

      const value = payload.entry[0].changes[0].value;

      // Process status updates
      if (value.statuses) {
        for (const status of value.statuses) {
          const { id, status: msgStatus, timestamp } = status;
          logger.info(
            { waMessageId: id, status: msgStatus, timestamp },
            "WhatsApp message status update"
          );

          // Map Meta status to local status
          let localStatus;
          if (msgStatus === "sent") localStatus = "SENT";
          else if (msgStatus === "delivered") localStatus = "DELIVERED";
          else if (msgStatus === "read") localStatus = "READ";
          else if (msgStatus === "failed") localStatus = "FAILED";

          if (localStatus) {
            // Try to find and update the message in DB
            const message = await prisma.message.findFirst({
              where: { waMessageId: id },
            });

            if (message) {
              await prisma.message.update({
                where: { id: message.id },
                data: {
                  status: localStatus as any,
                  sentAt: new Date(parseInt(timestamp, 10) * 1000),
                },
              });
              logger.info(
                { messageId: message.id, status: localStatus },
                "Updated message status from webhook"
              );
            }
          }
        }
      }

      // Process inbound messages
      if (value.messages) {
        for (const message of value.messages) {
          const { from, id: waMessageId, timestamp, text, type } = message;
          logger.info(
            { from, waMessageId, type, text: text?.body },
            "Inbound message from customer"
          );

          // Save inbound message (optional: implement storage logic here)
          // For now, just log and emit to dashboard via Socket.io
          if (this.io) {
            this.io.emit("whatsapp:inbound-message", {
              from,
              waMessageId,
              timestamp: new Date(parseInt(timestamp, 10) * 1000),
              type,
              text: text?.body,
              receivedAt: new Date(),
            });
          }
        }
      }
    } catch (err) {
      logger.error({ err, payload }, "Error processing webhook event");
    }
  }

  private async persistStatus(
    userId: string,
    status: WhatsAppStatusPayload["status"],
    extra: Record<string, unknown> = {}
  ) {
    try {
      await prisma.whatsAppSession.upsert({
        where: { userId_sessionName: { userId, sessionName: "default" } },
        update: { status, ...extra },
        create: { userId, sessionName: "default", status, ...extra },
      });
    } catch (err) {
      logger.error({ err, userId }, "Failed to persist WhatsApp session status");
    }
  }

  private broadcastStatus(userId: string, payload: WhatsAppStatusPayload) {
    if (this.io) {
      this.io.emit(`whatsapp:status:${userId}`, payload);
    }
  }
}

/** Singleton instance shared across the app (controllers, queue worker). */
export const whatsappEngine = new CloudAPIWhatsAppEngine();

