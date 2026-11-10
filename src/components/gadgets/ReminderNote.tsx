export function ReminderNote() {
  return (
    <div
      className="relative p-3 pt-4"
      style={{
        background: "#aee6d3",
        boxShadow: "3px 4px 8px 0 rgba(0,0,0,0.25)",
      }}
    >
      <span
        aria-hidden
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 12,
          height: 12,
          background: "radial-gradient(circle at 35% 30%, #fff3a0, #d4a815 70%)",
          boxShadow: "0 2px 3px rgba(0,0,0,0.4)",
        }}
      />
      <p
        className="font-mono text-[10px] leading-relaxed"
        style={{ fontFamily: "var(--font-mono-chat)", color: "#1f4d3d" }}
      >
        remember: the best profiles are the ones with a song stuck in them.
        &lt;3
      </p>
    </div>
  );
}
