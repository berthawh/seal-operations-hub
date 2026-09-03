import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, CalendarDays, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/seal/app-shell";
import { Field, PageHeader, Panel, PanelHeader, Avatar } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { courses, organisations, people } from "@/lib/seal-data";

export const Route = createFileRoute("/sessions/new")({
  head: () => ({
    meta: [
      { title: "Create session — Seal" },
      {
        name: "description",
        content: "A guided flow for scheduling a training session, roster and certificate rules.",
      },
      { property: "og:title", content: "Create session — Seal" },
      { property: "og:description", content: "Guided scheduling for a new training session." },
    ],
  }),
  component: CreateSession,
});

const steps = [
  { id: 1, label: "Course & schedule", icon: CalendarDays },
  { id: 2, label: "Attendees", icon: Users },
  { id: 3, label: "Certificates & review", icon: Sparkles },
];

function CreateSession() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [courseId, setCourseId] = useState(courses[0]!.id);
  const [orgId, setOrgId] = useState(organisations[0]!.id);
  const [trainerId, setTrainerId] = useState("per-1");
  const [date, setDate] = useState("2026-09-30");
  const [time, setTime] = useState("09:00");
  const [selected, setSelected] = useState<string[]>(["per-2"]);
  const [autoIssue, setAutoIssue] = useState(true);

  const course = courses.find((c) => c.id === courseId);
  const org = organisations.find((o) => o.id === orgId);
  const learners = people.filter((p) => p.role === "Learner");

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <PageHeader
          title="Create session"
          description="Three focused steps. Nothing is scheduled until you confirm."
          crumbs={[
            { label: "Seal", to: "/" },
            { label: "Sessions", to: "/sessions" },
            { label: "Create" },
          ]}
          actions={
            <Button variant="ghost" asChild>
              <Link to="/sessions">Cancel</Link>
            </Button>
          }
        />

        <Panel className="p-2">
          <ol className="flex items-center">
            {steps.map((s, i) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <li key={s.id} className="flex flex-1 items-center gap-3 px-3 py-2">
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-xl text-xs font-bold transition-all duration-300 ${
                      done
                        ? "bg-success text-success-foreground"
                        : active
                          ? "bg-gradient-seal text-seal-foreground shadow-seal"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="size-4" /> : s.id}
                  </span>
                  <span
                    className={`hidden text-sm font-medium sm:block ${active ? "" : "text-muted-foreground"}`}
                  >
                    {s.label}
                  </span>
                  {i < steps.length - 1 ? (
                    <span className="ml-auto hidden h-px flex-1 bg-border sm:block" />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <Panel key={step} className="animate-[rise_0.35s_cubic-bezier(0.22,1,0.36,1)_both] p-6">
            {step === 1 ? (
              <div className="space-y-5">
                <PanelHeader
                  className="p-0 pb-2"
                  title="Course & schedule"
                  subtitle="Pick the programme and when it runs."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Course</Label>
                    <Select value={courseId} onValueChange={setCourseId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {courses
                          .filter((c) => c.status === "active")
                          .map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name} · {c.code}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Start time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Organisation</Label>
                    <Select value={orgId} onValueChange={setOrgId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {organisations.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Trainer</Label>
                    <Select value={trainerId} onValueChange={setTrainerId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {people
                          .filter((p) => p.role === "Trainer" || p.role === "Coordinator")
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="loc">Location</Label>
                    <Input id="loc" placeholder="Training suite, address or video link" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="notes">Notes for the trainer</Label>
                    <Textarea id="notes" rows={3} placeholder="Optional" />
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-5">
                <PanelHeader
                  className="p-0 pb-2"
                  title="Attendees"
                  subtitle="Add learners now or invite them later."
                />
                <div className="space-y-2">
                  {learners.map((p) => {
                    const checked = selected.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${
                          checked
                            ? "border-seal/50 bg-seal-soft/50 shadow-card"
                            : "border-border hover:border-seal/30"
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) =>
                            setSelected((prev) =>
                              v ? [...prev, p.id] : prev.filter((id) => id !== p.id),
                            )
                          }
                        />
                        <Avatar initials={p.initials} className="size-8" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{p.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{p.jobTitle}</p>
                        </div>
                        <StatusChip tone="neutral" size="sm" dot={false}>
                          {p.certificates} certificates
                        </StatusChip>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selected.length} attendee{selected.length === 1 ? "" : "s"} selected
                </p>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-5">
                <PanelHeader
                  className="p-0 pb-2"
                  title="Certificates & review"
                  subtitle="Decide how credentials are handled after completion."
                />
                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="text-sm font-semibold">Generate certificates on completion</p>
                    <p className="text-xs text-muted-foreground">
                      Certificates enter the approval queue rather than issuing immediately.
                    </p>
                  </div>
                  <Switch checked={autoIssue} onCheckedChange={setAutoIssue} />
                </div>
                <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
                  <Field label="Course" value={course?.name} />
                  <Field label="Organisation" value={org?.name} />
                  <Field label="Date" value={`${date} · ${time}`} />
                  <Field label="Attendees" value={`${selected.length} learners`} />
                  <Field
                    label="Certificate rule"
                    value={autoIssue ? "Auto-generate, manual approval" : "Manual creation"}
                  />
                  <Field label="Tracking" value="Attendance + assessment" />
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
              <Button
                variant="ghost"
                disabled={step === 1}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              {step < 3 ? (
                <Button variant="seal" onClick={() => setStep((s) => s + 1)}>
                  Continue <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  variant="seal"
                  onClick={() => {
                    toast.success("Session scheduled", {
                      description: `${course?.name} · ${date} at ${time}`,
                    });
                    void navigate({ to: "/sessions" });
                  }}
                >
                  <Check className="size-4" /> Schedule session
                </Button>
              )}
            </div>
          </Panel>

          <aside className="space-y-4">
            <Panel className="p-5">
              <PanelHeader className="p-0 pb-3" title="Summary" />
              <div className="space-y-3">
                <Field label="Course" value={course?.name ?? "—"} />
                <Field label="When" value={`${date} · ${time}`} />
                <Field label="Organisation" value={org?.name ?? "—"} />
                <Field label="Attendees" value={`${selected.length} selected`} />
              </div>
            </Panel>
            <Panel className="bg-surface-sunken p-5">
              <p className="text-sm font-semibold">Controlled catalogue</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Courses are selected from the controlled catalogue of 16 types and cannot be edited
                here. Every course issues certificates valid for 12 months.
              </p>
            </Panel>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
