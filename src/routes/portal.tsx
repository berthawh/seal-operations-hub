import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarPlus, KeyRound, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/seal/app-shell";
import { EmptyState, ListSkeleton, Metric, PageHeader, Panel, PanelHeader } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { courses } from "@/lib/seal-data";
import { createBookingRequest, getMyPortal, listBookingRequests } from "@/lib/organisations.functions";

export const Route = createFileRoute("/portal")({
  head: () => ({
    meta: [
      { title: "Partner portal — Seal" },
      {
        name: "description",
        content:
          "Partner organisations request training places, manage the staff they send and follow certificate status.",
      },
      { property: "og:title", content: "Partner portal — Seal" },
      { property: "og:description", content: "Request places and track your team's certificates." },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const queryClient = useQueryClient();
  const portalFn = useServerFn(getMyPortal);
  const listFn = useServerFn(listBookingRequests);
  const createFn = useServerFn(createBookingRequest);

  const [form, setForm] = useState({
    courseId: courses[0]?.id ?? "",
    preferredDate: "",
    seats: "1",
    attendees: "",
    notes: "",
  });

  const portal = useQuery({
    queryKey: ["my-portal"],
    queryFn: () => portalFn(),
    enabled: typeof window !== "undefined",
    retry: false,
  });
  const requests = useQuery({
    queryKey: ["booking-requests"],
    queryFn: () => listFn(),
    enabled: typeof window !== "undefined",
    retry: false,
  });

  const org = portal.data?.org ?? null;

  const submit = useMutation({
    mutationFn: () => {
      const course = courses.find((c) => c.id === form.courseId);
      if (!org || !course) throw new Error("Choose a course.");
      return createFn({
        data: {
          organisationId: org.id,
          courseId: course.id,
          courseName: course.name,
          preferredDate: form.preferredDate,
          seats: Number(form.seats) || 1,
          attendees: form.attendees,
          notes: form.notes,
        },
      });
    },
    onSuccess: () => {
      toast.success("Request sent — the training team will confirm your places");
      setForm({ ...form, attendees: "", notes: "", preferredDate: "" });
      void queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (portal.isLoading) {
    return (
      <AppShell>
        <Panel className="p-6">
          <ListSkeleton rows={4} />
        </Panel>
      </AppShell>
    );
  }

  if (!org) {
    return (
      <AppShell>
        <EmptyState
          icon={KeyRound}
          title="No portal access"
          description="This area is for invited partner organisations. Ask the Simplecare team to send you an invitation."
        />
      </AppShell>
    );
  }

  const myRequests = requests.data ?? [];

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title={org.name}
          description="Your training portal. Request places, keep your staff list current and follow certificate status."
          crumbs={[{ label: "Portal" }, { label: org.name }]}
          meta={
            <>
              <StatusChip tone="neutral" dot={false}>
                {org.orgType}
              </StatusChip>
              <StatusChip tone="info" dot={false}>
                {org.relationship}
              </StatusChip>
              {org.status ? <StatusChip tone="warning" dot={false}>{org.status}</StatusChip> : null}
            </>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Panel className="p-5">
            <Metric label="Open requests" value={myRequests.filter((r) => r.status === "requested").length} hint="awaiting confirmation" />
          </Panel>
          <Panel className="p-5">
            <Metric label="Confirmed" value={myRequests.filter((r) => r.status === "confirmed").length} hint="places held" tone="success" />
          </Panel>
          <Panel className="p-5">
            <Metric label="People invited" value={org.memberCount} hint="portal users" tone="seal" />
          </Panel>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Panel>
            <PanelHeader title="Your requests" subtitle="Every place is confirmed by the training team first" />
            <div className="divide-y">
              {myRequests.length ? (
                myRequests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-3 p-5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{r.courseName}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.seats} place{r.seats === 1 ? "" : "s"}
                        {r.preferredDate ? ` · prefers ${r.preferredDate}` : ""}
                      </p>
                    </div>
                    <StatusChip
                      tone={r.status === "confirmed" ? "success" : r.status === "declined" ? "danger" : "warning"}
                      size="sm"
                    >
                      {r.status === "confirmed" ? "Confirmed" : r.status === "declined" ? "Declined" : "Requested"}
                    </StatusChip>
                  </div>
                ))
              ) : (
                <div className="p-6 text-sm text-muted-foreground">
                  No requests yet. Ask for your first places on the right.
                </div>
              )}
            </div>
          </Panel>

          <Panel className="p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <CalendarPlus className="size-4" /> Request places
            </div>
            {org.canBookSessions ? (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Course</Label>
                  <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="pf-date">Preferred date</Label>
                    <Input
                      id="pf-date"
                      type="date"
                      value={form.preferredDate}
                      onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="pf-seats">Places</Label>
                    <Input
                      id="pf-seats"
                      type="number"
                      min={1}
                      value={form.seats}
                      onChange={(e) => setForm({ ...form, seats: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pf-staff">Staff attending</Label>
                  <Textarea
                    id="pf-staff"
                    rows={3}
                    placeholder="One name per line"
                    value={form.attendees}
                    onChange={(e) => setForm({ ...form, attendees: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pf-notes">Anything we should know</Label>
                  <Textarea
                    id="pf-notes"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
                <Button variant="seal" disabled={submit.isPending} onClick={() => submit.mutate()}>
                  {submit.isPending ? "Sending…" : "Send request"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Classroom courses run 9:00am–5:00pm with a one hour break. Certificates are valid for 12 months.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Booking is not enabled for your organisation yet. Contact the training team.
              </p>
            )}
          </Panel>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Panel className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
            <Users className="size-4" />
            {org.canManageStaff ? "You can keep your staff list up to date." : "Staff list is managed by the training team."}
          </Panel>
          <Panel className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
            <ShieldCheck className="size-4" />
            {org.canViewCertificates
              ? "Certificates for your staff are visible to you as soon as they are issued."
              : "Certificates are shared by the training team on request."}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
