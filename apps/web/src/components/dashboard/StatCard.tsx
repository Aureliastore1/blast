import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "cyan" | "indigo" | "green" | "teal" | "red" | "amber";
  hint?: string;
  index?: number;
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  cyan: "from-accent-cyan/25 to-accent-cyan/0 text-accent-cyan",
  indigo: "from-accent-indigo/25 to-accent-indigo/0 text-accent-indigo",
  green: "from-accent-green/25 to-accent-green/0 text-accent-green",
  teal: "from-accent-teal/25 to-accent-teal/0 text-accent-teal",
  red: "from-red-500/25 to-red-500/0 text-red-400",
  amber: "from-amber-500/25 to-amber-500/0 text-amber-400",
};

export function StatCard({ label, value, icon: Icon, tone = "cyan", hint, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Card className="relative overflow-hidden">
        <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl", TONE_CLASSES[tone])} />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</p>
            {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
          </div>
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-inset ring-white/10", TONE_CLASSES[tone].split(" ").pop())}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
