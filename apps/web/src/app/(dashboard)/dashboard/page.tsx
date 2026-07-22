"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  Users,
  CheckCircle2,
  XCircle,
  Percent,
  Image as ImageIcon,
  FileText,
  Plus,
  Upload,
  QrCode,
  ArrowRight,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { apiClient } from "@/lib/apiClient";
import { formatNumber } from "@/lib/utils";
import dayjs from "dayjs";

interface Summary {
  activeCampaigns: number;
  totalContacts: number;
  sentToday: number;
  failedToday: number;
  deliveryRate: number;
  totalMedia: number;
  totalTemplates: number;
}

interface CampaignItem {
  id: string;
  name: string;
  status: string;
  totalContacts: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recent, setRecent] = useState<CampaignItem[]>([]);

  useEffect(() => {
    apiClient.get("/reports/summary").then((res) => setSummary(res.data.data)).catch(() => undefined);
    apiClient
      .get("/campaigns", { params: { limit: 5 } })
      .then((res) => setRecent(res.data.data.items))
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500">Ringkasan performa campaign WhatsApp Anda</p>
        </div>
        <div className="flex gap-2">
          <Link href="/import">
            <Button variant="secondary">
              <Upload className="h-4 w-4" /> Import Nomor
            </Button>
          </Link>
          <Link href="/campaigns/new">
            <Button>
              <Plus className="h-4 w-4" /> Buat Campaign
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard index={0} label="Campaign Aktif" value={summary?.activeCampaigns ?? "-"} icon={Megaphone} tone="cyan" />
        <StatCard index={1} label="Total Nomor" value={summary ? formatNumber(summary.totalContacts) : "-"} icon={Users} tone="indigo" />
        <StatCard index={2} label="Pesan Berhasil (Hari Ini)" value={summary ? formatNumber(summary.sentToday) : "-"} icon={CheckCircle2} tone="green" />
        <StatCard index={3} label="Pesan Gagal (Hari Ini)" value={summary ? formatNumber(summary.failedToday) : "-"} icon={XCircle} tone="red" />
        <StatCard index={4} label="Persentase Delivery" value={summary ? `${summary.deliveryRate}%` : "-"} icon={Percent} tone="teal" />
        <StatCard index={5} label="Total Media" value={summary?.totalMedia ?? "-"} icon={ImageIcon} tone="amber" />
        <StatCard index={6} label="Total Template" value={summary?.totalTemplates ?? "-"} icon={FileText} tone="indigo" />
        <Link href="/whatsapp">
          <Card className="flex h-full flex-col items-center justify-center gap-2 border-dashed border-white/10 text-center transition-colors hover:bg-white/[0.04]">
            <QrCode className="h-6 w-6 text-accent-cyan" />
            <p className="text-xs font-medium text-slate-300">Hubungkan WhatsApp</p>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Terbaru</CardTitle>
          <Link href="/campaigns" className="flex items-center gap-1 text-xs font-medium text-accent-cyan hover:underline">
            Lihat semua <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>

        {recent.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">Belum ada campaign. Buat campaign pertama Anda!</p>
        ) : (
          <div className="space-y-3">
            {recent.map((c) => {
              const processed = c.sentCount + c.failedCount;
              const pct = c.totalContacts > 0 ? Math.round((processed / c.totalContacts) * 100) : 0;
              return (
                <Link
                  key={c.id}
                  href={`/campaigns/${c.id}`}
                  className="block rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05]"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{c.name}</p>
                      <p className="text-xs text-slate-500">{dayjs(c.createdAt).format("DD MMM YYYY, HH:mm")}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <ProgressBar percentage={pct} />
                  <div className="mt-1.5 flex justify-between text-xs text-slate-500">
                    <span>{c.sentCount} berhasil · {c.failedCount} gagal</span>
                    <span>{pct}%</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
