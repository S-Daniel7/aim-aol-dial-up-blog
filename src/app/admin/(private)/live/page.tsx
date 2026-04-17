import { AdminLiveFeed } from "@/components/AdminLiveFeed";

export default function AdminLiveFeedPage() {
  return (
    <div>
      <h1
        className="mb-6 font-heading text-3xl text-accent"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Live feed
      </h1>
      <AdminLiveFeed />
    </div>
  );
}
