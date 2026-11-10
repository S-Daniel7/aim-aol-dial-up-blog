import Image from "next/image";
import type { DbMessage } from "@/lib/types";

type Props = {
  message: DbMessage;
  isOwner: boolean;
  color: string;
  /** Inline style applied to the row wrapper, e.g. for staggered entrance delay. */
  style?: React.CSSProperties;
  className?: string;
};

export function ChatMessage({ message: m, isOwner, color, style, className }: Props) {
  return (
    <div
      className={`flex flex-col gap-0.5 ${isOwner ? "items-end" : "items-start"} ${className ?? ""}`}
      style={style}
    >
      <p className={`text-[11px] font-semibold ${color}`}>
        {m.sender}
        {m.time_label ? (
          <span className="ml-1.5 font-normal text-muted">({m.time_label})</span>
        ) : null}
      </p>

      {m.kind === "text" ? (
        <div
          className={`max-w-[80%] inline-block rounded-sm px-2.5 py-1.5 leading-relaxed ${
            isOwner
              ? "bg-surface-2 border border-border"
              : "bg-surface border border-border"
          }`}
        >
          <span className="text-text">{m.body ?? ""}</span>
        </div>
      ) : (
        <div className="space-y-1">
          {m.image_url ? (
            <div className="inline-block border-2 border-border bg-page-bg p-1">
              <Image
                src={m.image_url}
                alt={m.image_caption ?? ""}
                width={400}
                height={300}
                className="h-auto max-w-full object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          ) : null}
          {m.image_caption ? (
            <p className="text-[11px] text-muted italic">{m.image_caption}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
