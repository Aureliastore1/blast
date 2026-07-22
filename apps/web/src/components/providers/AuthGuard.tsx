"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { apiClient, ensureCsrfToken } from "@/lib/apiClient";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const setSession = useAuthStore((s) => s.setSession);
  const user = useAuthStore((s) => s.user);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!accessToken) {
        // Try silent refresh via the httpOnly cookie before giving up.
        try {
          const csrf = await ensureCsrfToken();
          const res = await apiClient.post("/auth/refresh", {}, { headers: { "X-CSRF-Token": csrf } });
          const { accessToken: newToken } = res.data.data;
          const me = await apiClient.get("/auth/me", { headers: { Authorization: `Bearer ${newToken}` } });
          if (!cancelled) {
            setSession(
              { email: me.data.data.email, role: me.data.data.role, sub: me.data.data.sub, name: user?.name },
              newToken
            );
          }
        } catch {
          if (!cancelled) router.replace("/login");
        }
      }
      if (!cancelled) setChecking(false);
    }

    verify();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking && !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-cyan border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
