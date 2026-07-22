"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Trash2, Users, Upload, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { apiClient, apiErrorMessage } from "@/lib/apiClient";
import { formatNumber } from "@/lib/utils";

interface ContactListItem {
  id: string;
  name: string;
  source: string | null;
  totalCount: number;
  createdAt: string;
  _count: { contacts: number };
}

interface ContactDetail {
  id: string;
  phoneNumber: string;
  name: string | null;
}

export default function ContactsPage() {
  const [items, setItems] = useState<ContactListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [contacts, setContacts] = useState<ContactDetail[]>([]);

  async function load() {
    setLoading(true);
    try {
      const res = await apiClient.get("/contacts", { params: { search: search || undefined, limit: 50 } });
      setItems(res.data.data.items);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function toggleExpand(id: string) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    try {
      const res = await apiClient.get(`/contacts/${id}`);
      setContacts(res.data.data.contacts);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus daftar kontak ini?")) return;
    try {
      await apiClient.delete(`/contacts/${id}`);
      toast.success("Daftar kontak dihapus");
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Contacts</h1>
          <p className="text-sm text-slate-500">Kelola daftar kontak yang telah Anda import</p>
        </div>
        <Link href="/import">
          <Button>
            <Upload className="h-4 w-4" /> Import Baru
          </Button>
        </Link>
      </div>

      <Card>
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama daftar kontak..."
            className="input-field pl-10"
          />
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-slate-500">Memuat...</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Users className="h-8 w-8 text-slate-600" />
            <p className="text-sm text-slate-500">Belum ada daftar kontak</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/[0.05] bg-white/[0.02]">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatNumber(item._count.contacts)} nomor · {item.source ?? "manual"} · {dayjs(item.createdAt).format("DD MMM YYYY")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    >
                      {expanded === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {expanded === item.id && (
                  <div className="max-h-64 overflow-y-auto border-t border-white/[0.05] p-3">
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                      {contacts.map((c) => (
                        <div key={c.id} className="rounded-lg bg-white/[0.02] px-2.5 py-1.5 text-xs text-slate-400">
                          +{c.phoneNumber} {c.name ? `— ${c.name}` : ""}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
