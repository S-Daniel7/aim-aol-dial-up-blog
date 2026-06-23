import { AdminGuestbook } from "@/components/AdminGuestbook";

export default function AdminGuestbookPage() {
  return (
    <div>
      <h1
        className="mb-6 font-heading text-3xl text-accent"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Guestbook
      </h1>
      <AdminGuestbook />
    </div>
  );
}
