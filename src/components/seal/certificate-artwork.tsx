import { cn } from "@/lib/utils";

export function CertificateFront({
  learner,
  course,
  completedOn,
  number,
  organisation,
  className,
}: {
  learner: string;
  course: string;
  completedOn: string;
  number: string;
  organisation: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[1.414/1] w-full overflow-hidden rounded-2xl border border-border bg-gradient-parchment p-6 shadow-float",
        className,
      )}
    >
      <div className="absolute inset-3 rounded-xl border border-seal/25" />
      <div className="absolute inset-4 rounded-lg border border-border/70" />
      <div className="relative flex h-full flex-col items-center justify-center text-center">
        <p className="text-[10px] font-semibold tracking-[0.35em] text-muted-foreground uppercase">
          Certificate of completion
        </p>
        <p className="mt-3 text-display text-3xl leading-none">{learner}</p>
        <p className="mt-3 max-w-[80%] text-xs text-muted-foreground">
          has successfully completed the training programme
        </p>
        <p className="mt-1.5 text-sm font-semibold">{course}</p>
        <div className="mt-5 flex items-center gap-6 text-[10px] text-muted-foreground">
          <span>Completed {completedOn}</span>
          <span className="font-mono">{number}</span>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">{organisation}</p>
      </div>
      <div className="absolute right-6 bottom-6 grid size-12 place-items-center rounded-full bg-gradient-seal text-[9px] font-bold tracking-widest text-seal-foreground shadow-seal">
        SEAL
      </div>
    </div>
  );
}

export function CertificateBack({
  number,
  validUntil,
  course,
  className,
}: {
  number: string;
  validUntil: string;
  course: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[1.414/1] w-full overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-float",
        className,
      )}
    >
      <div className="absolute inset-3 rounded-xl border border-border/70" />
      <div className="relative flex h-full flex-col justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.3em] text-muted-foreground uppercase">
            Verification
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            This credential can be verified using the certificate number below.
          </p>
          <p className="mt-2 font-mono text-sm font-medium">{number}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase">Programme</p>
            <p className="mt-0.5 font-medium">{course}</p>
          </div>
          <div>
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
              Valid until
            </p>
            <p className="mt-0.5 font-medium">{validUntil}</p>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <p className="max-w-[60%] text-[10px] text-muted-foreground">
            Issued through Seal training operations. Placeholder reverse content.
          </p>
          <div className="size-14 rounded-md bg-[repeating-conic-gradient(var(--foreground)_0_25%,transparent_0_50%)] bg-[length:8px_8px] opacity-80" />
        </div>
      </div>
    </div>
  );
}
