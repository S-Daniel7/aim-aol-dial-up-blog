const items = ["sign my guestbook (yes u)", "burn a new mixtape cd-r", "fix the visitor counter??", "away message needs an update"];

export function TodoNote() {
  return (
    <div
      className="relative p-3 pt-4"
      style={{
        background: "#ffc9d6",
        boxShadow: "3px 4px 8px 0 rgba(0,0,0,0.25)",
      }}
    >
      <span
        aria-hidden
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 12,
          height: 12,
          background: "radial-gradient(circle at 35% 30%, #8ec4ff, #1f5fbf 70%)",
          boxShadow: "0 2px 3px rgba(0,0,0,0.4)",
        }}
      />
      <p
        className="font-mono text-[10px] font-bold"
        style={{ fontFamily: "var(--font-mono-chat)", color: "#5c2136" }}
      >
        to-do:
      </p>
      <ul className="mt-1.5 space-y-1">
        {items.map((item) => (
          <li
            key={item}
            className="font-mono text-[10px] leading-snug"
            style={{ fontFamily: "var(--font-mono-chat)", color: "#7a2c46" }}
          >
            □ {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
