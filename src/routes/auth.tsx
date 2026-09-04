import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/seal/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/team.functions";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search["redirect"] === "string" ? { redirect: search["redirect"] as string } : {},
  head: () => ({
    meta: [
      { title: "Sign in — Seal" },
      {
        name: "description",
        content:
          "Sign in to the Seal training operations workspace to manage sessions, learners and certificates.",
      },
      { property: "og:title", content: "Sign in — Seal" },
      { property: "og:description", content: "Access the Seal training operations workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const requested = search.redirect?.startsWith("/") ? search.redirect : null;

  /** Partner organisations land in their own portal; the internal team lands on the dashboard. */
  const landing = async () => {
    if (requested) return requested;
    try {
      const access = await getMyAccess();
      const partnerOnly = access.roles.includes("partner") && !access.roles.some((r) => r !== "partner");
      return partnerOnly ? "/portal" : "/";
    } catch {
      return "/";
    }
  };

  const go = async () => navigate({ to: await landing(), replace: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) void go();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await go();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Those sign-in details were not accepted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Panel className="w-full max-w-sm p-6">
        <div className="grid size-9 place-items-center rounded-xl bg-neutral-soft text-muted-foreground">
          <ShieldCheck className="size-4" />
        </div>
        <h1 className="mt-4 text-base font-semibold tracking-tight">Sign in to Seal</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Accounts are created by invitation only. Ask an administrator if you do not have one yet.
        </p>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="seal" className="w-full" disabled={busy}>
            Sign in
          </Button>
        </form>

        <p className="mt-4 border-t border-border/70 pt-3 text-[11px] leading-relaxed text-muted-foreground">
          Invite-only workspace. New team members are added by an administrator from Settings → Team &
          access.
        </p>

        <Link
          to="/"
          className="mt-3 block w-full text-center text-[11px] text-muted-foreground hover:text-foreground"
        >
          ← Back to Seal
        </Link>
      </Panel>
    </main>
  );
}
