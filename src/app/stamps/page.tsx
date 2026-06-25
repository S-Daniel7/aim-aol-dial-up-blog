import type { Metadata } from "next";
import { StampWall } from "@/components/StampWall";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "i was here",
  description: "a wall of visitor stamps",
};

export default function StampsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1
          className="mb-1 font-heading text-3xl tracking-wide text-accent"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ~* i was here *~
        </h1>
        <p className="font-mono text-xs text-muted" style={{ fontFamily: "var(--font-mono-chat)" }}>
          leave a little trace. one stamp per day.
        </p>
      </div>
      <StampWall />
    </div>
  );
}
