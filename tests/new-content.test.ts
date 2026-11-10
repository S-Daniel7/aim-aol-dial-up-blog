import { describe, expect, it } from "vitest";
import { hasNew } from "@/lib/new-content";

describe("hasNew", () => {
  it("is false for first-time visitors (nothing seen yet)", () => {
    expect(hasNew("2026-01-02T00:00:00Z", null)).toBe(false);
  });
  it("is false when there is no content", () => {
    expect(hasNew(null, "2026-01-01T00:00:00Z")).toBe(false);
  });
  it("is true only when content is newer than what was seen", () => {
    expect(hasNew("2026-01-02T00:00:00Z", "2026-01-01T00:00:00Z")).toBe(true);
    expect(hasNew("2026-01-01T00:00:00Z", "2026-01-01T00:00:00Z")).toBe(false);
  });
});
