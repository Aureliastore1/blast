"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Pause, Square, ArrowLeft, Clock, Users, CheckCircle2, XCircle, SkipForward } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { apiClient, apiErrorMessage } from "@/lib/apiClient";
import { useSocket } from "@/components/providers/SocketProvider";
import { formatNumber } from "@/lib/utils";

interface CampaignDetail {
  id: string;
  name: string;
  status: string;
  messageBody: string;
  totalContacts: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  minDelaySec: number;
  maxDelaySec: number;
  maxPerHour: number;
  startedAt: string | null;
  finishedAt: string | null;
  estimatedFinishAt: string | null;
  contactList: { name: string } | null;
  mediaFile: { originalName: string } | null;
  template: { name: string } | null;
}

interface ProgressPayload {
  status: string;
  totalContacts: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  processed: number;
  percentage: number;
  failureRate: number;
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const socket = useSocket();

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [progress, setProgress] = useState<ProgressPayload | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function load() {
    try {
      const res = await apiClient.get(`/campaigns/${id}`);
      setCampaign(res.data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("campaign:subscribe", id);

    const handler = (payload: ProgressPayload & { campaignId: string }) => {
      if (payload.campaignId !== id) return;
      setProgress(payload);
      if (payload.status !== campaign?.status) load();
    };

    socket.on("campaign:progress", handler);
    return () => {
      socket.emit("campaign:unsubscribe", id);
      socket.off("campaign:progress", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, id]);

  async function runAction(action: "start" | "pause" | "resume" | "cancel") {
    setActionLoading(action);
    try {
      await apiClient.post(`/campaigns/${id}/${action}`);
      toast.success("Berhasil");
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }

  if (!campaign) {
    return <p className="py-10 text-center text-sm text-slate-500">Memuat...</p>;
  }

  const processed = progress?.processed ?? campaign.sentCount + campaign.failedCount + campaign.skippedCount;
  const percentage =
    progress?.percentage ??
    (campaign.totalContacts > 0 ? Math.round((processed / campaign.totalContacts) * 100) : 0);
  const sentCount = progress?.sentCount ?? campaign.sentCount;
  const failedCount = progress?.failedCount ?? campaign.failedCount;
  const skippedCount = progress?.skippedCount ?? campaign.skippedCount;
  const status = progress?.status ?? campaign.status;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={() => router.push("/campaigns")} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Campaign
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{campaign.name}</h1>
          <p className="text-sm text-slate-500">
            {campaign.contactList?.name ?? "-"} · dibuat {dayjs(campaign.startedAt ?? undefined).isValid() ? dayjs(campaign.startedAt).format("DD MMM YYYY") : "-"}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress Pengiriman</CardTitle>
        </CardHeader>

        <div className="mb-3 flex items-end justify-between">
          <span className="text-3xl font-bold text-white">{percentage}%</span>
          <span className="text-xs text-slate-500">
            {status === "RUNNING" ? "Sedang mengirim..." : status === "PAUSED" ? "Dijeda" : status}
          </span>
        </div>
        <ProgressBar
          percentage={percentage}
          tone={status === "COMPLETED" ? "success" : status === "FAILED" ? "error" : "brand"}
          className="h-3"
        />

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat icon={Users} label="Total" value={formatNumber(campaign.totalContacts)} />
          <MiniStat icon={CheckCircle2} label="Berhasil" value={formatNumber(sentCount)} tone="text-accent-green" />
          <MiniStat icon={XCircle} label="Gagal" value={formatNumber(failedCount)} tone="text-red-400" />
          <MiniStat icon={SkipForward} label="Dilewati" value={formatNumber(skippedCount)} tone="text-slate-400" />
        </div>

        {campaign.estimatedFinishAt && status === "RUNNING" && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" /> Estimasi selesai: {dayjs(campaign.estimatedFinishAt).format("DD MMM YYYY, HH:mm")}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {(status === "DRAFT" || status === "PAUSED") && (
            <Button onClick={() => runAction(status === "DRAFT" ? "start" : "resume")} loading={actionLoading === "start" || actionLoading === "resume"}>
              <Play className="h-4 w-4" /> {status === "DRAFT" ? "Jalankan Campaign" : "Lanjutkan"}
            </Button>
          )}
          {status === "RUNNING" && (
            <Button variant="secondary" onClick={() => runAction("pause")} loading={actionLoading === "pause"}>
              <Pause className="h-4 w-4" /> Jeda
            </Button>
          )}
          {(status === "RUNNING" || status === "PAUSED") && (
            <Button variant="danger" onClick={() => runAction("cancel")} loading={actionLoading === "cancel"}>
              <Square className="h-4 w-4" /> Batalkan
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detail Pesan</CardTitle>
        </CardHeader>
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#005C4B] px-3.5 py-2.5 text-sm text-white shadow-soft">
          {campaign.messageBody}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500 sm:grid-cols-3">
          <p>Media: {campaign.mediaFile?.originalName ?? "-"}</p>
          <p>Template: {campaign.template?.name ?? "-"}</p>
          <p>Delay: {campaign.minDelaySec}-{campaign.maxDelaySec} detik</p>
          <p>Maks/jam: {campaign.maxPerHour}</p>
        </div>
      </Card>

      {status === "RUNNING" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.04] px-4 py-3 text-xs text-accent-cyan"
        >
          <span className="h-2 w-2 animate-pulse-glow rounded-full bg-accent-cyan" />
          Progress diperbarui secara realtime melalui koneksi langsung
        </motion.div>
      )}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl bg-white/[0.02] p-3">
      <Icon className={`h-4 w-4 ${tone ?? "text-slate-500"}`} />
      <p className={`mt-1.5 text-lg font-bold ${tone ?? "text-white"}`}>{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}
