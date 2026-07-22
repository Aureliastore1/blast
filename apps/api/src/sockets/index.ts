import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { verifyAccessToken } from "@/utils/jwt";

/**
 * Socket.io rooms convention:
 *  - `user:{userId}`      → all events scoped to a user (WA status, notifications)
 *  - `campaign:{campaignId}` → realtime progress events for one campaign
 */
export function initSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN.split(","),
      credentials: true,
    },
    path: "/socket.io",
  });

  io.use((socket: Socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string | undefined) ||
        (socket.handshake.headers.authorization?.toString().replace("Bearer ", "") as
          | string
          | undefined);

      if (!token) return next(new Error("Unauthorized: missing token"));

      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);
    logger.debug({ userId, socketId: socket.id }, "Socket connected");

    socket.on("campaign:subscribe", (campaignId: string) => {
      socket.join(`campaign:${campaignId}`);
    });

    socket.on("campaign:unsubscribe", (campaignId: string) => {
      socket.leave(`campaign:${campaignId}`);
    });

    socket.on("disconnect", () => {
      logger.debug({ userId, socketId: socket.id }, "Socket disconnected");
    });
  });

  return io;
}

/** Helper to emit a WhatsApp status update to a specific user's room. */
export function emitWhatsAppStatus(io: Server, userId: string, payload: unknown) {
  io.to(`user:${userId}`).emit("whatsapp:status", payload);
}

/** Helper to emit campaign progress to subscribers of that campaign. */
export function emitCampaignProgress(io: Server, campaignId: string, payload: unknown) {
  io.to(`campaign:${campaignId}`).emit("campaign:progress", payload);
}

/** Helper to emit a generic toast-style notification to a user. */
export function emitNotification(
  io: Server,
  userId: string,
  payload: { type: "success" | "error" | "warning" | "info"; title: string; message?: string }
) {
  io.to(`user:${userId}`).emit("notification", payload);
}
