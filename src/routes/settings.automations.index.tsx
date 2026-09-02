import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus, Workflow, Zap } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/seal/app-shell";
import { Metric, PageHeader, Panel } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { automations } from "@/lib/seal-data";

export const Route = createFileRoute("/settings/automations/")({
  head: () => ({
    meta: [
      { title: "Automations — Settings · Seal" },
      {
        name: "description",
        content: "Automations that issue certificates, chase attendance and send renewal reminders.",
      },
      { property: "og:title", content: "Automations — Seal" },
      { property: "og:description", content: "Triggers and actions that run your training workflows." },
    ],
  }),
  component: AutomationsPage,
});

function AutomationsPage() {
  const [state, setState] = useState(() =>
    Object.fromEntries(automations.map((a) => [a.id, a.enabled])),
  );
  const enabled = Object.values(state).filter(Boolean).length;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Automations"
          description="Rules that run quietly in the background so your team doesn't chase paperwork."
          crumbs={[
            { label: "Seal", to: "/" },
            { label: "Settings", to: "/settings" },
            { label: "Automations" },
          ]}
          actions={
            <Button variant="seal" onClick={() => toast.info("Automation builder coming soon")}>
              <Plus className="size-4" /> New automation
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Panel className="p-5">
            <Metric label="Enabled" value={enabled} hint="running now" tone="success" />
          </Panel>
          <Panel className="p-5">
            <Metric
              label="Paused"
              value={automations.length - enabled}
              hint="not running"
              tone="warning"
            />
          </Panel>
          <Panel className="p-5">
            <Metric
              label="Total runs"
              value={automations.reduce((s, a) => s + a.runs, 0)}
              hint="last 90 days"
              tone="seal"
            />
          </Panel>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {automations.map((a, i) => (
            <Panel
              key={a.id}
              className="hover-lift p-5"
              style={{ animation: `rise 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 50}ms both` }}
            >
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-seal/10 text-seal">
                  <Zap className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/settings/automations/$automationId"
                    params={{ automationId: a.id }}
                    className="text-sm font-semibold hover:text-seal"
                  >
                    {a.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{a.workflow} workflow</p>
                </div>
                <Switch
                  checked={state[a.id] ?? false}
                  onCheckedChange={(v) => {
                    setState((s) => ({ ...s, [a.id]: v }));
                    toast.success(`${a.name} ${v ? "enabled" : "paused"}`);
                  }}
                />
              </div>

              <div className="mt-4 space-y-2 rounded-xl bg-surface-sunken p-4 text-xs">
                <div className="flex gap-2">
                  <span className="w-14 shrink-0 text-muted-foreground">When</span>
                  <span className="font-medium">{a.trigger}</span>
                </div>
                <div className="flex gap-2">
                  <span className="w-14 shrink-0 text-muted-foreground">Then</span>
                  <span className="font-medium">{a.action}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
                <StatusChip tone={state[a.id] ? "success" : "neutral"} size="sm">
                  {state[a.id] ? "Enabled" : "Paused"}
                </StatusChip>
                <span>{a.runs} runs</span>
                <Link
                  to="/settings/automations/$automationId"
                  params={{ automationId: a.id }}
                  className="ml-auto flex items-center gap-1 font-medium hover:text-seal"
                >
                  Edit <ArrowRight className="size-3" />
                </Link>
              </div>
            </Panel>
          ))}
        </div>

        <Panel className="flex flex-wrap items-center gap-4 bg-surface-sunken p-5">
          <Workflow className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            The automation model stays deliberately simple — trigger, action, workflow — so new rules
            can be added later without reshaping the UI.
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}
