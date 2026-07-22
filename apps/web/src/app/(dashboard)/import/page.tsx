"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ClipboardPaste, FileUp, CheckCircle2, AlertTriangle, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { apiClient, apiErrorMessage } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

type Mode = "manual" | "file";

interface ImportSummary {
  totalRaw: number;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
}

export default function ImportPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("manual");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  async function handleSubmit() {
    if (!name.trim()) return toast.error("Nama daftar kontak wajib diisi");
    setLoading(true);
    setSummary(null);
    try {
      if (mode === "manual") {
        if (!text.trim()) return toast.error("Masukkan minimal 1 nomor");
        const res = await apiClient.post("/contacts/import/manual", { name, text });
        setSummary(res.data.data.summary);
      } else {
        if (!file) return toast.error("Pilih file terlebih dahulu");
        const form = new FormData();
        form.append("file", file);
        form.append("name", name);
        const res = await apiClient.post("/contacts/import/file", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSummary(res.data.data.summary);
      }
      toast.success("Kontak berhasil diimport");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Import Nomor</h1>
        <p className="text-sm text-slate-500">
          Import hingga 1.000 nomor per campaign. Nomor otomatis dibersihkan, divalidasi, dan duplikat dihapus.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sumber Kontak</CardTitle>
        </CardHeader>

        <div className="mb-4 flex gap-2 rounded-xl bg-white/[0.03] p-1">
          <TabButton active={mode === "manual"} onClick={() => setMode("manual")} icon={ClipboardPaste} label="Copy Paste" />
          <TabButton active={mode === "file"} onClick={() => setMode("file")} icon={FileUp} label="Upload File" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">Nama Daftar Kontak</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Prospek Juli 2026"
              className="input-field"
            />
          </div>

          {mode === "manual" ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Daftar Nomor</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                placeholder={"085735123456\n+6285735123456\n6285735123456\n... (satu nomor per baris)"}
                className="input-field resize-none font-mono text-xs"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">File (.txt, .csv, .xlsx, .pdf)</label>
              <FileDropzone
                accept=".txt,.csv,.xlsx,.xls,.pdf"
                hint="Maksimal 10MB — nomor akan diekstrak otomatis dari file"
                onFile={(f) => setFile(f)}
              />
              {file && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-accent-cyan">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {file.name}
                </p>
              )}
            </div>
          )}

          <Button onClick={handleSubmit} loading={loading} className="w-full">
            Import Kontak
          </Button>
        </div>
      </Card>

      {summary && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Import</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryStat label="Total Terbaca" value={summary.totalRaw} />
              <SummaryStat label="Valid" value={summary.validCount} tone="text-accent-green" />
              <SummaryStat label="Duplikat" value={summary.duplicateCount} tone="text-amber-400" />
              <SummaryStat label="Tidak Valid" value={summary.invalidCount} tone="text-red-400" />
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => router.push("/campaigns/new")}>
                Lanjut Buat Campaign
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      <Card className="border-white/[0.05] bg-white/[0.02]">
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          Format nomor yang didukung: 08xx, +628xx, 628xx, 8xx — semua otomatis dinormalisasi ke format 628xx.
        </p>
      </Card>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Copy; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all",
        active ? "bg-brand-gradient text-white shadow-glow" : "text-slate-400 hover:text-slate-200"
      )}
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-xl bg-white/[0.02] p-3 text-center">
      <p className={cn("text-xl font-bold", tone ?? "text-white")}>{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">{label}</p>
    </div>
  );
}
