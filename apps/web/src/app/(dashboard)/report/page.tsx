"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Percent, Megaphone } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { apiClient, apiErrorMessage } from "@/lib/apiClient";

interface DailyPoint {
  date: string;
  sent: number;
  failed: number;
}
interface MonthlyPoint {
  month: string;
  campaigns: number;
  sent: number;
  failed: number;
}
interface Rates {
  totalCampaigns: number;
  successRate: number;
  failureRate: number;
  deliveryRate: number;
}

const TOOLTIP_STYLE = {
  background: "#111827",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  fontSize: 12,
  color: "#F1F5F9",
};

export default function ReportPage() {
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [monthly, setMonthly] = useState<MonthlyPoint[]>([]);
  const [rates, setRates] = useState<Rates | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get("/reports/daily", { params: { days: 14 } }),
      apiClient.get("/reports/monthly", { params: { months: 6 } }),
      apiClient.get("/reports/rates"),
    ])
      .then(([d, m, r]) => {
        setDaily(d.data.data);
        setMonthly(m.data.data);
        setRates(r.data.data);
      })
      .catch((err) => toast.error(apiErrorMessage(err)));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Report</h1>
        <p className="text-sm text-slate-500">Analitik performa pengiriman campaign Anda</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <RateCard icon={Megaphone} label="Total Campaign" value={rates?.totalCampaigns ?? 0} tone="text-accent-indigo" />
        <RateCard icon={TrendingUp} label="Success Rate" value={`${rates?.successRate ?? 0}%`} tone="text-accent-green" />
        <RateCard icon={TrendingDown} label="Failure Rate" value={`${rates?.failureRate ?? 0}%`} tone="text-red-400" />
        <RateCard icon={Percent} label="Delivery Rate" value={`${rates?.deliveryRate ?? 0}%`} tone="text-accent-cyan" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grafik Harian (14 hari terakhir)</CardTitle>
        </CardHeader>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily}>
              <defs>
                <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="sent" name="Berhasil" stroke="#22C55E" fill="url(#sentGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="failed" name="Gagal" stroke="#EF4444" fill="url(#failedGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grafik Bulanan (6 bulan terakhir)</CardTitle>
        </CardHeader>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="sent" name="Berhasil" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              <Bar dataKey="failed" name="Gagal" fill="#EF4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function RateCard({ icon: Icon, label, value, tone }: { icon: typeof Megaphone; label: string; value: string | number; tone: string }) {
  return (
    <Card>
      <Icon className={`h-5 w-5 ${tone}`} />
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </Card>
  );
}
