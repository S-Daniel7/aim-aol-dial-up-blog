"use client";

import { useEffect, useState } from "react";

type SiteLink = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string;
  order_index: number;
};

const BLANK = { title: "", url: "", description: "", category: "links", order_index: 0 };

function LinkForm({
  initial,
  onSave,
  onCancel,
  busy,
  label,
}: {
  initial: typeof BLANK;
  onSave: (data: typeof BLANK) => void;
  onCancel?: () => void;
  busy: boolean;
  label: string;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof BLANK, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  const inputClass =
    "w-full border-2 border-border bg-page-bg px-2 py-1.5 font-mono text-sm text-text focus:outline-none focus:border-accent";
  const labelClass =
    "block font-mono text-[10px] uppercase tracking-widest text-muted mb-0.5";

  return (
    <div className="space-y-2 border border-border bg-surface-2 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-mono-chat)" }}>title *</label>
          <input type="text" maxLength={80} value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }} />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-mono-chat)" }}>url *</label>
          <input type="url" maxLength={500} value={form.url}
            onChange={(e) => set("url", e.target.value)}
            placeholder="https://"
            className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }} />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-mono-chat)" }}>category</label>
          <input type="text" maxLength={40} value={form.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="links"
            className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }} />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-mono-chat)" }}>order</label>
          <input type="number" value={form.order_index}
            onChange={(e) => set("order_index", parseInt(e.target.value) || 0)}
            className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }} />
        </div>
      </div>
      <div>
        <label className={labelClass} style={{ fontFamily: "var(--font-mono-chat)" }}>description</label>
        <input type="text" maxLength={200} value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          className={inputClass} style={{ fontFamily: "var(--font-mono-chat)" }} />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          disabled={busy || !form.title.trim() || !form.url.trim()}
          onClick={() => onSave(form)}
          className="border-2 border-border bg-accent px-4 py-1 font-mono text-sm text-accent-contrast enabled:hover:bg-accent-hover disabled:opacity-50"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          {busy ? "saving..." : label}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="font-mono text-xs text-muted hover:text-text"
            style={{ fontFamily: "var(--font-mono-chat)" }}>
            cancel
          </button>
        )}
      </div>
    </div>
  );
}

export function AdminLinks() {
  const [links, setLinks] = useState<SiteLink[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/links")
      .then((r) => r.json())
      .then((d: { links?: SiteLink[] }) => { setLinks(d.links ?? []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  async function addLink(form: typeof BLANK) {
    setAddBusy(true); setError(null);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const d = (await res.json()) as { error?: string; id?: string };
      if (!res.ok) { setError(d.error ?? "error"); return; }
      setLinks((prev) => [...prev, { ...form, id: d.id!, description: form.description || null }]);
    } finally { setAddBusy(false); }
  }

  async function saveEdit(id: string, form: typeof BLANK) {
    setEditBusy(true); setError(null);
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const d = (await res.json()) as { error?: string };
      if (!res.ok) { setError(d.error ?? "error"); return; }
      setLinks((prev) => prev.map((l) => l.id === id ? { ...l, ...form, description: form.description || null } : l));
      setEditId(null);
    } finally { setEditBusy(false); }
  }

  async function deleteLink(id: string) {
    if (!confirm("Delete this link?")) return;
    const res = await fetch(`/api/links/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  const grouped = links.reduce<Record<string, SiteLink[]>>((acc, l) => {
    (acc[l.category] ??= []).push(l);
    return acc;
  }, {});

  const inputStyle = { fontFamily: "var(--font-mono-chat)" };

  if (!loaded) return <p className="font-mono text-sm text-muted" style={inputStyle}>loading...</p>;

  return (
    <div className="space-y-8">
      {/* Add new */}
      <div className="border-2 border-border bg-surface" style={{ boxShadow: "4px 4px 0 0 var(--border)" }}>
        <div className="border-b-2 border-border bg-title-bar px-3 py-2 font-heading text-lg text-title-bar-text"
          style={{ fontFamily: "var(--font-heading)" }}>
          add link
        </div>
        <div className="p-4">
          <LinkForm initial={BLANK} onSave={(f) => void addLink(f)} busy={addBusy} label="add" />
          {error && <p className="mt-2 font-mono text-xs text-accent" style={inputStyle}>!! {error}</p>}
        </div>
      </div>

      {/* Existing links */}
      {Object.keys(grouped).length > 0 && (
        <div className="border-2 border-border bg-surface" style={{ boxShadow: "4px 4px 0 0 var(--border)" }}>
          <div className="border-b-2 border-border bg-title-bar px-3 py-2 font-heading text-lg text-title-bar-text"
            style={{ fontFamily: "var(--font-heading)" }}>
            all links ({links.length})
          </div>
          <div className="divide-y divide-border">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <p className="bg-surface-2 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted" style={inputStyle}>
                  {cat}
                </p>
                {items.map((link) => (
                  <div key={link.id} className="px-3 py-2">
                    {editId === link.id ? (
                      <LinkForm
                        initial={{ title: link.title, url: link.url, description: link.description ?? "", category: link.category, order_index: link.order_index }}
                        onSave={(f) => void saveEdit(link.id, f)}
                        onCancel={() => setEditId(null)}
                        busy={editBusy}
                        label="save"
                      />
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-sm text-link truncate" style={inputStyle}>{link.title}</p>
                          <p className="font-mono text-[10px] text-muted truncate" style={inputStyle}>{link.url}</p>
                          {link.description && (
                            <p className="font-mono text-xs text-text mt-0.5" style={inputStyle}>{link.description}</p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button onClick={() => setEditId(link.id)}
                            className="font-mono text-[10px] text-muted hover:text-accent" style={inputStyle}>edit</button>
                          <button onClick={() => void deleteLink(link.id)}
                            className="font-mono text-[10px] text-muted hover:text-accent" style={inputStyle}>delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
