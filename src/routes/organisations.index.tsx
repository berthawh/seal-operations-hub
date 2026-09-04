import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Building2, Globe, Inbox, KeyRound, MapPin, Phone, Plus, Wand2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { courses } from "@/lib/seal-data";
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

/** Best-effort logo pulled from a company's own website. */
export function faviconFor(website: string) {
  const host = website.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return host ? `https://www.google.com/s2/favicons?domain=${host}&sz=128` : "";
}

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
    contactName: "",
    contactMobile: "",
    contactLandline: "",
    website: "",
    logoUrl: "",
    preferredCourseIds: [] as string[],
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
          contactName: form.contactName,
          contactMobile: form.contactMobile,
          contactLandline: form.contactLandline,
          website: form.website,
          logoUrl: form.logoUrl,
          preferredCourseIds: form.preferredCourseIds,
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
        contactName: "",
        contactMobile: "",
        contactLandline: "",
        website: "",
        logoUrl: "",
        preferredCourseIds: [] as string[],
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
                  {o.logoUrl ? (
                    <img
                      src={o.logoUrl}
                      alt=""
                      className="size-12 shrink-0 rounded-2xl border border-border bg-surface object-contain p-1.5"
                    />
                  ) : (
                    <Avatar initials={o.shortName ?? "OR"} className="size-12 rounded-2xl text-sm" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{o.name}</p>
                    {o.website ? (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Globe className="size-3" /> {o.website}
                      </p>
                    ) : null}
                    {o.contactMobile || o.contactLandline ? (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="size-3" /> {o.contactMobile || o.contactLandline}
                      </p>
                    ) : null}
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="org-contact">Main person to contact</Label>
                <Input
                  id="org-contact"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  placeholder="Ruby Adeyemi"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="org-mobile">Mobile</Label>
                <Input
                  id="org-mobile"
                  value={form.contactMobile}
                  onChange={(e) => setForm({ ...form, contactMobile: e.target.value })}
                  placeholder="07700 900123"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="org-landline">Landline</Label>
                <Input
                  id="org-landline"
                  value={form.contactLandline}
                  onChange={(e) => setForm({ ...form, contactLandline: e.target.value })}
                  placeholder="0113 496 0000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="org-website">Website</Label>
                <Input
                  id="org-website"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="rubyscare.co.uk"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="org-logo">Profile picture</Label>
              <div className="flex items-center gap-3">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt=""
                    className="size-10 shrink-0 rounded-xl border border-border object-contain p-1"
                  />
                ) : (
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-dashed border-border text-muted-foreground">
                    <Building2 className="size-4" />
                  </span>
                )}
                <Input
                  id="org-logo"
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="Paste an image link"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm({ ...form, logoUrl: faviconFor(form.website) })}
                  disabled={!form.website.trim()}
                >
                  <Wand2 className="size-4" /> From website
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Courses they usually take</Label>
              <p className="text-xs text-muted-foreground">
                Pick only the ones they normally book, not the whole catalogue.
              </p>
              <div className="grid max-h-48 gap-1.5 overflow-y-auto rounded-xl border border-border p-3 sm:grid-cols-2">
                {courses.map((c) => {
                  const checked = form.preferredCourseIds.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className="flex cursor-pointer items-start gap-2 rounded-lg px-1.5 py-1 text-xs hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          setForm({
                            ...form,
                            preferredCourseIds: v
                              ? [...form.preferredCourseIds, c.id]
                              : form.preferredCourseIds.filter((id) => id !== c.id),
                          })
                        }
                      />
                      <span className="leading-snug">{c.name}</span>
                    </label>
                  );
                })}
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
