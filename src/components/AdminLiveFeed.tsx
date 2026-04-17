"use client";

import { getLiveFeedAuthor } from "@/lib/live-feed-author";
import type { LiveFeedEntry } from "@/lib/types";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

async function uploadLiveImage(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Upload failed");
  }
  return (data as { url: string }).url;
}

export function AdminLiveFeed() {
  const author = getLiveFeedAuthor();
  const [entries, setEntries] = useState<LiveFeedEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/live-feed", {
        cache: "no-store",
        credentials: "include",
      });
      const raw = await res.text();
      let data: { entries?: LiveFeedEntry[]; error?: string };
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        setStatus("Could not read server response (invalid JSON).");
        return;
      }
      if (!res.ok) {
        setStatus(data.error ?? `Load failed (${res.status})`);
        return;
      }
      setEntries(data.entries ?? []);
      if (data.error) {
        setStatus(data.error);
      } else {
        setStatus(null);
      }
    } catch (e) {
      setStatus(
        e instanceof Error ? e.message : "Network error loading live feed.",
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onPickNewImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadBusy(true);
    setStatus(null);
    try {
      const url = await uploadLiveImage(file);
      setPendingImageUrl(url);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadBusy(false);
    }
  }

  async function onPickEditImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadBusy(true);
    setStatus(null);
    try {
      const url = await uploadLiveImage(file);
      setEditImageUrl(url);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadBusy(false);
    }
  }

  async function onPost(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim().replace(/\s+/g, " ");
    if (!text && !pendingImageUrl) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/live-feed", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: text,
          imageUrl: pendingImageUrl,
        }),
      });
      const raw = await res.text();
      let data: { error?: string };
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        setStatus("Invalid response from server.");
        return;
      }
      if (!res.ok) {
        setStatus(data.error ?? "Post failed");
        return;
      }
      setDraft("");
      setPendingImageUrl(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  function startEdit(e: LiveFeedEntry) {
    setEditingId(e.id);
    setEditBody(e.body);
    setEditImageUrl(e.image_url);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditBody("");
    setEditImageUrl(null);
  }

  async function saveEdit(id: string) {
    const text = editBody.trim().replace(/\s+/g, " ");
    if (!text && !editImageUrl) {
      setStatus("Add caption text and/or an image before saving.");
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/live-feed/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: text,
          imageUrl: editImageUrl,
        }),
      });
      const raw = await res.text();
      let data: { error?: string };
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        setStatus("Invalid response from server.");
        return;
      }
      if (!res.ok) {
        setStatus(data.error ?? "Save failed");
        return;
      }
      cancelEdit();
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this line from the live feed?")) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/live-feed/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const raw = await res.text();
      let data: { error?: string };
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        setStatus("Invalid response from server.");
        return;
      }
      if (!res.ok) {
        setStatus(data.error ?? "Delete failed");
        return;
      }
      if (editingId === id) cancelEdit();
      await load();
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = Boolean(draft.trim() || pendingImageUrl);

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted">
        Posts as <strong className="text-text">{author}</strong>. Timestamps
        are stored in UTC and shown in Eastern on the public page.
      </p>

      <form
        onSubmit={onPost}
        className="border-2 border-border bg-surface p-4"
      >
        <label className="block text-sm font-semibold text-text">
          New post
        </label>
        <p className="mb-2 text-xs text-muted">
          Text and/or image. Image uploads go to your Supabase{" "}
          <code className="border border-border bg-page-bg px-1">blog-images</code>{" "}
          bucket.
        </p>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Caption / line of text…"
          className="mb-3 w-full border-2 border-border bg-page-bg px-3 py-2 text-sm text-text"
        />
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <label className="inline-block cursor-pointer border-2 border-border bg-surface-2 px-3 py-2 text-sm hover:bg-page-bg disabled:opacity-50">
            {uploadBusy ? "Uploading…" : "+ add image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadBusy}
              onChange={onPickNewImage}
            />
          </label>
          {pendingImageUrl ? (
            <button
              type="button"
              onClick={() => setPendingImageUrl(null)}
              className="text-xs text-accent underline"
            >
              Remove image
            </button>
          ) : null}
        </div>
        {pendingImageUrl ? (
          <div className="relative mb-3 inline-block max-w-xs border-2 border-border bg-page-bg p-1">
            <Image
              src={pendingImageUrl}
              alt=""
              width={280}
              height={200}
              className="h-auto max-h-48 w-full object-contain"
            />
          </div>
        ) : null}
        <button
          type="submit"
          disabled={busy || !canSubmit}
          className="border-2 border-border bg-accent px-4 py-2 text-sm text-accent-contrast enabled:hover:bg-accent-hover disabled:opacity-50"
        >
          {busy ? "Posting…" : "Post to live feed"}
        </button>
      </form>

      <div>
        <h2
          className="mb-3 font-heading text-xl text-accent"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Edit or remove
        </h2>
        {entries.length === 0 ? (
          <p className="text-sm text-muted">No entries yet.</p>
        ) : (
          <ul className="space-y-4">
            {entries.map((e) => (
              <li
                key={e.id}
                className="border-2 border-border bg-page-bg p-3 text-sm"
              >
                <div className="mb-2 flex flex-wrap gap-2 text-xs text-muted">
                  <span>#{e.feed_number}</span>
                  <span>·</span>
                  <span>{new Date(e.created_at).toLocaleString()}</span>
                </div>
                {editingId === e.id ? (
                  <div className="space-y-2">
                    <input
                      value={editBody}
                      onChange={(ev) => setEditBody(ev.target.value)}
                      placeholder="Caption…"
                      className="w-full border-2 border-border bg-surface px-2 py-1.5 text-text"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer border-2 border-border bg-surface-2 px-2 py-1 text-xs">
                        Change image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadBusy}
                          onChange={onPickEditImage}
                        />
                      </label>
                      {editImageUrl ? (
                        <button
                          type="button"
                          onClick={() => setEditImageUrl(null)}
                          className="text-xs text-accent underline"
                        >
                          Remove image
                        </button>
                      ) : null}
                    </div>
                    {editImageUrl ? (
                      <div className="relative inline-block max-w-xs border border-border p-1">
                        <Image
                          src={editImageUrl}
                          alt=""
                          width={240}
                          height={180}
                          className="max-h-40 object-contain"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void saveEdit(e.id)}
                        className="border-2 border-border bg-accent px-3 py-1 text-accent-contrast"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="border-2 border-border bg-surface-2 px-3 py-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {e.image_url ? (
                      <div className="relative mb-2 inline-block max-w-sm border border-border bg-surface p-1">
                        <Image
                          src={e.image_url}
                          alt=""
                          width={320}
                          height={240}
                          className="h-auto max-h-52 w-full object-contain"
                        />
                      </div>
                    ) : null}
                    {e.body ? (
                      <p className="leading-relaxed text-text">{e.body}</p>
                    ) : null}
                    <div className="mt-2 flex gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => startEdit(e)}
                        className="text-link underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(e.id)}
                        className="text-accent underline"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {status ? (
        <p className="border-l-4 border-accent pl-3 text-sm text-muted">
          {status}
        </p>
      ) : null}
    </div>
  );
}
