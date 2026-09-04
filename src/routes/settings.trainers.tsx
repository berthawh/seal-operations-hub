import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LockKeyhole } from "lucide-react";
import { AppShell } from "@/components/seal/app-shell";
import { PageHeader, Panel } from "@/components/seal/primitives";
import { TrainersPanel } from "@/components/seal/trainers-panel";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/team.functions";

export const Route = createFileRoute("/settings/trainers")({
  head: () => ({
    meta: [
      { title: "Trainers — Seal" },
      {
        name: "description",
        content: "Keep a record of the trainers who deliver your Seal sessions, with their specialism and contact details.",
      },
      { property: "og:title", content: "Trainers — Seal" },
      { property: "og:description", content: "Manage the people who deliver your training sessions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrainersPage,
});

function TrainersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const myAccessFn = useServerFn(getMyAccess);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
      queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient]);

  const access = useQuery({
    queryKey: ["my-access"],
    queryFn: () => myAccessFn(),
    enabled: signedIn === true,
  });

  if (signedIn === false) {
    return (
      <AppShell>
        <Panel className="mx-auto mt-10 max-w-sm p-6 text-center">
          <div className="mx-auto grid size-9 place-items-center rounded-xl bg-neutral-soft text-muted-foreground">
            <LockKeyhole className="size-4" />
          </div>
          <h2 className="mt-4 text-sm font-semibold tracking-tight">Sign in required</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Trainer records are only available to signed-in team members.
          </p>
          <Button variant="seal" className="mt-4 w-full" onClick={() => navigate({ to: "/auth" })}>
            Sign in
          </Button>
        </Panel>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Trainers"
          description="The people who deliver your sessions. Records only — they do not sign in."
          crumbs={[
            { label: "Seal", to: "/" },
            { label: "Settings", to: "/settings" },
            { label: "Trainers" },
          ]}
          actions={
            <Button variant="outline" size="sm" asChild>
              <Link to="/settings">Back to settings</Link>
            </Button>
          }
        />
        <TrainersPanel canManage={access.data?.isAdmin === true} />
      </div>
    </AppShell>
  );
}
