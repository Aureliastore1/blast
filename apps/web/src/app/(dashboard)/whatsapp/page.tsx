"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Smartphone, RefreshCcw, LogOut, CheckCircle2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { apiClient, apiErrorMessage } from "@/lib/apiClient";
import { useWAStore } from "@/store/waStore";

export default function WhatsAppConnectPage() {
  const { status, qr, phoneNumber, profileName, setStatus } = useWAStore();
  const [connecting, setConnecting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    apiClient
      .get("/whatsapp/status")
      .then((res) => setStatus(res.data.data))
      .catch(() => undefined);
  }, [setStatus]);

  async function handleConnect() {
    setConnecting(true);
    try {
      await apiClient.post("/whatsapp/connect");
      toast.success("Memulai koneksi... tunggu QR Code muncul");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setConnecting(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await apiClient.post("/whatsapp/logout");
      toast.success("Berhasil logout dari WhatsApp");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Koneksi WhatsApp</h1>
        <p className="text-sm text-slate-500">Hubungkan akun WhatsApp Anda dengan memindai QR Code, seperti WhatsApp Web.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status Perangkat</CardTitle>
          <StatusBadge status={status} />
        </CardHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <AnimatePresence mode="wait">
            {status === "CONNECTED" ? (
              <motion.div
                key="connected"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-green/10 ring-4 ring-accent-green/20">
                  <CheckCircle2 className="h-12 w-12 text-accent-green" />
                </div>
                <div>
                  <p className="font-semibold text-white">{profileName ?? "WhatsApp Terhubung"}</p>
                  <p className="text-sm text-slate-500">+{phoneNumber}</p>
                </div>
              </motion.div>
            ) : qr ? (
              <motion.div
                key="qr"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="rounded-2xl bg-white p-4 shadow-glow">
                  <Image src={qr} alt="WhatsApp QR Code" width={260} height={260} unoptimized />
                </div>
                <p className="max-w-xs text-center text-xs text-slate-500">
                  Buka WhatsApp di HP Anda → Perangkat Tertaut → Tautkan Perangkat, lalu pindai kode ini.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 text-center"
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5 ring-1 ring-inset ring-white/10">
                  {status === "CONNECTING" || status === "RECONNECTING" ? (
                    <Loader2 className="h-10 w-10 animate-spin text-accent-cyan" />
                  ) : (
                    <QrCode className="h-10 w-10 text-slate-500" />
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  {status === "CONNECTING" || status === "RECONNECTING"
                    ? "Sedang menyiapkan sesi..."
                    : "Belum ada koneksi aktif"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3">
            {status === "CONNECTED" ? (
              <Button variant="danger" onClick={handleLogout} loading={loggingOut}>
                <LogOut className="h-4 w-4" /> Logout Perangkat
              </Button>
            ) : (
              <Button onClick={handleConnect} loading={connecting}>
                <RefreshCcw className="h-4 w-4" /> {qr ? "Muat Ulang QR" : "Hubungkan WhatsApp"}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {status === "CONNECTED" && (
        <Card>
          <CardHeader>
            <CardTitle>Info Perangkat</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoRow icon={Smartphone} label="Nomor" value={phoneNumber ? `+${phoneNumber}` : "-"} />
            <InfoRow icon={CheckCircle2} label="Nama Akun" value={profileName ?? "-"} />
          </div>
        </Card>
      )}

      <Card className="border-amber-500/20 bg-amber-500/[0.03]">
        <p className="text-xs leading-relaxed text-amber-200/80">
          <strong>Catatan keamanan:</strong> iNaedaa Blast tidak dapat menjamin akun Anda kebal dari pembatasan
          WhatsApp. Sistem menerapkan praktik terbaik (delay acak, batas pesan/jam, retry bertahap, auto-pause saat
          kegagalan tinggi) untuk memperkecil risiko, namun kebijakan akhir tetap berada di tangan WhatsApp.
        </p>
      </Card>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Smartphone; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3">
      <Icon className="h-4 w-4 text-slate-500" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-medium text-slate-200">{value}</p>
      </div>
    </div>
  );
}
