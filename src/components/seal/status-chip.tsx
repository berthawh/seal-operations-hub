import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type {
  CertificateStatus,
  SessionStatus,
  TrackingStatus,
} from "@/lib/seal-data";

const chip = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-tight transition-colors",
  {
    variants: {
      tone: {
        neutral: "border-border bg-neutral-soft text-muted-foreground",
        seal: "border-seal/25 bg-seal-soft text-seal",
        success: "border-success/25 bg-success-soft text-success",
        warning: "border-warning/30 bg-warning-soft text-warning-foreground",
        info: "border-info/25 bg-info-soft text-info",
        danger: "border-danger/25 bg-danger-soft text-danger",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  },
);

export type ChipTone = NonNullable<VariantProps<typeof chip>["tone"]>;

export function StatusChip({
  tone,
  size,
  dot = true,
  className,
  children,
}: VariantProps<typeof chip> & {
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn(chip({ tone, size }), className)}>
      {dot ? <span className="size-1.5 rounded-full bg-current opacity-70" /> : null}
      {children}
    </span>
  );
}

export const sessionTone: Record<SessionStatus, ChipTone> = {
  upcoming: "info",
  in_progress: "seal",
  completed: "success",
  attention: "warning",
  cancelled: "neutral",
};

export const certificateTone: Record<CertificateStatus, ChipTone> = {
  issued: "success",
  pending: "warning",
  hold: "danger",
  draft: "neutral",
  expired: "neutral",
};

export const trackingTone: Record<TrackingStatus, ChipTone> = {
  on_track: "info",
  due_soon: "warning",
  overdue: "danger",
  completed: "success",
};

export const deliveryLabel: Record<string, string> = {
  delivered: "Delivered",
  queued: "Queued",
  not_sent: "Not sent",
  bounced: "Bounced",
};
