import { describe, expect, it } from "vitest";
import {
  isValidMonthKey,
  monthKey,
  monthRange,
  parsePublishAt,
  parseTags,
} from "@/lib/post-meta";

describe("parseTags", () => {
  it("splits, slugifies and de-duplicates", () => {
    expect(parseTags("Music, #music, Late Night")).toEqual([
      "music",
      "late-night",
    ]);
  });
  it("ignores blank entries and non-string input", () => {
    expect(parseTags(" , ,")).toEqual([]);
    expect(parseTags(42)).toEqual([]);
  });
  it("accepts arrays and caps the count", () => {
    const many = Array.from({ length: 20 }, (_, i) => `t${i}`);
    expect(parseTags(many)).toHaveLength(8);
  });
});

describe("parsePublishAt", () => {
  it("treats empty as publish now", () => {
    expect(parsePublishAt(undefined)).toEqual({ value: null });
    expect(parsePublishAt("")).toEqual({ value: null });
  });
  it("normalises valid dates to ISO", () => {
    expect(parsePublishAt("2026-12-01T10:00:00Z")).toEqual({
      value: "2026-12-01T10:00:00.000Z",
    });
  });
  it("rejects garbage", () => {
    expect(parsePublishAt("not a date")).toHaveProperty("error");
    expect(parsePublishAt(123)).toHaveProperty("error");
  });
});

describe("month helpers", () => {
  it("builds and validates month keys", () => {
    expect(monthKey("2026-11-10T12:00:00Z")).toBe("2026-11");
    expect(isValidMonthKey("2026-11")).toBe(true);
    expect(isValidMonthKey("2026-13")).toBe(false);
    expect(isValidMonthKey("nov")).toBe(false);
  });
  it("computes a half-open range, including year rollover", () => {
    expect(monthRange("2026-12")).toEqual({
      start: "2026-12-01T00:00:00.000Z",
      end: "2027-01-01T00:00:00.000Z",
    });
  });
});
