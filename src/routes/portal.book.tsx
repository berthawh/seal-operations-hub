import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarPlus, Check, Clock, KeyRound, Minus, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/seal/app-shell";
import { CourseTerms } from "@/components/seal/course-terms";
import { EmptyState, ListSkeleton, PageHeader, Panel, PanelHeader } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { courses } from "@/lib/seal-data";
import { createBookingRequest, getMyPortal } from "@/lib/organisations.functions";

export const Route = createFileRoute("/portal/book")({
  head: () => ({
    meta: [
      { title: "Book a session — Seal" },
      {
        name: "description",
        content:
          "Choose a course, date, time and number of people, then send the booking to the training team to confirm.",
      },
      { property: "og:title", content: "Book a session — Seal" },
      {
        property: "og:description",
        content: "Pick a course, date and places for your staff in a few steps.",
      },
    ],
  }),
  component: BookSessionPage,
});

const START_TIMES = ["09:00", "09:30", "10:00", "13:00"];
const DURATIONS = [
  { label: "Full day (7 hours + 1 hour break)", hours: 8 },
  { label: "Half day (3 hours)", hours: 3 },
];

const addHours = (start: string, hours: number) => {
  const [h = 9, m = 0] = start.split(":").map(Number);
  const total = h * 60 + m + hours * 60;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

const prettyDate = (value: string) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "No date chosen yet";

function BookSessionPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const portalFn = useServerFn(getMyPortal);
  const createFn = useServerFn(createBookingRequest);

  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [durationHours, setDurationHours] = useState(8);
  const [seats, setSeats] = useState(1);
  const [attendees, setAttendees] = useState("");
  const [notes, setNotes] = useState("");

  const portal = useQuery({
    queryKey: ["my-portal"],
    queryFn: () => portalFn(),
    enabled: typeof window !== "undefined",
    retry: false,
  });

  const org = portal.data?.org ?? null;
  const endTime = addHours(startTime, durationHours);
  const course = courses.find((c) => c.id === courseId) ?? null;
  const today = new Date().toISOString().slice(0, 10);

  const submit = useMutation({
    mutationFn: () => {
      if (!org || !course) throw new Error("Choose a course first.");
      return createFn({
        data: {
          organisationId: org.id,
          courseId: course.id,
          courseName: course.name,
          preferredDate: date,
          preferredTime: startTime,
          endTime,
          seats,
          attendees,
          notes,
        },
      });
    },
    onSuccess: () => {
      toast.success("Booking sent — the training team will confirm your places");
      void queryClient.invalidateQueries({ queryKey: ["booking-requests"] });
      navigate({ to: "/portal" });
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

  if (!org.canBookSessions) {
    return (
      <AppShell>
        <EmptyState
          icon={CalendarPlus}
          title="Booking is not enabled yet"
          description="Your organisation cannot raise bookings from the portal. Contact the training team and they will arrange it."
        />
      </AppShell>
    );
  }

  const usual = org.preferredCourseIds.length
    ? courses.filter((c) => org.preferredCourseIds.includes(c.id))
    : [];
  const rest = usual.length ? courses.filter((c) => !org.preferredCourseIds.includes(c.id)) : courses;
  const ready = Boolean(course && date && seats > 0);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Book a session"
          description="Pick the course, the day, the time and how many people you are sending."
          crumbs={[{ label: "Portal", to: "/portal" }, { label: "Book a session" }]}
          actions={
            <Button variant="outline" asChild>
              <Link to="/portal">Cancel</Link>
            </Button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Panel>
              <PanelHeader
                title="1. Choose a course"
                subtitle={usual.length ? "Your usual courses come first" : "All available courses"}
              />
              <div className="space-y-5 px-5 pb-5">
                {usual.length ? (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      Courses you usually take
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {usual.map((c) => (
                        <CourseOption
                          key={c.id}
                          name={c.name}
                          code={c.code}
                          selected={courseId === c.id}
                          onSelect={() => setCourseId(c.id)}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="space-y-2">
                  {usual.length ? (
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                      Everything else
                    </p>
                  ) : null}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {rest.map((c) => (
                      <CourseOption
                        key={c.id}
                        name={c.name}
                        code={c.code}
                        selected={courseId === c.id}
                        onSelect={() => setCourseId(c.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="2. Day and time" subtitle="Classroom sessions run in the daytime" />
              <div className="grid gap-5 px-5 pb-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="bk-date">Date</Label>
                  <Input
                    id="bk-date"
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Start time</Label>
                  <div className="flex flex-wrap gap-2">
                    {START_TIMES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setStartTime(t)}
                        aria-pressed={startTime === t}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          startTime === t
                            ? "border-seal bg-seal-soft text-seal"
                            : "border-border hover:bg-muted/60"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label>Length</Label>
                  <div className="flex flex-wrap gap-2">
                    {DURATIONS.map((d) => (
                      <button
                        key={d.hours}
                        type="button"
                        onClick={() => setDurationHours(d.hours)}
                        aria-pressed={durationHours === d.hours}
                        className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                          durationHours === d.hours
                            ? "border-seal bg-seal-soft text-seal"
                            : "border-border hover:bg-muted/60"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" /> Finishes at {endTime}
                  </p>
                </div>
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="3. Who is coming" subtitle="Up to 20 people per classroom session" />
              <div className="space-y-5 px-5 pb-5">
                <div className="grid gap-2">
                  <Label>Number of people</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="One fewer place"
                      disabled={seats <= 1}
                      onClick={() => setSeats((n) => Math.max(1, n - 1))}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-12 text-center text-lg font-semibold tabular-nums">{seats}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="One more place"
                      disabled={seats >= 20}
                      onClick={() => setSeats((n) => Math.min(20, n + 1))}
                    >
                      <Plus className="size-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      <Users className="mr-1 inline size-3.5" />
                      {seats} place{seats === 1 ? "" : "s"} held on confirmation
                    </span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bk-staff">Staff attending</Label>
                  <Textarea
                    id="bk-staff"
                    rows={3}
                    placeholder="One name per line"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bk-notes">Anything we should know</Label>
                  <Textarea
                    id="bk-notes"
                    rows={2}
                    placeholder="Access needs, preferred trainer, split groups…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </Panel>

            <CourseTerms />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <Panel className="p-5">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Your booking
              </p>
              <p className="mt-3 text-sm font-semibold">{course?.name ?? "No course chosen yet"}</p>
              {course ? (
                <p className="text-xs text-muted-foreground">
                  {course.code} · certificate valid {course.validityMonths} months
                </p>
              ) : null}
              <dl className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-xs text-muted-foreground">Date</dt>
                  <dd className="text-right text-xs font-medium">{prettyDate(date)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-xs text-muted-foreground">Time</dt>
                  <dd className="text-xs font-medium">
                    {startTime}–{endTime}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-xs text-muted-foreground">People</dt>
                  <dd className="text-xs font-medium">{seats}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-xs text-muted-foreground">Organisation</dt>
                  <dd className="truncate text-xs font-medium">{org.name}</dd>
                </div>
              </dl>
              <Button
                variant="seal"
                className="mt-5 w-full"
                disabled={!ready || submit.isPending}
                onClick={() => submit.mutate()}
              >
                <Check className="size-4" />
                {submit.isPending ? "Sending…" : "Confirm booking"}
              </Button>
              <div className="mt-3 flex justify-center">
                <StatusChip tone="warning" size="sm">
                  Held once the training team confirms
                </StatusChip>
              </div>
            </Panel>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function CourseOption({
  name,
  code,
  selected,
  onSelect,
}: {
  name: string;
  code: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex items-start gap-2 rounded-xl border p-3 text-left transition-colors ${
        selected ? "border-seal bg-seal-soft" : "border-border hover:bg-muted/50"
      }`}
    >
      <span
        className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border ${
          selected ? "border-seal bg-seal text-white" : "border-border"
        }`}
      >
        {selected ? <Check className="size-2.5" /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-xs leading-snug font-medium">{name}</span>
        <span className="block text-[11px] text-muted-foreground">{code}</span>
      </span>
    </button>
  );
}
