const SENDER_COLORS = [
  "text-[#7b68ee]", // medium slate blue
  "text-[#20b2aa]", // light sea green
  "text-[#cd853f]", // peru
  "text-[#db7093]", // pale violet red
  "text-[#3cb371]", // medium sea green
  "text-[#9370db]", // medium purple
];

export function getSenderColor(sender: string, palette: Map<string, string>): string {
  if (palette.has(sender)) return palette.get(sender)!;
  const color = SENDER_COLORS[palette.size % SENDER_COLORS.length];
  palette.set(sender, color);
  return color;
}
