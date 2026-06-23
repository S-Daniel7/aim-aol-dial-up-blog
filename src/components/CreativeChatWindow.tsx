"use client";

import LlmConnector, {
  type LlmConnectorBlock,
  type Provider,
} from "@rcb-plugins/llm-connector";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Flow, Message, Settings, Styles } from "react-chatbotify";

const ChatBot = dynamic(() => import("react-chatbotify"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[520px] items-center justify-center bg-chat-bg font-mono text-sm text-muted">
      CreativeBuddy is signing on...
    </div>
  ),
});

const CREATIVE_BUDDY_SYSTEM_PROMPT = [
  "You are CreativeBuddy, a warm, practical creative companion inside a retro AOL-style website.",
  "Help with film, writing, collage, visual references, music, project planning, routines, creative research, and getting unstuck.",
  "Also help with the site's publishing workflow: turn notes or chat logs into post drafts, write image captions, suggest semantic tags, summarize boards or posts, and propose safer publication wording when needed.",
  "Keep replies short: usually 2 to 4 lines, no more than 80 words unless the user asks for detail.",
  "Give concrete next steps and ask at most one useful question.",
  "When suggesting references, suggest movements, genres, films, books, techniques, or eras to investigate; do not tell users to copy a living artist's style.",
].join(" ");

const settings: Settings = {
  general: {
    embedded: true,
    showHeader: false,
    showFooter: false,
    primaryColor: "#cc0000",
    secondaryColor: "#0000cc",
    fontFamily: "var(--font-body)",
  },
  chatHistory: {
    disabled: true,
  },
  chatInput: {
    allowNewline: true,
    botDelay: 600,
    characterLimit: 1200,
    enabledPlaceholderText: "ask about a creative project...",
    showCharacterCount: true,
  },
  chatWindow: {
    showScrollbar: true,
    showTypingIndicator: true,
  },
  botBubble: {
    animate: false,
  },
  userBubble: {
    animate: false,
  },
  notification: {
    disabled: true,
  },
  audio: {
    disabled: true,
  },
  voice: {
    disabled: true,
  },
  fileAttachment: {
    disabled: true,
  },
  emoji: {
    disabled: true,
  },
};

const styles: Styles = {
  chatWindowStyle: {
    width: "100%",
    height: "560px",
    borderRadius: 0,
    boxShadow: "none",
    border: "none",
    background: "var(--chat-bg)",
  },
  bodyStyle: {
    background: "var(--chat-bg)",
    padding: "12px",
    borderLeft: "2px inset var(--surface-2)",
    borderTop: "2px inset var(--surface-2)",
  },
  chatInputContainerStyle: {
    borderTop: "2px solid var(--border)",
    borderRadius: 0,
    background: "var(--surface)",
  },
  chatInputAreaStyle: {
    minHeight: "72px",
    border: "2px solid var(--border)",
    borderRadius: 0,
    background: "var(--page-bg)",
    color: "var(--text)",
    fontFamily: "var(--font-mono-chat)",
  },
  chatInputAreaFocusedStyle: {
    background: "var(--surface-2)",
    boxShadow: "none",
  },
  botBubbleStyle: {
    borderRadius: 0,
    background: "transparent",
    border: "none",
    color: "var(--text)",
    fontFamily: "var(--font-mono-chat)",
    fontSize: "14px",
    lineHeight: 1.45,
    maxWidth: "100%",
    padding: "2px 0",
    textAlign: "left",
  },
  userBubbleStyle: {
    borderRadius: 0,
    background: "transparent",
    border: "none",
    color: "var(--text)",
    fontFamily: "var(--font-mono-chat)",
    fontSize: "14px",
    lineHeight: 1.45,
    maxWidth: "100%",
    padding: "2px 0",
    textAlign: "left",
  },
  botOptionStyle: {
    borderRadius: 0,
    border: "1px solid var(--border)",
    background: "var(--page-bg)",
    color: "var(--link)",
    fontFamily: "var(--font-mono-chat)",
  },
  botOptionHoveredStyle: {
    borderRadius: 0,
    border: "1px solid var(--border)",
    background: "var(--page-bg)",
    color: "var(--link)",
    fontFamily: "var(--font-mono-chat)",
  },
  sendButtonStyle: {
    borderRadius: 0,
    background: "var(--accent)",
  },
  sendButtonHoveredStyle: {
    background: "var(--accent-hover)",
  },
  sendButtonDisabledStyle: {
    borderRadius: 0,
    background: "var(--muted)",
  },
  characterLimitStyle: {
    color: "var(--muted)",
    fontFamily: "var(--font-mono-chat)",
  },
  chatHistoryLineBreakStyle: {
    color: "var(--muted)",
    fontFamily: "var(--font-mono-chat)",
  },
  rcbTypingIndicatorContainerStyle: {
    paddingLeft: "0",
  },
  rcbTypingIndicatorDotStyle: {
    backgroundColor: "var(--muted)",
  },
};

class OpenRouterProvider implements Provider {
  async *sendMessages(messages: Message[]): AsyncGenerator<string> {
    const response = await fetch("/api/openrouter-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemMessage: CREATIVE_BUDDY_SYSTEM_PROMPT,
        messages: messages.map((message) => ({
          sender: message.sender,
          content:
            typeof message.content === "string" ? message.content : "",
        })),
      }),
    });

    if (!response.ok || !response.body) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      yield data?.error ?? "stevenspielbot could not reach OpenRouter.";
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (chunk) yield chunk;
    }

    const tail = decoder.decode();
    if (tail) yield tail;
  }
}

function createFlow(provider: Provider): Flow {
  const llmBlock: LlmConnectorBlock = {
    llmConnector: {
      provider,
      outputType: "chunk",
      outputSpeed: 20,
      historySize: 4,
      errorMessage:
        "stevenspielbot could not reach OpenRouter. try again in a minute.",
    },
  };

  return {
    start: {
      transition: 0,
      path: "creative_reply",
    },
    creative_reply: llmBlock,
  };
}

export function CreativeChatWindow() {
  const flow = useMemo(() => createFlow(new OpenRouterProvider()), []);
  const plugins = useMemo(() => [LlmConnector()], []);

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
          Instant Message
        </h1>
        <div className="flex gap-1 pl-3 text-xs opacity-90" aria-hidden>
          <span className="border border-title-bar-text px-1">_</span>
          <span className="border border-title-bar-text px-1">[]</span>
          <span className="border border-title-bar-text px-1">X</span>
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
              steven_spielbot
            </li>
            <li className="text-muted">greta_gerwini</li>
            <li className="text-muted">paul_thomas_anthropic</li>
            <li className="text-muted">ryan_googler</li>
          </ul>
        </aside>

        <div className="creative-chatbotify min-w-0">
          <ChatBot
            flow={flow}
            plugins={plugins}
            settings={settings}
            styles={styles}
          />
        </div>
      </div>
    </section>
  );
}
