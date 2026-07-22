"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";
import { useWAStore, WAStatus } from "@/store/waStore";
import { useNotificationStore } from "@/store/notificationStore";

const SocketContext = createContext<Socket | null>(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setWaStatus = useWAStore((s) => s.setStatus);
  const pushNotification = useNotificationStore((s) => s.push);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const socket = getSocket(accessToken);
    setSocketInstance(socket);

    socket.on("whatsapp:status", (payload: { status: WAStatus; qr?: string; phoneNumber?: string; profileName?: string }) => {
      setWaStatus(payload);
    });

    socket.on(
      "notification",
      (payload: { type: "success" | "error" | "warning" | "info"; title: string; message?: string }) => {
        pushNotification(payload);
        const text = payload.message ? `${payload.title} — ${payload.message}` : payload.title;
        if (payload.type === "success") toast.success(text);
        else if (payload.type === "error") toast.error(text);
        else toast(text, { icon: payload.type === "warning" ? "⚠️" : "ℹ️" });
      }
    );

    return () => {
      socket.off("whatsapp:status");
      socket.off("notification");
    };
  }, [accessToken, setWaStatus, pushNotification]);

  useEffect(() => {
    if (!accessToken) disconnectSocket();
  }, [accessToken]);

  return <SocketContext.Provider value={socketInstance}>{children}</SocketContext.Provider>;
}
