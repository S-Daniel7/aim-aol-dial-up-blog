import { AdminAbout } from "@/components/AdminAbout";

export default function AdminAboutPage() {
  return (
    <div>
      <h1
        className="mb-6 font-heading text-3xl text-accent"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        About page
      </h1>
      <AdminAbout />
    </div>
  );
}
