"use client";

import { useEffect, useRef, useState } from "react";
import type { DbMessage } from "@/lib/types";
import { getSenderColor } from "@/lib/chat-colors";
import { ChatMessage } from "@/components/ChatMessage";
import { TypingDots } from "@/components/TypingDots";

type Props = {
  messages: DbMessage[];
  ownerHandle: string;
  postId: string;
};

const BASE_DELAY_MS = 500;
const MS_PER_CHAR = 15;
const MAX_DELAY_MS = 1800;
const IMAGE_DELAY_MS = 700;

function delayForMessage(m: DbMessage) {
  if (m.kind !== "text") return IMAGE_DELAY_MS;
  const len = m.body?.length ?? 0;
  return Math.min(BASE_DELAY_MS + len * MS_PER_CHAR, MAX_DELAY_MS);
}

function seenKey(postId: string) {
  return `chatReplaySeen:${postId}`;
}

export function ChatReplay({ messages, ownerHandle, postId }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const colorPalette = useRef(new Map<string, string>()).current;

  useEffect(() => {
    const alreadySeen =
      typeof window !== "undefined" && localStorage.getItem(seenKey(postId)) !== null;
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (alreadySeen || reducedMotion || messages.length === 0) {
      setVisibleCount(messages.length);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    function revealNext(index: number) {
      if (cancelled || index >= messages.length) {
        if (!cancelled) {
          setIsTyping(false);
          localStorage.setItem(seenKey(postId), "1");
        }
        return;
      }
      setIsTyping(true);
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          setIsTyping(false);
          setVisibleCount(index + 1);
          timers.push(setTimeout(() => revealNext(index + 1), 150));
        }, delayForMessage(messages[index])),
      );
    }

    revealNext(0);
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  function handleSkip() {
    setSkipped(true);
    setIsTyping(false);
    setVisibleCount(messages.length);
    localStorage.setItem(seenKey(postId), "1");
  }

  const replaying = !skipped && visibleCount < messages.length;

  return (
    <div className="space-y-3">
      {messages.slice(0, visibleCount).map((m) => {
        const isOwner = m.sender.toLowerCase() === ownerHandle.toLowerCase();
        const color = isOwner ? "text-accent" : getSenderColor(m.sender, colorPalette);
        return (
          <ChatMessage
            key={m.id}
            message={m}
            isOwner={isOwner}
            color={color}
            className="animate-slide-in"
          />
        );
      })}

      {isTyping && (
        <div className="flex items-center gap-1.5 animate-fade-in">
          <TypingDots />
        </div>
      )}

      {replaying && (
        <button
          type="button"
          onClick={handleSkip}
          className="font-mono text-[10px] text-muted hover:text-accent"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          show full conversation →
        </button>
      )}
    </div>
  );
}
