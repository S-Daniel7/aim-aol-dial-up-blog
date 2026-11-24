import { describe, expect, it } from "vitest";
import { validateComment } from "@/lib/comment-input";

describe("validateComment", () => {
  it("accepts and trims a normal comment", () => {
    expect(validateComment({ author_name: " sunny ", body: " hi! " })).toEqual({
      ok: true,
      authorName: "sunny",
      body: "hi!",
    });
  });
  it("strips HTML", () => {
    const r = validateComment({ author_name: "a", body: "<b>hey</b><i>x</i>" });
    expect(r.ok && r.body).not.toContain("<");
  });
  it("rejects empty or oversize fields and non-strings", () => {
    expect(validateComment({ author_name: "", body: "x" }).ok).toBe(false);
    expect(validateComment({ author_name: "a", body: "   " }).ok).toBe(false);
    expect(validateComment({ author_name: "a", body: "x".repeat(501) }).ok).toBe(false);
    expect(validateComment({ author_name: "n".repeat(41), body: "x" }).ok).toBe(false);
    expect(validateComment({ author_name: 5, body: {} }).ok).toBe(false);
  });
});
