"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function RootPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    router.replace(accessToken ? "/dashboard" : "/login");
  }, [accessToken, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-900">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-cyan border-t-transparent" />
    </div>
  );
}
