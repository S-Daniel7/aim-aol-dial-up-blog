"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "hi, i'm your little studio chat window. ask me about getting unstuck, finding references, or planning a project.",
  },
];

const PROMPTS = [
  "help me plan a short film from a mood",
  "give me art references for a collage project",
  "how do i start writing again after a long break?",
];

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function CreativeChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const transcript = useMemo(
    () =>
      messages
        .filter((message) => message.content.trim())
        .map(({ role, content }) => ({ role, content })),
    [messages],
  );

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setStatus(null);
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...transcript, { role: "user", content: trimmed }],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };

      if (!res.ok || !data.reply) {
        setStatus(data.error ?? "The chat window could not connect.");
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: data.reply ?? "",
        },
      ]);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Network error.");
    } finally {
      setBusy(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void sendMessage(draft);
  }

  return (
    <section
      className="border-2 border-border bg-surface"
      style={{ boxShadow: "5px 5px 0 0 var(--border)" }}
    >
      <div className="flex items-center justify-between border-b-2 border-border bg-title-bar px-3 py-2 text-title-bar-text">
        <h1
          className="min-w-0 truncate font-heading text-xl tracking-wide"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Creative Buddy - Instant Message
        </h1>
        <div className="flex gap-1 pl-3 text-xs opacity-90" aria-hidden>
          <span className="border border-title-bar-text px-1">_</span>
          <span className="border border-title-bar-text px-1">□</span>
          <span className="border border-title-bar-text px-1">×</span>
        </div>
      </div>

      <div className="border-b-2 border-border bg-surface-2 px-3 py-1 text-xs text-muted">
        cool fun stuff to make
      </div>

      <div className="grid min-h-[560px] bg-chat-bg md:grid-cols-[12rem_minmax(0,1fr)]">
        <aside className="border-b-2 border-border bg-surface-2 p-3 text-sm md:border-b-0 md:border-r-2">
          <p className="mb-2 font-semibold text-accent">buddy list</p>
          <ul className="space-y-1 font-mono text-xs">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 bg-accent" aria-hidden />
              stevenspielbot
            </li>
            <li className="text-muted">muse_finder</li>
            <li className="text-muted">plot_spark</li>
            <li className="text-muted">studio_planner</li>
          </ul>

          <div className="mt-5 space-y-2">
            {PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setDraft(prompt);
                  inputRef.current?.focus();
                }}
                className="block w-full border border-border bg-page-bg px-2 py-1 text-left text-xs text-link hover:bg-surface"
              >
                {prompt}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex min-h-0 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-3 font-mono text-sm">
            <ul className="space-y-4">
              {messages.map((message) => (
                <li key={message.id} className="leading-relaxed">
                  <span
                    className={
                      message.role === "user"
                        ? "font-semibold text-link"
                        : "font-semibold text-accent"
                    }
                  >
                    {message.role === "user" ? "you" : "stevenspielbot"}
                  </span>
                  <span className="text-muted">:</span>{" "}
                  <span className="whitespace-pre-wrap text-text">
                    {message.content}
                  </span>
                </li>
              ))}
              {busy ? (
                <li className="font-mono text-sm text-muted">
                  CreativeBuddy is typing...
                </li>
              ) : null}
            </ul>
          </div>

          {status ? (
            <p className="border-t-2 border-border bg-surface-2 px-3 py-2 text-sm text-accent">
              {status}
            </p>
          ) : null}

          <form
            onSubmit={onSubmit}
            className="border-t-2 border-border bg-surface p-3"
          >
            <label className="mb-2 block text-xs font-semibold text-muted">
              message
            </label>
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              rows={3}
              maxLength={1200}
              className="w-full resize-y border-2 border-border bg-page-bg px-3 py-2 text-sm text-text outline-none focus:bg-surface-2"
              placeholder="ask about a creative project..."
              disabled={busy}
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted">{draft.length}/1200</p>
              <button
                type="submit"
                disabled={busy || !draft.trim()}
                className="border-2 border-border bg-accent px-4 py-2 text-sm text-accent-contrast enabled:hover:bg-accent-hover disabled:opacity-50"
              >
                send
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
