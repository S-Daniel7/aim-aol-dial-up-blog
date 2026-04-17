export type ParsedTextMessage = {
  sender: string;
  time_label: string;
  body: string;
};

export type ChatLineDraft = {
  sender: string;
  time_label: string;
  body: string;
};

/** Split handles from a textarea (comma or newline separated). */
export function parseHandleSuggestions(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[\n,]+/)) {
    const s = part.trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

/**
 * Build `sender|time|message` lines for the API. Skips rows with an empty body.
 * Collapses body newlines to spaces so one logical line stays one stored message.
 */
export function serializeChatLines(lines: ChatLineDraft[]): string {
  const parts: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const body = line.body.trim().replace(/\r?\n/g, " ");
    if (!body) continue;
    const sender = line.sender.trim();
    const time_label = (line.time_label.trim() || "—").trim();
    if (!sender) {
      throw new Error(`Row ${i + 1}: pick a name (sender) for this message.`);
    }
    parts.push(`${sender}|${time_label}|${body}`);
  }
  return parts.join("\n");
}

/** One line = sender|time|message  (message may contain | characters) */
export function parseChatLines(raw: string): ParsedTextMessage[] {
  const lines = raw.split(/\r?\n/);
  const out: ParsedTextMessage[] = [];
  let i = 0;
  for (const line of lines) {
    if (!line.trim()) continue;
    const first = line.indexOf("|");
    const second = line.indexOf("|", first + 1);
    if (first === -1 || second === -1) {
      throw new Error(
        `Line ${i + 1}: use "sender|time|message" (need two | separators).`,
      );
    }
    const sender = line.slice(0, first).trim();
    const time_label = line.slice(first + 1, second).trim();
    const body = line.slice(second + 1).trim();
    if (!sender || !time_label) {
      throw new Error(`Line ${i + 1}: sender and time cannot be empty.`);
    }
    out.push({ sender, time_label, body });
    i++;
  }
  return out;
}
