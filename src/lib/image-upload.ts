/** Max upload size for admin image uploads (5 MB). */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type DetectedImage = { mime: string; ext: string };

/**
 * Identify an image by its magic bytes rather than trusting the
 * client-supplied filename or Content-Type. Only raster formats are allowed —
 * SVG/HTML are rejected because they can carry script when served publicly.
 */
export function detectImageType(buf: Uint8Array): DetectedImage | null {
  const startsWith = (sig: number[], offset = 0) =>
    buf.length >= offset + sig.length && sig.every((b, i) => buf[offset + i] === b);

  if (startsWith([0xff, 0xd8, 0xff])) return { mime: "image/jpeg", ext: "jpg" };
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    return { mime: "image/png", ext: "png" };
  if (startsWith([0x47, 0x49, 0x46, 0x38])) return { mime: "image/gif", ext: "gif" };
  // RIFF....WEBP
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8))
    return { mime: "image/webp", ext: "webp" };
  return null;
}
