import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Building2, Inbox, KeyRound, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/seal/app-shell";
import { Avatar, EmptyState, ListSkeleton, PageHeader, Panel } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ORG_RELATIONSHIPS,
  ORG_STATUSES,
  ORG_TYPES,
  listOrganisations,
  saveOrganisation,
} from "@/lib/organisations.functions";

export const Route = createFileRoute("/organisations/")({
  head: () => ({
    meta: [
      { title: "Organisations — Seal" },
      {
        name: "description",
        content:
          "Every company you work with: care agencies, care homes and training partners, with their portal access.",
      },
      { property: "og:title", content: "Organisations — Seal" },
      { property: "og:description", content: "Clients and training partners in one place." },
    ],
  }),
  component: OrganisationsPage,
});

const NONE = "__none";

function OrganisationsPage() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listOrganisations);
  const saveFn = useServerFn(saveOrganisation);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    shortName: "",
    orgType: ORG_TYPES[0] as string,
    relationship: ORG_RELATIONSHIPS[0] as string,
    status: NONE,
    location: "",
    contactEmail: "",
    notes: "",
  });

  const orgs = useQuery({
    queryKey: ["organisations"],
    queryFn: () => listFn(),
    enabled: typeof window !== "undefined",
    retry: false,
  });

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          name: form.name,
          shortName: form.shortName,
          orgType: form.orgType,
          relationship: form.relationship,
          status: form.status === NONE ? null : form.status,
          location: form.location,
          contactEmail: form.contactEmail,
          notes: form.notes,
        },
      }),
    onSuccess: () => {
      toast.success("Organisation added");
      setOpen(false);
      setForm({
        name: "",
        shortName: "",
        orgType: ORG_TYPES[0] as string,
        relationship: ORG_RELATIONSHIPS[0] as string,
        status: NONE,
        location: "",
        contactEmail: "",
        notes: "",
      });
      void queryClient.invalidateQueries({ queryKey: ["organisations"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Organisations"
          description="Every company you work with. A type says what they are, a relationship says how you work together, and portal access is granted by invitation only."
          crumbs={[{ label: "Seal", to: "/" }, { label: "Organisations" }]}
          actions={
            <>
              <Button variant="outline" asChild>
                <Link to="/bookings">
                  <Inbox className="size-4" /> Booking requests
                </Link>
              </Button>
              <Button variant="seal" onClick={() => setOpen(true)}>
                <Plus className="size-4" /> Add organisation
              </Button>
            </>
          }
        />

        {orgs.isLoading ? (
          <Panel className="p-6">
            <ListSkeleton rows={4} />
          </Panel>
        ) : orgs.error ? (
          <EmptyState
            icon={Building2}
            title="Sign in to see organisations"
            description="Organisation records are only visible to signed-in team members."
          />
        ) : !orgs.data?.length ? (
          <EmptyState
            icon={Building2}
            title="No organisations yet"
            description="Add the first care agency, care home or training partner you work with."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {orgs.data.map((o, i) => (
              <Link
                key={o.id}
                to="/organisations/$orgId"
                params={{ orgId: o.id }}
                className="hover-lift surface-card flex flex-col gap-5 p-6 sm:flex-row sm:items-center"
                style={{ animation: `rise 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 50}ms both` }}
              >
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <Avatar initials={o.shortName ?? "OR"} className="size-12 rounded-2xl text-sm" />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{o.name}</p>
                    {o.location ? (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3" /> {o.location}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusChip tone="neutral" size="sm" dot={false}>
                        {o.orgType}
                      </StatusChip>
                      <StatusChip tone="info" size="sm" dot={false}>
                        {o.relationship}
                      </StatusChip>
                      {o.status ? (
                        <StatusChip tone="warning" size="sm" dot={false}>
                          {o.status}
                        </StatusChip>
                      ) : null}
                      {o.portalEnabled ? (
                        <StatusChip tone="success" size="sm" dot={false}>
                          <KeyRound className="size-3" /> Portal · {o.memberCount} invited
                        </StatusChip>
                      ) : (
                        <StatusChip tone="neutral" size="sm" dot={false}>
                          No portal access
                        </StatusChip>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add organisation</DialogTitle>
            <DialogDescription>
              One record per company. You can turn on portal access and invite their people afterwards.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="org-name">Name</Label>
              <Input
                id="org-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ruby's Care"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="org-short">Short name</Label>
                <Input
                  id="org-short"
                  value={form.shortName}
                  onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                  placeholder="RC"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="org-location">Location</Label>
                <Input
                  id="org-location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Leeds, UK"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
                <Select
                  value={form.relationship}
                  onValueChange={(v) => setForm({ ...form, relationship: v })}
                >
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
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="grid gap-2">
                <Label htmlFor="org-email">Main contact email</Label>
                <Input
                  id="org-email"
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  placeholder="bookings@rubyscare.co.uk"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="org-notes">Notes</Label>
              <Textarea
                id="org-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="seal" disabled={save.isPending} onClick={() => save.mutate()}>
              {save.isPending ? "Saving…" : "Add organisation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
