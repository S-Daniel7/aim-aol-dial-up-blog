import { AdminStamps } from "@/components/AdminStamps";

export default function AdminStampsPage() {
  return (
    <div>
      <h1
        className="mb-2 font-heading text-3xl text-accent"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Stamp wall moderation
      </h1>
      <p className="mb-6 font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
        hidden stamps are removed from the public wall but not deleted.
      </p>
      <AdminStamps />
    </div>
  );
}
