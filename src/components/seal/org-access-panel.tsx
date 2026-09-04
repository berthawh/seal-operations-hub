import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Panel, PanelHeader } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ORG_RELATIONSHIPS,
  ORG_STATUSES,
  ORG_TYPES,
  getOrganisation,
  inviteOrgMember,
  removeOrgMember,
  saveOrganisation,
} from "@/lib/organisations.functions";

const NONE = "__none";

/** Classification and invite-only portal access for one organisation. */
export function OrgAccessPanel({ orgId }: { orgId: string }) {
  const queryClient = useQueryClient();
  const getFn = useServerFn(getOrganisation);
  const saveFn = useServerFn(saveOrganisation);
  const inviteFn = useServerFn(inviteOrgMember);
  const removeFn = useServerFn(removeOrgMember);

  const query = useQuery({
    queryKey: ["organisation", orgId],
    queryFn: () => getFn({ data: { id: orgId } }),
    enabled: typeof window !== "undefined",
    retry: false,
  });
  const org = query.data?.org ?? null;

  const [form, setForm] = useState({
    orgType: ORG_TYPES[0] as string,
    relationship: ORG_RELATIONSHIPS[0] as string,
    status: NONE,
    portalEnabled: false,
    canInviteMembers: false,
    canBookSessions: true,
    canManageStaff: true,
    canViewCertificates: true,
  });
  const [loaded, setLoaded] = useState(false);
  const [invite, setInvite] = useState({ email: "", fullName: "", password: "", portalRole: "member" });

  useEffect(() => {
    if (org && !loaded) {
      setForm({
        orgType: org.orgType,
        relationship: org.relationship,
        status: org.status ?? NONE,
        portalEnabled: org.portalEnabled,
        canInviteMembers: org.canInviteMembers,
        canBookSessions: org.canBookSessions,
        canManageStaff: org.canManageStaff,
        canViewCertificates: org.canViewCertificates,
      });
      setLoaded(true);
    }
  }, [org, loaded]);

  const save = useMutation({
    mutationFn: () => {
      if (!org) throw new Error("Organisation not found.");
      return saveFn({
        data: {
          id: org.id,
          name: org.name,
          shortName: org.shortName ?? "",
          orgType: form.orgType,
          relationship: form.relationship,
          status: form.status === NONE ? null : form.status,
          sector: org.sector ?? "",
          location: org.location ?? "",
          contactEmail: org.contactEmail ?? "",
          notes: org.notes ?? "",
          portalEnabled: form.portalEnabled,
          canInviteMembers: form.canInviteMembers,
          canBookSessions: form.canBookSessions,
          canManageStaff: form.canManageStaff,
          canViewCertificates: form.canViewCertificates,
        },
      });
    },
    onSuccess: () => {
      toast.success("Organisation updated");
      void queryClient.invalidateQueries({ queryKey: ["organisation", orgId] });
      void queryClient.invalidateQueries({ queryKey: ["organisations"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const sendInvite = useMutation({
    mutationFn: () => inviteFn({ data: { organisationId: orgId, ...invite } }),
    onSuccess: () => {
      toast.success("Invitation created — share the sign-in details securely");
      setInvite({ email: "", fullName: "", password: "", portalRole: "member" });
      void queryClient.invalidateQueries({ queryKey: ["organisation", orgId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (memberId: string) => removeFn({ data: { memberId } }),
    onSuccess: () => {
      toast.success("Portal access removed");
      void queryClient.invalidateQueries({ queryKey: ["organisation", orgId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!org) {
    return (
      <Panel className="p-6 text-sm text-muted-foreground">
        {query.isLoading
          ? "Loading organisation record…"
          : "This organisation has no record yet, or you are not signed in."}
      </Panel>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel>
        <PanelHeader title="Classification" subtitle="What they are, and how you work together" />
        <div className="grid gap-4 p-5">
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={form.orgType} onValueChange={(v) => setForm({ ...form, orgType: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORG_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Relationship</Label>
            <Select value={form.relationship} onValueChange={(v) => setForm({ ...form, relationship: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORG_RELATIONSHIPS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No status</SelectItem>
                {ORG_STATUSES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Portal access"
          subtitle="Invite only — nobody can sign themselves up"
          action={
            <StatusChip tone={form.portalEnabled ? "success" : "neutral"} size="sm" dot={false}>
              <KeyRound className="size-3" /> {form.portalEnabled ? "Enabled" : "Off"}
            </StatusChip>
          }
        />
        <div className="grid gap-4 p-5">
          {(
            [
              ["portalEnabled", "Portal access", "They can sign in and see their own organisation only."],
              ["canBookSessions", "Request bookings", "Requests come to your team for approval."],
              ["canManageStaff", "Manage their staff list", "Add and edit the people they send."],
              ["canViewCertificates", "View certificates", "See and download certificates for their staff."],
              ["canInviteMembers", "Invite their own users", "Off by default — only grant this deliberately."],
            ] as const
          ).map(([key, label, hint]) => (
            <label key={key} className="flex items-start justify-between gap-4">
              <span>
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-xs text-muted-foreground">{hint}</span>
              </span>
              <Switch
                checked={form[key]}
                onCheckedChange={(v) => setForm({ ...form, [key]: v })}
                disabled={key !== "portalEnabled" && !form.portalEnabled}
              />
            </label>
          ))}
          <Button variant="seal" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? "Saving…" : "Save organisation"}
          </Button>
        </div>
      </Panel>

      <Panel className="lg:col-span-2">
        <PanelHeader
          title="Invited people"
          subtitle={`${query.data?.members.length ?? 0} with portal access`}
        />
        <div className="divide-y">
          {query.data?.members.length ? (
            query.data.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.fullName ?? m.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.email} · {m.portalRole === "admin" ? "Organisation admin" : "Member"}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => remove.mutate(m.id)}>
                  <Trash2 className="size-4" /> Remove
                </Button>
              </div>
            ))
          ) : (
            <div className="p-5 text-sm text-muted-foreground">Nobody from this organisation has access yet.</div>
          )}
        </div>
        <div className="grid gap-4 border-t border-border p-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="grid gap-2">
            <Label htmlFor="inv-name">Full name</Label>
            <Input
              id="inv-name"
              value={invite.fullName}
              onChange={(e) => setInvite({ ...invite, fullName: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="inv-email">Email</Label>
            <Input
              id="inv-email"
              type="email"
              value={invite.email}
              onChange={(e) => setInvite({ ...invite, email: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="inv-pass">Starting password</Label>
            <Input
              id="inv-pass"
              value={invite.password}
              onChange={(e) => setInvite({ ...invite, password: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Portal role</Label>
            <Select value={invite.portalRole} onValueChange={(v) => setInvite({ ...invite, portalRole: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Organisation admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="seal"
            className="self-end"
            disabled={sendInvite.isPending || !form.portalEnabled}
            onClick={() => sendInvite.mutate()}
          >
            <UserPlus className="size-4" /> {sendInvite.isPending ? "Inviting…" : "Invite"}
          </Button>
        </div>
      </Panel>
    </div>
  );
}
