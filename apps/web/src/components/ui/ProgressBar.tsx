import { cn } from "@/lib/utils";

export function ProgressBar({
  percentage,
  className,
  tone = "brand",
}: {
  percentage: number;
  className?: string;
  tone?: "brand" | "success" | "warning" | "error";
}) {
  const clamped = Math.max(0, Math.min(100, percentage));

  const fillClass =
    tone === "success"
      ? "bg-accent-green"
      : tone === "warning"
      ? "bg-amber-500"
      : tone === "error"
      ? "bg-red-500"
      : "bg-brand-gradient";

  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-white/5", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500 ease-out", fillClass)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
