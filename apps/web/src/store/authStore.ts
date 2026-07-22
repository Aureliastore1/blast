import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id?: string;
  sub?: string;
  name?: string;
  email: string;
  role: "ADMIN" | "USER";
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  setSession: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setSession: (user, accessToken) => set({ user, accessToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: "inaedaa-auth" }
  )
);
