import { AdminAsk } from "@/components/AdminAsk";

export default function AdminAskPage() {
  return (
    <div>
      <h1
        className="mb-6 font-heading text-3xl text-accent"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Ask box
      </h1>
      <AdminAsk />
    </div>
  );
}
