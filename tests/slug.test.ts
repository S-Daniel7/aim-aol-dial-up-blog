import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("My Summer 2003 Chat!")).toBe("my-summer-2003-chat");
  });
  it("drops quotes and trims stray hyphens", () => {
    expect(slugify("  --it's a \"test\"--  ")).toBe("its-a-test");
  });
  it("falls back to 'post' for empty results", () => {
    expect(slugify("★★★")).toBe("post");
  });
  it("caps length at 96", () => {
    expect(slugify("a".repeat(200))).toHaveLength(96);
  });
});
