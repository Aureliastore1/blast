"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiClient, apiErrorMessage } from "@/lib/apiClient";

interface Settings {
  defaultMinDelaySec: number;
  defaultMaxDelaySec: number;
  maxMessagesPerHour: number;
  maxRetryAttempts: number;
  autoPauseFailureRate: number;
  notifyOnComplete: boolean;
  notifyOnFailureSpike: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.get("/settings").then((res) => setSettings(res.data.data));
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      await apiClient.put("/settings", settings);
      toast.success("Pengaturan disimpan");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <p className="py-10 text-center text-sm text-slate-500">Memuat...</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-500">Atur nilai default pengiriman untuk campaign baru</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jeda & Batas Pengiriman</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-4">
          <NumberField
            label="Delay Minimum Default (detik)"
            value={settings.defaultMinDelaySec}
            onChange={(v) => setSettings({ ...settings, defaultMinDelaySec: v })}
          />
          <NumberField
            label="Delay Maksimum Default (detik)"
            value={settings.defaultMaxDelaySec}
            onChange={(v) => setSettings({ ...settings, defaultMaxDelaySec: v })}
          />
          <NumberField
            label="Maks Pesan / Jam"
            value={settings.maxMessagesPerHour}
            onChange={(v) => setSettings({ ...settings, maxMessagesPerHour: v })}
          />
          <NumberField
            label="Maks Percobaan Retry"
            value={settings.maxRetryAttempts}
            onChange={(v) => setSettings({ ...settings, maxRetryAttempts: v })}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auto-Pause Keamanan</CardTitle>
        </CardHeader>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">
          Ambang Batas Tingkat Kegagalan ({Math.round(settings.autoPauseFailureRate * 100)}%)
        </label>
        <input
          type="range"
          min={0.1}
          max={0.9}
          step={0.05}
          value={settings.autoPauseFailureRate}
          onChange={(e) => setSettings({ ...settings, autoPauseFailureRate: Number(e.target.value) })}
          className="w-full accent-accent-cyan"
        />
        <p className="mt-1 text-[11px] text-slate-500">
          Campaign otomatis dijeda jika tingkat kegagalan melewati ambang batas ini, demi menjaga keamanan akun WhatsApp Anda.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifikasi</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          <ToggleRow
            label="Notifikasi saat campaign selesai"
            checked={settings.notifyOnComplete}
            onChange={(v) => setSettings({ ...settings, notifyOnComplete: v })}
          />
          <ToggleRow
            label="Notifikasi saat lonjakan kegagalan"
            checked={settings.notifyOnFailureSpike}
            onChange={(v) => setSettings({ ...settings, notifyOnFailureSpike: v })}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" /> Simpan Pengaturan
        </Button>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-400">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="input-field" />
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-accent-cyan" />
    </label>
  );
}
