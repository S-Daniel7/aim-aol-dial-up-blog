import { describe, expect, it } from "vitest";
import { parseChatLines, parseHandleSuggestions, serializeChatLines } from "@/lib/parseChat";

describe("parseChatLines", () => {
  it("parses sender|time|message lines", () => {
    expect(parseChatLines("soapie|9:41 PM|hey\nxXemoXx|9:42 PM|hi")).toEqual([
      { sender: "soapie", time_label: "9:41 PM", body: "hey" },
      { sender: "xXemoXx", time_label: "9:42 PM", body: "hi" },
    ]);
  });

  it("keeps | characters inside the message body", () => {
    const [m] = parseChatLines("a|1:00|this | that | other");
    expect(m.body).toBe("this | that | other");
  });

  it("skips blank lines and handles CRLF", () => {
    expect(parseChatLines("a|1|x\r\n\r\nb|2|y")).toHaveLength(2);
  });

  it("throws on lines missing separators", () => {
    expect(() => parseChatLines("just some text")).toThrow(/sender\|time\|message/);
  });

  it("throws when sender or time is empty", () => {
    expect(() => parseChatLines("|1:00|hi")).toThrow(/cannot be empty/);
  });
});

describe("serializeChatLines", () => {
  it("round-trips through parseChatLines", () => {
    const lines = [{ sender: "a", time_label: "1:00", body: "hello" }];
    expect(parseChatLines(serializeChatLines(lines))).toEqual(lines);
  });

  it("skips empty bodies and collapses newlines", () => {
    const out = serializeChatLines([
      { sender: "a", time_label: "1", body: "   " },
      { sender: "a", time_label: "", body: "two\nlines" },
    ]);
    expect(out).toBe("a|—|two lines");
  });

  it("requires a sender when a body is present", () => {
    expect(() => serializeChatLines([{ sender: "", time_label: "1", body: "x" }])).toThrow();
  });
});

describe("parseHandleSuggestions", () => {
  it("splits on commas/newlines, trims and dedupes", () => {
    expect(parseHandleSuggestions("a, b\nb,, c ")).toEqual(["a", "b", "c"]);
  });
});
