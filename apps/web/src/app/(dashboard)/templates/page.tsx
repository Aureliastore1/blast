"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, FileText, X } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MessageEditor } from "@/components/campaign/MessageEditor";
import { apiClient, apiErrorMessage } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  usageCount: number;
}

const CATEGORIES = ["PROMOSI", "REMINDER", "FOLLOW_UP", "TAGIHAN", "CUSTOM"];
const CATEGORY_LABEL: Record<string, string> = {
  PROMOSI: "Promosi",
  REMINDER: "Reminder",
  FOLLOW_UP: "Follow Up",
  TAGIHAN: "Tagihan",
  CUSTOM: "Custom",
};

export default function TemplatesPage() {
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [filter, setFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TemplateItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("CUSTOM");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await apiClient.get("/templates", { params: filter !== "ALL" ? { category: filter } : {} });
      setItems(res.data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  function openCreate() {
    setEditing(null);
    setName("");
    setCategory("CUSTOM");
    setContent("");
    setFormOpen(true);
  }

  function openEdit(t: TemplateItem) {
    setEditing(t);
    setName(t.name);
    setCategory(t.category);
    setContent(t.content);
    setFormOpen(true);
  }

  async function handleSave() {
    if (!name.trim() || !content.trim()) return toast.error("Nama dan isi template wajib diisi");
    setSaving(true);
    try {
      if (editing) {
        await apiClient.put(`/templates/${editing.id}`, { name, category, content });
        toast.success("Template diperbarui");
      } else {
        await apiClient.post("/templates", { name, category, content });
        toast.success("Template dibuat");
      }
      setFormOpen(false);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus template ini?")) return;
    try {
      await apiClient.delete(`/templates/${id}`);
      toast.success("Template dihapus");
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Template Pesan</h1>
          <p className="text-sm text-slate-500">Simpan pesan yang sering digunakan sebagai template</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Template Baru
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "ALL"} onClick={() => setFilter("ALL")} label="Semua" />
        {CATEGORIES.map((c) => (
          <FilterChip key={c} active={filter === c} onClick={() => setFilter(c)} label={CATEGORY_LABEL[c]} />
        ))}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">Memuat...</p>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-12 text-center">
          <FileText className="h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-500">Belum ada template</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <Card key={t.id} className="flex flex-col">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <Badge tone="accent">{CATEGORY_LABEL[t.category]}</Badge>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-slate-200">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="line-clamp-4 flex-1 text-xs text-slate-400">{t.content}</p>
              <p className="mt-3 text-[10px] text-slate-600">Dipakai {t.usageCount}x</p>
            </Card>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-card w-full max-w-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">{editing ? "Edit Template" : "Template Baru"}</h2>
              <button onClick={() => setFormOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Nama Template</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Kategori</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABEL[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">Isi Pesan</label>
                <MessageEditor value={content} onChange={setContent} />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setFormOpen(false)}>
                  Batal
                </Button>
                <Button onClick={handleSave} loading={saving}>
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
        active ? "bg-brand-gradient text-white shadow-glow" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
      )}
    >
      {label}
    </button>
  );
}
