import { NextResponse } from "next/server";

type ChatPayload = {
  systemMessage?: string;
  messages?: {
    sender?: string;
    content?: string;
  }[];
};

type OpenRouterDelta = {
  choices?: {
    delta?: {
      content?: string | null;
    };
    message?: {
      content?: string | null;
    };
  }[];
};

type OpenRouterError = {
  error?: {
    message?: string;
    code?: number;
    metadata?: {
      raw?: string;
      provider_name?: string;
    };
  };
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemma-3n-e4b-it:free";
const MAX_MESSAGES = 8;
const MAX_MESSAGE_LENGTH = 1000;

function cleanMessage(message: { sender?: string; content?: string }) {
  const content = (message.content ?? "").trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!content) return null;

  const role = message.sender?.toUpperCase() === "USER" ? "user" : "assistant";
  return { role, content };
}

function parseSseLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data: ")) return null;

  const payload = trimmed.slice(6);
  if (payload === "[DONE]") return null;

  try {
    return JSON.parse(payload) as OpenRouterDelta;
  } catch {
    return null;
  }
}

function formatOpenRouterError(detail: string) {
  try {
    const data = JSON.parse(detail) as OpenRouterError;
    const raw = data.error?.metadata?.raw;
    const message = data.error?.message;
    const provider = data.error?.metadata?.provider_name;
    const text = raw ?? message;

    if (text) {
      return provider
        ? `OpenRouter ${provider}: ${text}`
        : `OpenRouter: ${text}`;
    }
  } catch {
    // Fall through to a plain text response.
  }

  return detail ? `OpenRouter request failed: ${detail}` : "OpenRouter request failed.";
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenRouter is not configured. Add OPENROUTER_API_KEY to .env.local." },
      { status: 503 },
    );
  }

  let payload: ChatPayload;
  try {
    payload = (await request.json()) as ChatPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const messages = (payload.messages ?? [])
    .slice(-MAX_MESSAGES)
    .map(cleanMessage)
    .filter((message): message is { role: "user" | "assistant"; content: string } =>
      Boolean(message),
    );

  if (!messages.length || messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json(
      { error: "Send a message before asking the bot." },
      { status: 400 },
    );
  }

  const openRouterMessages = [
    ...(payload.systemMessage
      ? [{ role: "system" as const, content: payload.systemMessage }]
      : []),
    ...messages,
  ];

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000",
      "X-OpenRouter-Title": process.env.OPENROUTER_APP_TITLE ?? "AIM AOL Dial Up Blog",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
      messages: openRouterMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 220,
    }),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    return NextResponse.json(
      {
        error: formatOpenRouterError(detail),
      },
      { status: 502 },
    );
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const data = parseSseLine(line);
            const text =
              data?.choices?.[0]?.delta?.content ??
              data?.choices?.[0]?.message?.content ??
              "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        }

        const tail = decoder.decode();
        if (tail) buffer += tail;

        const data = parseSseLine(buffer);
        const text =
          data?.choices?.[0]?.delta?.content ??
          data?.choices?.[0]?.message?.content ??
          "";
        if (text) controller.enqueue(encoder.encode(text));
      } catch (error) {
        controller.error(error);
        return;
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
