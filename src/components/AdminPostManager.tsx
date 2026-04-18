"use client";

import {
  parseHandleSuggestions,
  serializeChatLines,
  type ChatLineDraft,
} from "@/lib/parseChat";
import type { DbMessage, DbPost } from "@/lib/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type PendingImage = {
  id: string;
  url: string;
  caption: string;
  sender: string;
  time_label: string;
};

type EditableLine = ChatLineDraft & { id: string };

type Draft = {
  title: string;
  slug: string;
  blurb: string;
  handlesHint: string;
  lines: EditableLine[];
  images: PendingImage[];
};

type PostWithMessages = {
  post: DbPost;
  messages: DbMessage[];
};

function newLine(partial?: Partial<ChatLineDraft>): EditableLine {
  return {
    id: crypto.randomUUID(),
    sender: partial?.sender ?? "",
    time_label: partial?.time_label ?? "",
    body: partial?.body ?? "",
  };
}

function blankDraft(): Draft {
  return {
    title: "",
    slug: "",
    blurb: "",
    handlesHint: "",
    lines: [newLine()],
    images: [],
  };
}

function draftFromPost(post: DbPost, messages: DbMessage[]): Draft {
  const textMessages = messages.filter((m) => m.kind === "text");
  const imageMessages = messages.filter((m) => m.kind === "image");
  const handles = Array.from(
    new Set(messages.map((m) => m.sender).filter(Boolean)),
  );

  return {
    title: post.title,
    slug: post.slug,
    blurb: post.blurb ?? "",
    handlesHint: handles.join("\n"),
    lines: textMessages.length
      ? textMessages.map((m) =>
          newLine({
            sender: m.sender,
            time_label: m.time_label,
            body: m.body ?? "",
          }),
        )
      : [newLine()],
    images: imageMessages
      .filter((m) => m.image_url)
      .map((m) => ({
        id: m.id,
        url: m.image_url ?? "",
        caption: m.image_caption ?? "",
        sender: m.sender,
        time_label: m.time_label,
      })),
  };
}

