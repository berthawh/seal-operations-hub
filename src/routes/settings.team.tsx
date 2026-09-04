import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LockKeyhole, ShieldCheck, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/seal/app-shell";
import { PageHeader, Panel, PanelHeader } from "@/components/seal/primitives";
import { TrainersPanel } from "@/components/seal/trainers-panel";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { updateMyProfile } from "@/lib/workspace.functions";
import { useRefreshGlobal } from "@/hooks/use-seal-session";
import {
  ROLE_HINTS,
  ROLE_LABELS,
  createMember,
  getMyAccess,
  listTeam,
  setMemberRoles,
  type AppRole,
} from "@/lib/team.functions";

const ROLES: AppRole[] = ["super_admin", "admin", "operations", "partner"];

export const Route = createFileRoute("/settings/team")({
  head: () => ({
    meta: [
      { title: "Team & access — Seal" },
      {
        name: "description",
        content: "Create Seal accounts for your training team and assign admin, operations or partner roles.",
      },
      { property: "og:title", content: "Team & access — Seal" },
      { property: "og:description", content: "Manage who can administer the Seal workspace." },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  const refreshGlobal = useRefreshGlobal();
  const updateProfileFn = useServerFn(updateMyProfile);
  const [profileForm, setProfileForm] = useState({ fullName: "", jobTitle: "" });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const myAccessFn = useServerFn(getMyAccess);
  const listTeamFn = useServerFn(listTeam);
  const setRolesFn = useServerFn(setMemberRoles);
  const createMemberFn = useServerFn(createMember);

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

  useEffect(() => {
    if (access.data && !profileLoaded) {
      setProfileForm({
        fullName: access.data.fullName ?? "",
        jobTitle: access.data.jobTitle ?? "",
      });
      setProfileLoaded(true);
    }
  }, [access.data, profileLoaded]);

  const profileMutation = useMutation({
    mutationFn: () => updateProfileFn({ data: profileForm }),
    onSuccess: () => {
      refreshGlobal();
      toast.success("Your details are updated everywhere.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const team = useQuery({
    queryKey: ["team"],
    queryFn: () => listTeamFn(),
    enabled: signedIn === true && access.data?.isAdmin === true,
  });

  const roleMutation = useMutation({
    mutationFn: (input: { userId: string; roles: AppRole[] }) => setRolesFn({ data: input }),
    onSuccess: () => {
      toast.success("Role updated.");
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    jobTitle: "",
    password: "",
    role: "operations" as AppRole,
  });

  const createMutation = useMutation({
    mutationFn: () => createMemberFn({ data: form }),
    onSuccess: () => {
      toast.success("Team member created.");
      setForm({ email: "", fullName: "", jobTitle: "", password: "", role: "operations" });
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (e: Error) => toast.error(e.message),
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
            Team and access management is only available to signed-in administrators.
          </p>
          <Button variant="seal" className="mt-4 w-full" onClick={() => navigate({ to: "/auth" })}>
            Sign in
          </Button>
        </Panel>
      </AppShell>
    );
  }

  const isAdmin = access.data?.isAdmin;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Team & access"
          description="Create accounts for your team and control what each person is responsible for."
          crumbs={[{ label: "Seal", to: "/" }, { label: "Settings", to: "/settings" }, { label: "Team & access" }]}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await queryClient.cancelQueries();
                queryClient.clear();
                await supabase.auth.signOut();
                navigate({ to: "/auth", replace: true });
              }}
            >
              Sign out
            </Button>
          }
        />

        <Panel className="flex flex-wrap items-center gap-4 p-5">
          <span className="grid size-9 place-items-center rounded-xl bg-neutral-soft text-muted-foreground">
            <ShieldCheck className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {access.data?.fullName ?? access.data?.email ?? "Your account"}
            </p>
            <p className="text-xs text-muted-foreground">
              {(access.data?.roles ?? []).map((r) => ROLE_LABELS[r]).join(", ") || "No role assigned yet"}
            </p>
          </div>
          <Link to="/settings" className="text-xs text-muted-foreground hover:text-foreground">
            Back to settings
          </Link>
        </Panel>

        <Panel>
          <PanelHeader title="Your details" subtitle="Shown across the workspace wherever you appear" />
          <div className="grid gap-4 px-5 pb-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="my-name" className="text-xs text-muted-foreground">
                Full name
              </Label>
              <Input
                id="my-name"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="my-title" className="text-xs text-muted-foreground">
                Job title
              </Label>
              <Input
                id="my-title"
                value={profileForm.jobTitle}
                onChange={(e) => setProfileForm((f) => ({ ...f, jobTitle: e.target.value }))}
              />
            </div>
            <Button
              variant="seal"
              disabled={profileMutation.isPending}
              onClick={() => profileMutation.mutate()}
            >
              Save details
            </Button>
          </div>
        </Panel>

        {isAdmin === false ? (
          <Panel className="p-6 text-sm text-muted-foreground">
            Your account does not have permission to manage team access. Ask an administrator to change your
            role.
          </Panel>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <Panel>
              <PanelHeader
                title="Workspace members"
                subtitle="Each person holds one responsibility level"
                action={
                  <StatusChip tone="neutral" size="sm" dot={false}>
                    <Users className="mr-1 size-3" /> {team.data?.length ?? 0}
                  </StatusChip>
                }
              />
              <div className="divide-y divide-border border-t border-border">
                {team.isLoading ? (
                  <p className="px-5 py-6 text-xs text-muted-foreground">Loading members…</p>
                ) : (team.data ?? []).length === 0 ? (
                  <p className="px-5 py-6 text-xs text-muted-foreground">No members yet.</p>
                ) : (
                  (team.data ?? []).map((m) => (
                    <div key={m.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{m.fullName ?? m.email ?? "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.email}
                          {m.jobTitle ? ` · ${m.jobTitle}` : ""}
                        </p>
                      </div>
                      <Select
                        value={m.roles[0] ?? "operations"}
                        onValueChange={(role) =>
                          roleMutation.mutate({ userId: m.id, roles: [role as AppRole] })
                        }
                      >
                        <SelectTrigger className="h-8 w-[180px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r} value={r} className="text-xs">
                              {ROLE_LABELS[r]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))
                )}
              </div>
            </Panel>

            <div className="space-y-5">
              <Panel>
                <PanelHeader title="Add a team member" subtitle="Creates a ready-to-use account" />
                <form
                  className="space-y-3 px-5 pb-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    createMutation.mutate();
                  }}
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="m-name" className="text-xs">Full name</Label>
                    <Input
                      id="m-name"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-email" className="text-xs">Email</Label>
                    <Input
                      id="m-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-title" className="text-xs">Job title</Label>
                    <Input
                      id="m-title"
                      value={form.jobTitle}
                      onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-pass" className="text-xs">Starting password</Label>
                    <Input
                      id="m-pass"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Role</Label>
                    <Select
                      value={form.role}
                      onValueChange={(role) => setForm({ ...form, role: role as AppRole })}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r} className="text-xs">
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">{ROLE_HINTS[form.role]}</p>
                  </div>
                  <Button type="submit" variant="seal" className="w-full" disabled={createMutation.isPending}>
                    <UserPlus className="size-4" /> Create member
                  </Button>
                </form>
              </Panel>

              <Panel className="p-5">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Responsibility levels
                </p>
                <ul className="mt-3 space-y-2.5">
                  {ROLES.map((r) => (
                    <li key={r}>
                      <p className="text-[13px] font-medium">{ROLE_LABELS[r]}</p>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">{ROLE_HINTS[r]}</p>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </div>
        )}

        <TrainersPanel canManage={isAdmin === true} />
      </div>
    </AppShell>
  );
}
