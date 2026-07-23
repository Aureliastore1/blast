"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, CheckCircle2, Info } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { apiClient, apiErrorMessage } from "@/lib/apiClient";
import { useWAStore } from "@/store/waStore";

export default function WhatsAppConnectPage() {
  const { status, phoneNumber, profileName, setStatus } = useWAStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/whatsapp/status")
      .then((res) => setStatus(res.data.data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [setStatus]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Koneksi WhatsApp Business Cloud API</h1>
        <p className="text-sm text-slate-500">
          Aplikasi ini menggunakan WhatsApp Business Cloud API dari Meta. Nomor bisnis tersambung secara permanen melalui kredensial API yang sudah dikonfigurasi.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status Koneksi</CardTitle>
          <StatusBadge status={status} />
        </CardHeader>

        <div className="flex flex-col items-center gap-6 py-8">
          <AnimatePresence mode="wait">
            {!loading && status === "CONNECTED" ? (
              <motion.div
                key="connected"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-accent-green/10 ring-4 ring-accent-green/20">
                  <CheckCircle2 className="h-14 w-14 text-accent-green" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">WhatsApp Siap Digunakan</p>
                  <p className="text-sm text-slate-500 mt-2">
                    {profileName || "WhatsApp Cloud API"} — Nomor Bisnis
                  </p>
                  {phoneNumber && (
                    <p className="text-xs text-slate-400 mt-1">ID: {phoneNumber}</p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/5 ring-1 ring-inset ring-white/10">
                  <div className="animate-pulse">
                    <CheckCircle2 className="h-14 w-14 text-slate-600" />
                  </div>
                </div>
                <p className="text-sm text-slate-500">Memeriksa status koneksi...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {!loading && status === "CONNECTED" && (
        <Card>
          <CardHeader>
            <CardTitle>Informasi Koneksi</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 gap-4 text-sm">
            <InfoRow 
              icon={Smartphone} 
              label="Tipe Koneksi" 
              value="WhatsApp Cloud API (Permanent)" 
            />
            <InfoRow 
              icon={CheckCircle2} 
              label="Profil" 
              value={profileName || "Cloud API"} 
            />
            {phoneNumber && (
              <InfoRow 
                icon={Smartphone} 
                label="Nomor Bisnis ID" 
                value={phoneNumber} 
              />
            )}
          </div>
        </Card>
      )}

      <Card className="border-blue-500/20 bg-blue-500/[0.03]">
        <div className="flex gap-3">
          <Info className="h-5 w-5 flex-shrink-0 text-blue-400 mt-0.5" />
          <div className="space-y-2 text-xs leading-relaxed text-blue-200/80">
            <p>
              <strong>Cloud API Mode:</strong> Nomor bisnis WhatsApp Anda tersambung secara permanen melalui API resmi dari Meta. Tidak perlu scan QR Code lagi.
            </p>
            <p>
              <strong>Kepatuhan Meta:</strong> Sistem menerapkan praktik terbaik (delay acak, batas pesan/jam, retry bertahap) sesuai panduan WhatsApp Business Platform untuk menjaga kesehatan akun.
            </p>
            <p>
              <strong>Template Messages:</strong> Pesan ke kontak baru dikirim menggunakan template WhatsApp yang sudah disetujui Meta untuk mencegah spam classification.
            </p>
          </div>
        </div>
      </Card>

      {!loading && status === "CONNECTED" && (
        <Card className="border-accent-green/20 bg-accent-green/[0.03]">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-accent-green mt-0.5" />
            <p className="text-xs leading-relaxed text-accent-green/80">
              <strong>Status Aktif:</strong> Nomor bisnis siap menerima dan mengirim pesan. Anda dapat langsung membuat dan menjalankan campaign broadcast.
            </p>
          </div>
        </Card>
      )}
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

