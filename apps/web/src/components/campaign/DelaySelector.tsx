"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const DELAY_PRESETS = [
  { value: "RANGE_1_5", label: "1–5 detik", hint: "Cepat" },
  { value: "RANGE_5_10", label: "5–10 detik", hint: "Direkomendasikan" },
  { value: "RANGE_10_20", label: "10–20 detik", hint: "Aman" },
  { value: "RANGE_20_45", label: "20–45 detik", hint: "Lebih Aman" },
  { value: "RANGE_45_90", label: "45–90 detik", hint: "Paling Aman" },
  { value: "CUSTOM", label: "Custom", hint: "Atur sendiri" },
] as const;

interface DelaySelectorProps {
  preset: string;
  onPresetChange: (v: string) => void;
  minDelay: number;
  maxDelay: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
  maxPerHour: number;
  onMaxPerHourChange: (v: number) => void;
}

export function DelaySelector({
  preset,
  onPresetChange,
  minDelay,
  maxDelay,
  onMinChange,
  onMaxChange,
  maxPerHour,
  onMaxPerHourChange,
}: DelaySelectorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {DELAY_PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onPresetChange(p.value)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left transition-all",
              preset === p.value
                ? "border-accent-cyan/50 bg-accent-cyan/10 shadow-glow"
                : "border-white/10 bg-white/[0.02] hover:border-white/20"
            )}
          >
            <p className="flex items-center gap-1.5 text-sm font-medium text-slate-200">
              <Clock className="h-3.5 w-3.5 text-slate-500" /> {p.label}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">{p.hint}</p>
          </button>
        ))}
      </div>

      {preset === "CUSTOM" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Delay Minimum (detik)</label>
            <input
              type="number"
              min={1}
              max={90}
              value={minDelay}
              onChange={(e) => onMinChange(Number(e.target.value))}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Delay Maksimum (detik)</label>
            <input
              type="number"
              min={1}
              max={90}
              value={maxDelay}
              onChange={(e) => onMaxChange(Number(e.target.value))}
              className="input-field"
            />
          </div>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">
          Batas Maksimal Pesan / Jam
        </label>
        <input
          type="number"
          min={1}
          max={2000}
          value={maxPerHour}
          onChange={(e) => onMaxPerHourChange(Number(e.target.value))}
          className="input-field max-w-[200px]"
        />
        <p className="mt-1 text-[11px] text-slate-500">
          Membatasi laju pengiriman untuk menjaga kesehatan akun WhatsApp Anda.
        </p>
      </div>
    </div>
  );
}
