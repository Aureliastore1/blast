import { create } from "zustand";

export type WAStatus =
  | "DISCONNECTED"
  | "CONNECTING"
  | "QR_PENDING"
  | "CONNECTED"
  | "RECONNECTING"
  | "LOGGED_OUT";

interface WAState {
  status: WAStatus;
  qr: string | null;
  phoneNumber: string | null;
  profileName: string | null;
  setStatus: (payload: Partial<WAState> & { status: WAStatus }) => void;
}

export const useWAStore = create<WAState>((set) => ({
  status: "DISCONNECTED",
  qr: null,
  phoneNumber: null,
  profileName: null,
  setStatus: (payload) =>
    set((state) => ({
      ...state,
      ...payload,
      qr: payload.status === "QR_PENDING" ? payload.qr ?? state.qr : null,
    })),
}));
