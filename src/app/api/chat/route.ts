import { NextResponse } from "next/server";

type ChatRole = "user" | "assistant";

type ChatPayload = {
  messages?: {
    role?: ChatRole;
    content?: string;
  }[];
};

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 1200;

const CREATIVE_INSTRUCTIONS = [
  "You are CreativeBuddy, a warm, practical creative companion inside a retro AOL-style website.",
  "Help with creative pursuits: art, writing, film, music, design, research, taste-making, references, routines, and project planning.",
  "When a user asks for inspiration from existing work, suggest genres, movements, artists, films, books, games, or media to investigate without copying a living artist's style wholesale.",
  "Prefer concrete next steps, prompts, small exercises, and decision points over generic encouragement.",
  "Keep replies concise, conversational, and useful. Ask one clarifying question only when it would materially improve the advice.",
].join(" ");

function cleanMessage(message: { role?: ChatRole; content?: string }) {
  const role = message.role === "assistant" ? "assistant" : "user";
  const content = (message.content ?? "").trim().slice(0, MAX_MESSAGE_LENGTH);
  return content ? { role, content } : null;
}

function extractText(data: unknown) {
  if (
    data &&
    typeof data === "object" &&
    "output_text" in data &&
    typeof data.output_text === "string"
  ) {
    return data.output_text.trim();
  }

  if (!data || typeof data !== "object" || !("output" in data)) return "";
  const output = data.output;
  if (!Array.isArray(output)) return "";

  return output
    .flatMap((item) => {
      if (!item || typeof item !== "object" || !("content" in item)) return [];
      const content = item.content;
      if (!Array.isArray(content)) return [];
      return content
        .map((part) => {
          if (!part || typeof part !== "object" || !("text" in part)) return "";
          return typeof part.text === "string" ? part.text : "";
        })
        .filter(Boolean);
    })
    .join("\n")
    .trim();
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI is not configured. Add OPENAI_API_KEY to .env.local." },
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
    .filter((message): message is { role: ChatRole; content: string } =>
      Boolean(message),
    );

  if (!messages.length || messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json(
      { error: "Send a message before asking the bot." },
      { status: 400 },
    );
  }

  const transcript = messages
    .map((message) => `${message.role === "user" ? "User" : "CreativeBuddy"}: ${message.content}`)
    .join("\n\n");

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      instructions: CREATIVE_INSTRUCTIONS,
      input: transcript,
      max_output_tokens: 600,
      temperature: 0.8,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    return NextResponse.json(
      { error: "The creative chat service did not respond." },
      { status: 502 },
    );
  }

  const reply = extractText(data);
  if (!reply) {
    return NextResponse.json(
      { error: "The creative chat service returned an empty reply." },
      { status: 502 },
    );
  }

  return NextResponse.json({ reply });
}
