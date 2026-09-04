import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { GraduationCap, Plus, Sparkles, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Panel, PanelHeader } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { courseColour, courses } from "@/lib/seal-data";
import { listTrainers, removeTrainer, saveTrainer } from "@/lib/trainers.functions";

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  avatarUrl: "",
  courseIds: [] as string[],
  recommended: false,
  rating: 0,
};

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

/** Small coloured chip for a course, colour-coded by catalogue category. */
function CourseChip({ courseId, className }: { courseId: string; className?: string }) {
  const course = courses.find((c) => c.id === courseId);
  const colour = courseColour(courseId);
  if (!course) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        colour.chip,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", colour.dot)} />
      {course.name}
    </span>
  );
}

/** Read-only or interactive 5-star rating. */
function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange?: (v: number) => void;
}) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = value >= n;
        const star = (
          <Star
            className={cn(
              "size-3.5",
              filled ? "fill-warning text-warning" : "text-muted-foreground/40",
            )}
          />
        );
        return onChange ? (
          <button
            key={n}
            type="button"
            aria-label={`Rate ${n} out of 5`}
            className="rounded p-0.5 transition-transform hover:scale-110"
            onClick={() => onChange(value === n ? 0 : n)}
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </span>
  );
}

/** Trainers who deliver sessions. Records only — they do not sign in. */
export function TrainersPanel({ canManage }: { canManage: boolean }) {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listTrainers);
  const saveFn = useServerFn(saveTrainer);
  const removeFn = useServerFn(removeTrainer);
  const [form, setForm] = useState(EMPTY);

  const trainers = useQuery({
    queryKey: ["trainers"],
    queryFn: () => listFn(),
    enabled: typeof window !== "undefined",
    retry: false,
  });

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          ...form,
          specialism:
            courses
              .filter((c) => form.courseIds.includes(c.id))
              .map((c) => c.name)
              .join(", ") || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Trainer added.");
      setForm(EMPTY);
      void queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Trainer removed.");
      void queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = trainers.data ?? [];
  const toggleCourse = (id: string) =>
    setForm((f) => ({
      ...f,
      courseIds: f.courseIds.includes(id)
        ? f.courseIds.filter((c) => c !== id)
        : [...f.courseIds, id],
    }));

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <Panel>
        <PanelHeader
          title="Trainers"
          subtitle="The people who deliver your sessions"
          action={
            <StatusChip tone="neutral" size="sm" dot={false}>
              <GraduationCap className="mr-1 size-3" /> {rows.length}
            </StatusChip>
          }
        />
        <div className="divide-y divide-border border-t border-border">
          {trainers.isLoading ? (
            <p className="px-5 py-6 text-xs text-muted-foreground">Loading trainers…</p>
          ) : rows.length === 0 ? (
            <p className="px-5 py-6 text-xs text-muted-foreground">
              No trainers yet. Add the first one on the right.
            </p>
          ) : (
            rows.map((t) => (
              <div key={t.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-neutral-soft text-xs font-semibold text-muted-foreground">
                  {t.avatarUrl ? (
                    <img
                      src={t.avatarUrl}
                      alt={`${t.fullName} profile photo`}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : (
                    initials(t.fullName)
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{t.fullName}</p>
                    {t.recommended ? (
                      <StatusChip tone="seal" size="sm" dot={false}>
                        <Sparkles className="mr-1 size-3" /> Most recommended
                      </StatusChip>
                    ) : null}
                    {t.rating > 0 ? <Stars value={t.rating} /> : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {[t.email, t.phone].filter(Boolean).join(" · ") || "No contact details yet"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.courseIds.length > 0 ? (
                      t.courseIds.map((id) => <CourseChip key={id} courseId={id} />)
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        {t.specialism || "No courses assigned yet"}
                      </span>
                    )}
                  </div>
                </div>
                <StatusChip tone={t.status === "active" ? "success" : "neutral"} size="sm">
                  {t.status === "active" ? "Active" : "Inactive"}
                </StatusChip>
                {canManage ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${t.fullName}`}
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(t.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Add a trainer" subtitle="A record only — no sign-in is created" />
        <form
          className="space-y-4 px-5 pb-5"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-neutral-soft text-xs font-semibold text-muted-foreground">
              {form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt="Trainer profile preview"
                  className="size-full object-cover"
                />
              ) : (
                initials(form.fullName) || "?"
              )}
            </span>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="t-avatar" className="text-xs">
                Profile photo link
              </Label>
              <Input
                id="t-avatar"
                placeholder="https://…"
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="t-name" className="text-xs">
              Full name
            </Label>
            <Input
              id="t-name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Courses they deliver</Label>
            <div className="max-h-52 overflow-y-auto rounded-xl border border-border p-2">
              <div className="flex flex-wrap gap-1.5">
                {courses.map((c) => {
                  const on = form.courseIds.includes(c.id);
                  const colour = courseColour(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleCourse(c.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium transition-colors",
                        on
                          ? colour.chip
                          : "border-border bg-transparent text-muted-foreground hover:bg-muted/60",
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", colour.dot)} />
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {form.courseIds.length} selected — colours match the course catalogue.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="t-email" className="text-xs">
                Email
              </Label>
              <Input
                id="t-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-phone" className="text-xs">
                Phone
              </Label>
              <Input
                id="t-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Star rating</Label>
            <div className="flex items-center gap-2">
              <Stars value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
              <span className="text-[11px] text-muted-foreground">
                {form.rating > 0 ? `${form.rating} of 5` : "Not rated"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium">Most recommended</p>
              <p className="text-[11px] text-muted-foreground">
                Pinned to the top of the trainer list.
              </p>
            </div>
            <Switch
              checked={form.recommended}
              onCheckedChange={(recommended) => setForm({ ...form, recommended })}
            />
          </div>

          <Button
            type="submit"
            variant="seal"
            className="w-full"
            disabled={!canManage || save.isPending}
          >
            <Plus className="size-4" /> Add trainer
          </Button>
          {!canManage ? (
            <p className="text-[11px] text-muted-foreground">
              Only administrators can add or remove trainers.
            </p>
          ) : null}
        </form>
      </Panel>
    </div>
  );
}
