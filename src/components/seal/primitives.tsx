import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function Panel({
  className,
  children,
  interactive,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "surface-card overflow-hidden",
        interactive && "hover-lift cursor-pointer hover:border-seal/30",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-5 pb-3", className)}>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Crumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1">
          {i > 0 ? <ChevronRight className="size-3 opacity-50" /> : null}
          {item.to ? (
            <Link to={item.to} className="transition-colors hover:text-seal">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground/70">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
  meta,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  crumbs?: { label: string; to?: string }[];
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}) {
  return (
    <header className="animate-[rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]">
      {crumbs ? <Crumbs items={crumbs} /> : null}
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-display text-xl leading-tight sm:text-[22px]">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">{description}</p>
          ) : null}
          {meta ? <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

export function Metric({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "default" | "seal" | "success" | "warning" | "danger";
}) {
  const toneClass = {
    default: "text-foreground",
    seal: "text-seal",
    success: "text-success",
    warning: "text-warning-foreground",
    danger: "text-danger",
  }[tone];
  return (
    <div>
      <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className={cn("mt-1 text-xl font-semibold tracking-tight tabular-nums", toneClass)}>
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-1 truncate text-sm font-medium">{value}</div>
    </div>
  );
}

export function ProgressRing({
  value,
  size = 56,
  stroke = 6,
  label,
  tone = "seal",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  tone?: "seal" | "success" | "info" | "warning";
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = `var(--${tone})`;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * Math.min(100, Math.max(0, value))) / 100}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-xs font-bold tabular-nums">{label ?? `${value}%`}</span>
      </div>
    </div>
  );
}

export function Bar({
  value,
  tone = "seal",
  className,
}: {
  value: number;
  tone?: "seal" | "success" | "info" | "warning" | "danger";
  className?: string;
}) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: `var(--${tone})` }}
      />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-sunken/60 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="grid size-12 place-items-center rounded-2xl bg-gradient-seal text-seal-foreground shadow-seal">
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="surface-card flex items-center gap-4 p-4">
          <Skeleton className="size-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function Avatar({
  initials,
  className,
  tone = "ink",
}: {
  initials: string;
  className?: string;
  tone?: "ink" | "seal";
}) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-xl text-xs font-bold",
        tone === "ink"
          ? "bg-gradient-ink text-primary-foreground"
          : "bg-gradient-seal text-seal-foreground",
        className,
      )}
    >
      {initials}
    </span>
  );
}
