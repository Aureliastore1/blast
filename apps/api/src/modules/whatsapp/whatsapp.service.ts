import { prisma } from "@/config/prisma";
import { whatsappEngine } from "./cloudapi.engine";
import { AppError } from "@/utils/AppError";

export async function requestConnection(userId: string) {
  await whatsappEngine.startSession(userId);
  return getSessionStatus(userId);
}

export async function getSessionStatus(userId: string) {
  // Check if Cloud API credentials are valid (all required env vars present)
  const isConnected = whatsappEngine.isConnected(userId);

  if (isConnected) {
    // If credentials are valid, ensure database reflects "CONNECTED" status
    // This is important for cases where env vars were just added to Railway
    await prisma.whatsAppSession.upsert({
      where: { userId_sessionName: { userId, sessionName: "default" } },
      update: { 
        status: "CONNECTED",
        profileName: "WhatsApp Cloud API",
        lastConnectedAt: new Date(),
      },
      create: { 
        userId, 
        sessionName: "default", 
        status: "CONNECTED",
        profileName: "WhatsApp Cloud API",
        lastConnectedAt: new Date(),
      },
    });

    // Return the session with CONNECTED status
    const session = await prisma.whatsAppSession.findUnique({
      where: { userId_sessionName: { userId, sessionName: "default" } },
    });

    if (!session) {
      return { status: "CONNECTED", profileName: "WhatsApp Cloud API" };
    }

    return {
      status: session.status,
      phoneNumber: session.phoneNumber,
      profileName: session.profileName,
      profilePicUrl: session.profilePicUrl,
      batteryLevel: session.batteryLevel,
      lastConnectedAt: session.lastConnectedAt,
      lastSeenAt: session.lastSeenAt,
    };
  }

  // If credentials are not valid, return DISCONNECTED
  const session = await prisma.whatsAppSession.findUnique({
    where: { userId_sessionName: { userId, sessionName: "default" } },
  });

  if (!session) {
    return { status: "DISCONNECTED" as const };
  }

  return {
    status: session.status,
    phoneNumber: session.phoneNumber,
    profileName: session.profileName,
    profilePicUrl: session.profilePicUrl,
    batteryLevel: session.batteryLevel,
    lastConnectedAt: session.lastConnectedAt,
    lastSeenAt: session.lastSeenAt,
  };
}

export async function disconnectSession(userId: string) {
  const session = await prisma.whatsAppSession.findUnique({
    where: { userId_sessionName: { userId, sessionName: "default" } },
  });
  if (!session) throw AppError.notFound("Sesi WhatsApp tidak ditemukan");

  await whatsappEngine.logoutSession(userId);
  return { success: true };
}

