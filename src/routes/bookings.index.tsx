import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, Check, Inbox, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/seal/app-shell";
import { EmptyState, ListSkeleton, PageHeader, Panel, PanelHeader } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { decideBookingRequest, listBookingRequests } from "@/lib/organisations.functions";

export const Route = createFileRoute("/bookings/")({
  head: () => ({
    meta: [
      { title: "Booking requests — Seal" },
      {
        name: "description",
        content: "Places requested by partner organisations, waiting for your team to confirm or decline.",
      },
      { property: "og:title", content: "Booking requests — Seal" },
      { property: "og:description", content: "Approve partner booking requests before places are held." },
    ],
  }),
  component: BookingsPage,
});

const toneFor = (status: string) =>
  status === "confirmed" ? "success" : status === "declined" ? "danger" : "warning";

function BookingsPage() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listBookingRequests);
  const decideFn = useServerFn(decideBookingRequest);

  const requests = useQuery({
    queryKey: ["booking-requests"],
    queryFn: () => listFn(),
    enabled: typeof window !== "undefined",
    retry: false,
  });

  const decide = useMutation({
    mutationFn: (input: { id: string; status: "confirmed" | "declined" }) => decideFn({ data: input }),
    onSuccess: (_r, input) => {
      toast.success(input.status === "confirmed" ? "Booking confirmed" : "Request declined");
      void queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const pending = (requests.data ?? []).filter((r) => r.status === "requested");
  const settled = (requests.data ?? []).filter((r) => r.status !== "requested");

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Booking requests"
          description="Partner organisations request places from their portal. Nothing is held until your team confirms it."
          crumbs={[{ label: "Seal", to: "/" }, { label: "Booking requests" }]}
          actions={
            <Button variant="outline" asChild>
              <Link to="/organisations">Organisations</Link>
            </Button>
          }
        />

        {requests.isLoading ? (
          <Panel className="p-6">
            <ListSkeleton rows={3} />
          </Panel>
        ) : requests.error ? (
          <EmptyState
            icon={Inbox}
            title="Sign in to see booking requests"
            description="Requests are only visible to signed-in team members."
          />
        ) : !requests.data?.length ? (
          <EmptyState
            icon={Inbox}
            title="No requests yet"
            description="When a partner asks for places from their portal, they will appear here for approval."
          />
        ) : (
          <div className="space-y-6">
            <Panel>
              <PanelHeader title="Awaiting your decision" subtitle={`${pending.length} open`} />
              <div className="divide-y">
                {pending.length ? (
                  pending.map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{r.courseName}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.organisationName} · {r.seats} place{r.seats === 1 ? "" : "s"}
                          {r.preferredDate ? ` · prefers ${r.preferredDate}` : ""}
                        </p>
                        {r.attendees ? (
                          <p className="mt-1 text-xs text-muted-foreground">Staff: {r.attendees}</p>
                        ) : null}
                        {r.notes ? <p className="mt-1 text-xs text-muted-foreground">{r.notes}</p> : null}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={decide.isPending}
                          onClick={() => decide.mutate({ id: r.id, status: "declined" })}
                        >
                          <X className="size-4" /> Decline
                        </Button>
                        <Button
                          variant="seal"
                          size="sm"
                          disabled={decide.isPending}
                          onClick={() => decide.mutate({ id: r.id, status: "confirmed" })}
                        >
                          <Check className="size-4" /> Confirm
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-sm text-muted-foreground">Nothing waiting. All caught up.</div>
                )}
              </div>
            </Panel>

            {settled.length ? (
              <Panel>
                <PanelHeader title="Decided" subtitle={`${settled.length} total`} />
                <div className="divide-y">
                  {settled.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-3 p-5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{r.courseName}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.organisationName} · {r.seats} place{r.seats === 1 ? "" : "s"}
                        </p>
                      </div>
                      <StatusChip tone={toneFor(r.status)} size="sm">
                        {r.status === "confirmed" ? "Confirmed" : "Declined"}
                      </StatusChip>
                    </div>
                  ))}
                </div>
              </Panel>
            ) : null}
          </div>
        )}

        <Panel className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
          <CalendarDays className="size-4" /> Confirmed requests still need scheduling against a session date.
        </Panel>
      </div>
    </AppShell>
  );
}
