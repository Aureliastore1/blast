"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, FileSpreadsheet, FileText as PdfIcon, History as HistoryIcon } from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { apiClient, apiErrorMessage } from "@/lib/apiClient";
import { formatDuration } from "@/lib/utils";

interface HistoryItem {
  id: string;
  name: string;
  status: string;
  totalContacts: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  durationSeconds: number | null;
  contactList: { name: string } | null;
  mediaFile: { originalName: string } | null;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiClient.get("/history", {
          params: { search: search || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined, limit: 50 },
        });
        setItems(res.data.data.items);
      } catch (err) {
        toast.error(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search, dateFrom, dateTo]);

  async function handleExport(id: string, type: "excel" | "pdf") {
    try {
      const res = await apiClient.get(`/history/${id}/export/${type}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `campaign-${id}.${type === "excel" ? "xlsx" : "pdf"}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Gagal mengunduh laporan");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">History</h1>
        <p className="text-sm text-slate-500">Riwayat seluruh campaign yang pernah dijalankan</p>
      </div>

      <Card>
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari campaign..." className="input-field pl-10" />
          </div>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field" />
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-slate-500">Memuat...</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <HistoryIcon className="h-8 w-8 text-slate-600" />
            <p className="text-sm text-slate-500">Belum ada riwayat campaign</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs text-slate-500">
                  <th className="pb-2 font-medium">Campaign</th>
                  <th className="pb-2 font-medium">Tanggal</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Berhasil</th>
                  <th className="pb-2 font-medium">Gagal</th>
                  <th className="pb-2 font-medium">Durasi</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Export</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-3">
                      <Link href={`/campaigns/${item.id}`} className="font-medium text-slate-200 hover:text-accent-cyan">
                        {item.name}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-400">{dayjs(item.createdAt).format("DD/MM/YY HH:mm")}</td>
                    <td className="py-3 text-slate-400">{item.totalContacts}</td>
                    <td className="py-3 text-accent-green">{item.sentCount}</td>
                    <td className="py-3 text-red-400">{item.failedCount}</td>
                    <td className="py-3 text-slate-400">{formatDuration(item.durationSeconds)}</td>
                    <td className="py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleExport(item.id, "excel")} title="Export Excel" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-accent-green">
                          <FileSpreadsheet className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleExport(item.id, "pdf")} title="Export PDF" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-red-400">
                          <PdfIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
