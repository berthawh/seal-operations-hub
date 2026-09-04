import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { GraduationCap, Globe, Linkedin, Plus, Sparkles, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Panel, PanelHeader } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { courseColour, courses } from "@/lib/seal-data";
import { CourseMultiSelect } from "@/components/seal/course-multi-select";
import { listTrainers, removeTrainer, saveTrainer } from "@/lib/trainers.functions";
import { supabase } from "@/integrations/supabase/client";

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  avatarUrl: "",
  linkedinUrl: "",
  websiteUrl: "",
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

/** Resolves a stored photo: an external link is used as-is, an uploaded file gets a signed link. */
function useTrainerPhoto(value: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (!value) {
      setUrl(null);
      return;
    }
    if (/^https?:\/\//.test(value)) {
      setUrl(value);
      return;
    }
    void supabase.storage
      .from("trainer-photos")
      .createSignedUrl(value, 60 * 60)
      .then(({ data }) => {
        if (active) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [value]);
  return url;
}

function TrainerAvatar({
  name,
  photo,
  className,
}: {
  name: string;
  photo: string | null | undefined;
  className?: string;
}) {
  const url = useTrainerPhoto(photo);
  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-neutral-soft text-xs font-semibold text-muted-foreground",
        className,
      )}
    >
      {url ? (
        <img
          src={url}
          alt={`${name} profile photo`}
          loading="lazy"
          className="size-full object-cover"
        />
      ) : (
        initials(name) || "?"
      )}
    </span>
  );
}

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
    <span
      className="inline-flex items-center gap-0.5"
      role={onChange ? "group" : undefined}
      aria-label={onChange ? "Star rating" : `Rated ${value} out of 5`}
    >
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
            aria-pressed={value >= n}
            className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadPhoto = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("That photo is larger than 5MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("trainer-photos")
      .upload(path, file, { contentType: file.type, upsert: false });
    setUploading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setForm((f) => ({ ...f, avatarUrl: path }));
  };

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
          specialism: courses
            .filter((c) => form.courseIds.includes(c.id))
            .map((c) => c.name)
            .join(", "),
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
                <TrainerAvatar name={t.fullName} photo={t.avatarUrl} />
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
                  {t.linkedinUrl || t.websiteUrl ? (
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      {t.linkedinUrl ? (
                        <a
                          href={t.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        >
                          <Linkedin className="size-3" /> LinkedIn
                        </a>
                      ) : null}
                      {t.websiteUrl ? (
                        <a
                          href={t.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        >
                          <Globe className="size-3" /> Profile
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.courseIds.length > 0 ? (
                      <>
                        {t.courseIds.slice(0, 4).map((id) => (
                          <CourseChip key={id} courseId={id} />
                        ))}
                        {t.courseIds.length > 4 ? (
                          <span
                            className="inline-flex items-center rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                            title={t.courseIds
                              .slice(4)
                              .map((id) => courses.find((c) => c.id === id)?.name)
                              .filter(Boolean)
                              .join(", ")}
                          >
                            +{t.courseIds.length - 4} more
                          </span>
                        ) : null}
                      </>
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
            <TrainerAvatar name={form.fullName} photo={form.avatarUrl} className="size-12" />
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Profile photo</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadPhoto(file);
                  e.target.value = "";
                }}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!canManage || uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="size-3.5" />
                  {uploading ? "Uploading…" : form.avatarUrl ? "Replace photo" : "Upload photo"}
                </Button>
                {form.avatarUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setForm((f) => ({ ...f, avatarUrl: "" }))}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
              <p className="text-[11px] text-muted-foreground">JPG or PNG, up to 5MB.</p>
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

          <CourseMultiSelect
            value={form.courseIds}
            onChange={(courseIds) => setForm((f) => ({ ...f, courseIds }))}
            disabled={!canManage}
          />

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

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="t-linkedin" className="text-xs">
                LinkedIn (optional)
              </Label>
              <Input
                id="t-linkedin"
                placeholder="https://linkedin.com/in/…"
                value={form.linkedinUrl}
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-website" className="text-xs">
                Other profile (optional)
              </Label>
              <Input
                id="t-website"
                placeholder="https://…"
                value={form.websiteUrl}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
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
