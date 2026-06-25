import { AdminLinks } from "@/components/AdminLinks";

export default function AdminLinksPage() {
  return (
    <div>
      <h1
        className="mb-6 font-heading text-3xl text-accent"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Links &amp; blogroll
      </h1>
      <AdminLinks />
    </div>
  );
}
