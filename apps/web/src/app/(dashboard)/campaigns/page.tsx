"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Megaphone } from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { apiClient, apiErrorMessage } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

interface CampaignItem {
  id: string;
  name: string;
  status: string;
  totalContacts: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  contactList?: { name: string } | null;
}

const STATUS_FILTERS = ["ALL", "DRAFT", "RUNNING", "PAUSED", "COMPLETED", "FAILED", "CANCELLED"];

export default function CampaignsPage() {
  const [items, setItems] = useState<CampaignItem[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiClient.get("/campaigns", {
          params: { search: search || undefined, status: status !== "ALL" ? status : undefined, limit: 50 },
        });
        setItems(res.data.data.items);
      } catch (err) {
        toast.error(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Campaign</h1>
          <p className="text-sm text-slate-500">Kelola seluruh campaign WhatsApp Anda</p>
        </div>
        <Link href="/campaigns/new">
          <Button>
            <Plus className="h-4 w-4" /> Buat Campaign
          </Button>
        </Link>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama campaign..."
              className="input-field pl-10"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field sm:w-48">
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "Semua Status" : s}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-slate-500">Memuat...</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Megaphone className="h-8 w-8 text-slate-600" />
            <p className="text-sm text-slate-500">Belum ada campaign</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((c) => {
              const processed = c.sentCount + c.failedCount;
              const pct = c.totalContacts > 0 ? Math.round((processed / c.totalContacts) * 100) : 0;
              return (
                <Link
                  key={c.id}
                  href={`/campaigns/${c.id}`}
                  className="block rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05]"
                >
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{c.name}</p>
                      <p className="text-xs text-slate-500">
                        {c.contactList?.name ?? "-"} · {dayjs(c.createdAt).format("DD MMM YYYY, HH:mm")}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <ProgressBar
                    percentage={pct}
                    tone={c.status === "COMPLETED" ? "success" : c.status === "FAILED" ? "error" : "brand"}
                  />
                  <div className="mt-1.5 flex justify-between text-xs text-slate-500">
                    <span>
                      {c.totalContacts} nomor · {c.sentCount} berhasil · {c.failedCount} gagal
                    </span>
                    <span className={cn(pct === 100 && "text-accent-green")}>{pct}%</span>
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
