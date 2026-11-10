import { describe, expect, it } from "vitest";
import { detectImageType } from "@/lib/image-upload";

const bytes = (...b: number[]) => new Uint8Array(b);

describe("detectImageType", () => {
  it("detects jpeg, png, gif, webp", () => {
    expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0))?.ext).toBe("jpg");
    expect(detectImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))?.ext).toBe("png");
    expect(detectImageType(bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61))?.ext).toBe("gif");
    expect(
      detectImageType(bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50))?.ext,
    ).toBe("webp");
  });
  it("rejects SVG, HTML and empty input", () => {
    const enc = new TextEncoder();
    expect(detectImageType(enc.encode("<svg xmlns='http://www.w3.org/2000/svg'/>"))).toBeNull();
    expect(detectImageType(enc.encode("<html><script>"))).toBeNull();
    expect(detectImageType(new Uint8Array())).toBeNull();
  });
  it("rejects RIFF files that are not WebP", () => {
    expect(detectImageType(bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45))).toBeNull();
  });
});
