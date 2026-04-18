import { AdminBoard } from "@/components/AdminBoard";

export default function AdminBoardPage() {
  return (
    <div>
      <h1
        className="mb-6 font-heading text-3xl text-accent"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Board pins
      </h1>
      <AdminBoard />
    </div>
  );
}
