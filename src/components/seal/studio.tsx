import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Lock, ShieldCheck, LockKeyhole } from "lucide-react";
import { AppShell } from "@/components/seal/app-shell";
import { Panel } from "@/components/seal/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const KEY = "seal.studio.unlocked";

export function useStudioLock() {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(KEY) === "1");
  }, []);

  return {
    unlocked,
    unlock: () => {
      sessionStorage.setItem(KEY, "1");
      setUnlocked(true);
    },
    lock: () => {
      sessionStorage.removeItem(KEY);
      setUnlocked(false);
    },
  };
}

function RestrictedScreen({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Panel className="w-full max-w-sm p-6">
        <div className="grid size-9 place-items-center rounded-xl bg-neutral-soft text-muted-foreground">
          <LockKeyhole className="size-4" />
        </div>
        <h2 className="mt-4 text-sm font-semibold tracking-tight">Restricted area</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          CO Studio maintains controlled course and certificate content. Enter the Studio password
          to continue.
        </p>
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!value.trim()) {
              setError(true);
              return;
            }
            onUnlock();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="studio-password" className="text-xs">
              Studio password
            </Label>
            <Input
              id="studio-password"
              type="password"
              autoComplete="current-password"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(false);
              }}
            />
            {error ? <p className="text-[11px] text-danger">Enter the Studio password.</p> : null}
          </div>
          <Button type="submit" variant="seal" className="w-full">
            <Lock className="size-4" /> Unlock Studio
          </Button>
        </form>
        <p className="mt-4 border-t border-border/70 pt-3 text-[11px] leading-relaxed text-muted-foreground">
          Interface only. The additional access check must be enforced on the server before Studio
          content is served.
        </p>
      </Panel>
    </div>
  );
}

const tabs = [
  { label: "Courses", to: "/settings/studio" },
  { label: "Certificates", to: "/settings/studio/certificates" },
] as const;

export function StudioShell({ children }: { children: React.ReactNode }) {
  const { unlocked, unlock, lock } = useStudioLock();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <AppShell>
      {unlocked === null ? null : unlocked ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-lg bg-neutral-soft text-muted-foreground">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <p className="text-[13px] font-semibold tracking-tight">CO Studio</p>
                <p className="text-[11px] text-muted-foreground">
                  Controlled courses and certificate configuration
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <nav className="bar flex items-center gap-1 p-1">
                {tabs.map((t) => {
                  const active =
                    t.to === "/settings/studio"
                      ? pathname === t.to || pathname.startsWith("/settings/studio/courses")
                      : pathname.startsWith(t.to);
                  return (
                    <Link
                      key={t.to}
                      to={t.to}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {t.label}
                    </Link>
                  );
                })}
              </nav>
              <Button variant="outline" size="sm" onClick={lock}>
                <Lock className="size-3.5" /> Lock
              </Button>
            </div>
          </div>
          {children}
        </div>
      ) : (
        <RestrictedScreen onUnlock={unlock} />
      )}
    </AppShell>
  );
}
