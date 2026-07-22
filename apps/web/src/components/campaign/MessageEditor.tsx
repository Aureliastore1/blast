"use client";

import { useRef, useState } from "react";
import { Bold, Italic, Strikethrough, List, ListOrdered, Link2, Smile, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const EMOJIS = ["😀", "👍", "🔥", "🎉", "💬", "📢", "✅", "⏰", "🙏", "❤️"];
const VARIABLES = ["nama", "nomor", "tanggal"];

function wrapSelection(value: string, start: number, end: number, prefix: string, suffix = prefix) {
  return value.slice(0, start) + prefix + value.slice(start, end) + suffix + value.slice(end);
}

function renderPreview(text: string): string {
  return text
    .replace(/\*(.+?)\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/~(.+?)~/g, "<del>$1</del>")
    .replace(/```(.+?)```/g, "<code>$1</code>")
    .replace(/\n/g, "<br/>");
}

export function MessageEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  function applyFormat(prefix: string, suffix = prefix) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd } = el;
    const next = wrapSelection(value, selectionStart, selectionEnd, prefix, suffix);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectionStart + prefix.length, selectionEnd + prefix.length);
    });
  }

  function insertAtCursor(text: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd } = el;
    const next = value.slice(0, selectionStart) + text + value.slice(selectionEnd);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectionStart + text.length, selectionStart + text.length);
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-base-950/40">
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-white/[0.02] px-2 py-1.5">
        <ToolbarButton icon={Bold} onClick={() => applyFormat("*")} title="Bold" />
        <ToolbarButton icon={Italic} onClick={() => applyFormat("_")} title="Italic" />
        <ToolbarButton icon={Strikethrough} onClick={() => applyFormat("~")} title="Strikethrough" />
        <ToolbarButton icon={List} onClick={() => insertAtCursor("\n• ")} title="Bullet list" />
        <ToolbarButton icon={ListOrdered} onClick={() => insertAtCursor("\n1. ")} title="Numbered list" />
        <ToolbarButton icon={Link2} onClick={() => insertAtCursor("https://")} title="Link" />

        <div className="relative">
          <ToolbarButton icon={Smile} onClick={() => setShowEmoji((s) => !s)} title="Emoji" />
          {showEmoji && (
            <div className="absolute left-0 top-full z-10 mt-1 flex flex-wrap gap-1 rounded-xl border border-white/10 bg-base-800 p-2 shadow-soft">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  className="rounded-lg p-1.5 text-lg hover:bg-white/10"
                  onClick={() => {
                    insertAtCursor(e);
                    setShowEmoji(false);
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mx-1 h-4 w-px bg-white/10" />

        {VARIABLES.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => insertAtCursor(`{${v}}`)}
            className="rounded-lg bg-accent-indigo/10 px-2 py-1 text-xs font-medium text-accent-indigo ring-1 ring-inset ring-accent-indigo/20 hover:bg-accent-indigo/20"
          >
            {`{${v}}`}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowPreview((s) => !s)}
          className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white/5 hover:text-slate-200"
        >
          {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showPreview ? "Sembunyikan Preview" : "Preview"}
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={7}
        maxLength={4096}
        placeholder="Tulis pesan Anda di sini... Gunakan {nama}, {nomor}, {tanggal} untuk personalisasi."
        className="w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600"
      />

      {showPreview && (
        <div className="border-t border-white/10 bg-white/[0.02] px-4 py-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Preview</p>
          <div
            className="max-w-[80%] rounded-2xl rounded-tl-sm bg-[#005C4B] px-3 py-2 text-sm text-white shadow-soft"
            dangerouslySetInnerHTML={{ __html: renderPreview(value) || "<span class='text-white/40'>Pesan kosong</span>" }}
          />
        </div>
      )}

      <div className={cn("flex justify-end border-t border-white/10 px-4 py-1.5 text-xs", value.length > 4000 ? "text-amber-400" : "text-slate-500")}>
        {value.length} / 4096 karakter
      </div>
    </div>
  );
}

function ToolbarButton({ icon: Icon, onClick, title }: { icon: typeof Bold; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-100"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
