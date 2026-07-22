import { create } from "zustand";

export interface AppNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  createdAt: number;
  read: boolean;
}

interface NotificationState {
  items: AppNotification[];
  push: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markAllRead: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  items: [],
  push: (n) =>
    set((state) => ({
      items: [
        { ...n, id: crypto.randomUUID(), createdAt: Date.now(), read: false },
        ...state.items,
      ].slice(0, 50),
    })),
  markAllRead: () => set((state) => ({ items: state.items.map((i) => ({ ...i, read: true })) })),
  unreadCount: () => get().items.filter((i) => !i.read).length,
}));
