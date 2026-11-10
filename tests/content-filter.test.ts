import { describe, expect, it } from "vitest";
import { containsBlocked, sanitize, stripHtml } from "@/lib/content-filter";

describe("stripHtml", () => {
  it("removes tags", () => {
    expect(stripHtml("hi <script>alert(1)</script>there")).toBe("hi alert(1)there");
  });
  it("kills javascript: URIs and inline handlers", () => {
    expect(stripHtml("javascript:alert(1)")).not.toMatch(/javascript\s*:/i);
    expect(stripHtml("x onerror=bad")).not.toMatch(/onerror\s*=/i);
  });
});

describe("sanitize / containsBlocked", () => {
  it("leaves clean text alone", () => {
    expect(sanitize("hello world")).toBe("hello world");
    expect(containsBlocked("hello world")).toBe(false);
  });
  it("flags and masks profanity", () => {
    expect(containsBlocked("what the fuck")).toBe(true);
    expect(sanitize("what the fuck")).not.toMatch(/fuck/);
  });
  it("sees through html wrapping", () => {
    expect(containsBlocked("<b>shit</b>")).toBe(true);
  });
});
