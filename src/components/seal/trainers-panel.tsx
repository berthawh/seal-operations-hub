import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Panel, PanelHeader } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listTrainers, removeTrainer, saveTrainer } from "@/lib/trainers.functions";

const EMPTY = { fullName: "", email: "", phone: "", specialism: "" };

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
    mutationFn: () => saveFn({ data: form }),
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
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
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
              <div key={t.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[t.specialism, t.email, t.phone].filter(Boolean).join(" · ") ||
                      "No contact details yet"}
                  </p>
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
          className="space-y-3 px-5 pb-5"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
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
            <Label htmlFor="t-spec" className="text-xs">
              Specialism
            </Label>
            <Input
              id="t-spec"
              placeholder="Moving & handling"
              value={form.specialism}
              onChange={(e) => setForm({ ...form, specialism: e.target.value })}
            />
          </div>
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
