import { describe, expect, it } from "vitest";
import { boardPayloadToRow } from "@/lib/board-payload";

describe("boardPayloadToRow", () => {
  it("requires a valid kind", () => {
    expect(boardPayloadToRow({})).toHaveProperty("error");
  });
  it("requires an image url for image items", () => {
    expect(boardPayloadToRow({ kind: "image" })).toHaveProperty("error");
  });
  it("requires text for text items and caps its length", () => {
    expect(boardPayloadToRow({ kind: "text", text: " " })).toHaveProperty("error");
    expect(boardPayloadToRow({ kind: "text", text: "x".repeat(2001) })).toHaveProperty("error");
  });
  it("clamps out-of-range geometry", () => {
    const r = boardPayloadToRow({ kind: "text", text: "hi", x: 99999, y: -5, rotation: 500, width: 1 });
    expect("row" in r && r.row).toMatchObject({ x: 1000, y: 0, rotation: 45, width: 30 });
  });
  it("ignores text styling on image items", () => {
    const r = boardPayloadToRow({ kind: "image", imageUrl: "https://x/y.png", isBold: true });
    expect("row" in r && r.row).toMatchObject({ text: null, is_bold: false, font_family: null });
  });
  it("falls back to defaults for NaN input", () => {
    const r = boardPayloadToRow({ kind: "text", text: "hi", x: Number.NaN });
    expect("row" in r && r.row?.x).toBe(10);
  });
});
