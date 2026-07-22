import { cn } from "@/lib/utils";

type BadgeTone = "success" | "error" | "warning" | "info" | "neutral" | "accent";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-accent-green/15 text-accent-green ring-1 ring-inset ring-accent-green/30",
  error: "bg-red-500/15 text-red-400 ring-1 ring-inset ring-red-500/30",
  warning: "bg-amber-500/15 text-amber-400 ring-1 ring-inset ring-amber-500/30",
  info: "bg-accent-cyan/15 text-accent-cyan ring-1 ring-inset ring-accent-cyan/30",
  neutral: "bg-white/5 text-slate-300 ring-1 ring-inset ring-white/10",
  accent: "bg-accent-indigo/15 text-accent-indigo ring-1 ring-inset ring-accent-indigo/30",
};

export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: React.ReactNode; className?: string }) {
  return <span className={cn("badge", TONE_CLASSES[tone], className)}>{children}</span>;
}

const STATUS_TONE: Record<string, BadgeTone> = {
  DRAFT: "neutral",
  QUEUED: "info",
  RUNNING: "info",
  PAUSED: "warning",
  COMPLETED: "success",
  FAILED: "error",
  CANCELLED: "neutral",
  CONNECTED: "success",
  DISCONNECTED: "error",
  CONNECTING: "warning",
  QR_PENDING: "warning",
  RECONNECTING: "warning",
  LOGGED_OUT: "error",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{status.replace("_", " ")}</Badge>;
}
