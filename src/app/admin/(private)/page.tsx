import { AdminComposer } from "@/components/AdminComposer";
import { AdminPostManager } from "@/components/AdminPostManager";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1
        className="mb-6 font-heading text-3xl text-accent"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        New chat-room post
      </h1>
      <AdminComposer />
      <div className="my-10 border-t-2 border-border" />
      <AdminPostManager />
    </div>
  );
}
