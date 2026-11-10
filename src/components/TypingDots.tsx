export function TypingDots() {
  return (
    <span className="flex items-end gap-px pb-px">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1 w-1 rounded-full bg-muted"
          style={{ animation: `dot-pulse 1s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </span>
  );
}
