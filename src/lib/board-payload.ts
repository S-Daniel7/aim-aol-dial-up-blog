const MAX_TEXT_LEN = 2000;

export type BoardPayload = {
  kind?: "image" | "text";
  imageUrl?: string | null;
  text?: string | null;
  x?: number;
  y?: number;
  width?: number;
  height?: number | null;
  rotation?: number;
  zIndex?: number;
  fontFamily?: string | null;
  fontSize?: number | null;
  color?: string | null;
  isBold?: boolean | null;
  isItalic?: boolean | null;
  isUnderline?: boolean | null;
};

function num(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function boardPayloadToRow(payload: BoardPayload) {
  const kind = payload.kind;
  if (kind !== "image" && kind !== "text") {
    return { error: "Choose image or text." };
  }

  const imageUrl = (payload.imageUrl ?? "").trim() || null;
  const text = (payload.text ?? "").trim() || null;
  if (kind === "image" && !imageUrl) {
    return { error: "Add an image before saving." };
  }
  if (kind === "text" && !text) {
    return { error: "Add text before saving." };
  }
  if (text && text.length > MAX_TEXT_LEN) {
    return { error: "Text is too long." };
  }

  return {
    row: {
      kind,
      image_url: kind === "image" ? imageUrl : null,
      text: kind === "text" ? text : null,
      x: num(payload.x, 10, 0, 1000),
      y: num(payload.y, 10, 0, 700),
      width: num(payload.width, kind === "image" ? 220 : 260, 30, 900),
      height:
        payload.height === null || payload.height === undefined
          ? null
          : num(payload.height, 160, 20, 700),
      rotation: num(payload.rotation, 0, -45, 45),
      z_index: Math.round(num(payload.zIndex, 1, 0, 9999)),
      font_family: kind === "text" ? (payload.fontFamily ?? "Verdana") : null,
      font_size:
        kind === "text" ? num(payload.fontSize, 24, 8, 120) : null,
      color: kind === "text" ? (payload.color ?? "#111111") : null,
      is_bold: kind === "text" ? Boolean(payload.isBold) : false,
      is_italic: kind === "text" ? Boolean(payload.isItalic) : false,
      is_underline: kind === "text" ? Boolean(payload.isUnderline) : false,
      updated_at: new Date().toISOString(),
    },
  };
}
