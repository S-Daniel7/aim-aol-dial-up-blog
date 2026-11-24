import { AdminComments } from "@/components/AdminComments";

export default function AdminCommentsPage() {
  return (
    <div>
      <h1
        className="mb-6 font-heading text-3xl text-accent"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Comments
      </h1>
      <AdminComments />
    </div>
  );
}
