import { describe, expect, it } from "vitest";
import { getSenderColor } from "@/lib/chat-colors";

describe("getSenderColor", () => {
  it("gives the same sender the same color", () => {
    const palette = new Map<string, string>();
    expect(getSenderColor("a", palette)).toBe(getSenderColor("a", palette));
  });
  it("gives different senders different colors until the palette wraps", () => {
    const palette = new Map<string, string>();
    const colors = ["a", "b", "c"].map((s) => getSenderColor(s, palette));
    expect(new Set(colors).size).toBe(3);
  });
  it("wraps around after 6 senders", () => {
    const palette = new Map<string, string>();
    const first = getSenderColor("s0", palette);
    for (let i = 1; i < 6; i++) getSenderColor(`s${i}`, palette);
    expect(getSenderColor("s6", palette)).toBe(first);
  });
});