async function uploadFile(file: File) {
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

function groupMessages(messages: DbMessage[]) {
  const grouped: Record<string, DbMessage[]> = {};
  for (const message of messages) {
    if (!grouped[message.post_id]) grouped[message.post_id] = [];
    grouped[message.post_id].push(message);
  }
  return grouped;
}

export function AdminPostManager() {
  const router = useRouter();
  const [items, setItems] = useState<PostWithMessages[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(() => blankDraft());
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/posts?includeMessages=1", {
        cache: "no-store",
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        posts?: DbPost[];
        messages?: DbMessage[];
        error?: string;
      };
      if (!res.ok) {
        setStatus(data.error ?? "Could not load chat-room posts.");
        return;
      }
      const grouped = groupMessages(data.messages ?? []);
      setItems(
        (data.posts ?? []).map((post) => ({
          post,
          messages: grouped[post.id] ?? [],
        })),
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Network error.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleOptions = useMemo(
    () => parseHandleSuggestions(draft.handlesHint),
    [draft.handlesHint],
  );

  function startEdit(item: PostWithMessages) {
    setStatus(null);
    setEditingId(item.post.id);
    setDraft(draftFromPost(item.post, item.messages));
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(blankDraft());
  }

  function updateDraft(patch: Partial<Draft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function updateLine(id: string, patch: Partial<ChatLineDraft>) {
    setDraft((prev) => ({
      ...prev,
      lines: prev.lines.map((line) =>
        line.id === id ? { ...line, ...patch } : line,
      ),
    }));
  }

  function addLine() {
    setDraft((prev) => ({ ...prev, lines: [...prev.lines, newLine()] }));
  }

  function removeLine(id: string) {
    setDraft((prev) => ({
      ...prev,
      lines:
        prev.lines.length <= 1
          ? prev.lines
          : prev.lines.filter((line) => line.id !== id),
    }));
  }

  function updateImage(id: string, patch: Partial<PendingImage>) {
    setDraft((prev) => ({
      ...prev,
      images: prev.images.map((image) =>
        image.id === id ? { ...image, ...patch } : image,
      ),
    }));
  }

  function removeImage(id: string) {
    setDraft((prev) => ({
      ...prev,
      images: prev.images.filter((image) => image.id !== id),
    }));
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setStatus("Uploading...");
    try {
      const url = await uploadFile(file);
      setDraft((prev) => ({
        ...prev,
        images: [
          ...prev.images,
          {
            id: crypto.randomUUID(),
            url,
            caption: "",
            sender: "me",
            time_label: new Date().toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            }),
          },
        ],
      }));
      setStatus(null);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit(id: string) {
    setStatus(null);
    let chatText = "";
    try {
      chatText = serializeChatLines(draft.lines);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Invalid chat lines");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title.trim(),
          slug: draft.slug.trim(),
          blurb: draft.blurb.trim() || null,
          chatText,
          images: draft.images.map((image) => ({
            url: image.url,
            caption: image.caption,
            sender: image.sender,
            time_label: image.time_label,
          })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setStatus(data.error ?? "Save failed");
        return;
      }
      cancelEdit();
      await load();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this chat-room post from the home page?")) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setStatus(data.error ?? "Delete failed");
        return;
      }
      if (editingId === id) cancelEdit();
      await load();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2
        className="font-heading text-2xl text-accent"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Edit existing chat-room posts
      </h2>

      {status ? (
        <p className="border-l-4 border-accent pl-3 text-sm text-muted">
          {status}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className="text-sm text-muted">No chat-room posts yet.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.post.id}
              className="border-2 border-border bg-surface p-4"
            >
              {editingId === item.post.id ? (
                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-muted">Title</label>
                      <input
                        value={draft.title}
                        onChange={(e) => updateDraft({ title: e.target.value })}
                        className="mt-0.5 w-full border-2 border-border bg-page-bg px-2 py-1.5 text-sm text-text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted">Slug</label>
                      <input
                        value={draft.slug}
                        onChange={(e) => updateDraft({ slug: e.target.value })}
                        className="mt-0.5 w-full border-2 border-border bg-page-bg px-2 py-1.5 text-sm text-text"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted">Blurb</label>
                      <input
                        value={draft.blurb}
                        onChange={(e) => updateDraft({ blurb: e.target.value })}
                        className="mt-0.5 w-full border-2 border-border bg-page-bg px-2 py-1.5 text-sm text-text"
                      />
                    </div>
                  </div>

                  <div className="border-2 border-border bg-page-bg p-3">
                    <label className="block text-xs font-semibold text-text">
                      Names in this chat
                    </label>
                    <textarea
                      value={draft.handlesHint}
                      onChange={(e) =>
                        updateDraft({ handlesHint: e.target.value })
                      }
                      rows={2}
                      className="mt-1 w-full resize-y border-2 border-border bg-surface px-2 py-1.5 text-sm text-text"
                    />
                  </div>

                  <datalist id={`chat-handle-options-${item.post.id}`}>
                    {handleOptions.map((handle) => (
                      <option key={handle} value={handle} />
                    ))}
                  </datalist>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-text">Lines</p>
                      <button
                        type="button"
                        onClick={addLine}
                        className="border-2 border-border bg-surface-2 px-3 py-1 text-xs hover:bg-page-bg"
                      >
                        + add line
                      </button>
                    </div>
                    {draft.lines.map((line, idx) => (
                      <div
                        key={line.id}
                        className="border-2 border-border bg-page-bg p-3"
                      >
                        <div className="mb-2 text-xs text-muted">
                          Line {idx + 1}
                        </div>
                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,7rem)_minmax(0,1fr)]">
                          <input
                            list={`chat-handle-options-${item.post.id}`}
                            value={line.sender}
                            onChange={(e) =>
                              updateLine(line.id, { sender: e.target.value })
                            }
                            placeholder="name"
                            className="border-2 border-border bg-surface px-2 py-1.5 text-sm text-text"
                          />
                          <input
                            value={line.time_label}
                            onChange={(e) =>
                              updateLine(line.id, {
                                time_label: e.target.value,
                              })
                            }
                            placeholder="time"
                            className="border-2 border-border bg-surface px-2 py-1.5 text-sm text-text"
                          />
                          <textarea
                            value={line.body}
                            onChange={(e) =>
                              updateLine(line.id, { body: e.target.value })
                            }
                            rows={2}
                            placeholder="message"
                            className="sm:col-span-3 resize-y border-2 border-border bg-surface px-2 py-1.5 text-sm text-text"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          disabled={draft.lines.length <= 1}
                          className="mt-2 text-xs text-accent underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40"
                        >
                          Remove line
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 border-border pt-4">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-text">Images</p>
                      <label className="cursor-pointer border-2 border-border bg-surface-2 px-3 py-1 text-xs hover:bg-page-bg">
                        + upload image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={busy}
                          onChange={onPickFile}
                        />
                      </label>
                    </div>
                    {draft.images.length ? (
                      <ul className="space-y-3">
                        {draft.images.map((image) => (
                          <li
                            key={image.id}
                            className="border-2 border-border bg-page-bg p-3"
                          >
                            <div className="flex flex-wrap gap-4">
                              <Image
                                src={image.url}
                                alt=""
                                width={180}
                                height={140}
                                className="max-h-36 max-w-[180px] border border-border object-contain"
                              />
                              <div className="min-w-[200px] flex-1 space-y-2">
                                <input
                                  value={image.caption}
                                  onChange={(e) =>
                                    updateImage(image.id, {
                                      caption: e.target.value,
                                    })
                                  }
                                  placeholder="Caption"
                                  className="w-full border-2 border-border bg-surface px-2 py-1 text-sm"
                                />
                                <div className="flex gap-2">
                                  <input
                                    value={image.sender}
                                    onChange={(e) =>
                                      updateImage(image.id, {
                                        sender: e.target.value,
                                      })
                                    }
                                    placeholder="Sender"
                                    className="w-1/2 border-2 border-border bg-surface px-2 py-1 text-sm"
                                  />
                                  <input
                                    value={image.time_label}
                                    onChange={(e) =>
                                      updateImage(image.id, {
                                        time_label: e.target.value,
                                      })
                                    }
                                    placeholder="Time"
                                    className="w-1/2 border-2 border-border bg-surface px-2 py-1 text-sm"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(image.id)}
                                  className="text-xs text-accent underline"
                                >
                                  Remove image
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted">No images.</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void saveEdit(item.post.id)}
                      className="border-2 border-border bg-accent px-3 py-1.5 text-sm text-accent-contrast enabled:hover:bg-accent-hover disabled:opacity-50"
                    >
                      {busy ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="border-2 border-border bg-surface-2 px-3 py-1.5 text-sm hover:bg-page-bg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-heading text-xl text-text">
                        {item.post.title}
                      </p>
                      <p className="text-xs text-muted">
                        /post/{item.post.slug} ·{" "}
                        {new Date(item.post.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="text-link underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void deletePost(item.post.id)}
                        className="text-accent underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-muted">
                    {item.messages.length} message
                    {item.messages.length === 1 ? "" : "s"}
                  </p>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
