import { AdminStatus } from "@/components/AdminStatus";

export default function AdminStatusPage() {
  return (
    <div>
      <h1
        className="mb-6 font-heading text-3xl text-accent"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Status
      </h1>
      <AdminStatus />
    </div>
  );
}
