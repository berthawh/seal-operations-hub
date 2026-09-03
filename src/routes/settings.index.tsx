import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Building2, FileBadge, LockKeyhole, Users, Workflow } from "lucide-react";
import { AppShell } from "@/components/seal/app-shell";
import { Field, PageHeader, Panel, PanelHeader } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { automations } from "@/lib/seal-data";

export const Route = createFileRoute("/settings/")({
  head: () => ({
    meta: [
      { title: "Settings — Seal" },
      {
        name: "description",
        content: "Configure your Seal workspace: organisation profile, certificates, notifications and automations.",
      },
      { property: "og:title", content: "Settings — Seal" },
      { property: "og:description", content: "Workspace configuration and automation controls." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const enabled = automations.filter((a) => a.enabled).length;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Workspace configuration for how Seal runs your training operation."
          crumbs={[{ label: "Seal", to: "/" }, { label: "Settings" }]}
        />

        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <nav className="surface-card h-fit p-2 text-sm">
            {[
              { label: "Workspace", icon: Building2, active: true },
              { label: "Certificates", icon: FileBadge },
              { label: "Team & access", icon: Users },
              { label: "Notifications", icon: Bell },
            ].map((s) => (
              <button
                key={s.label}
                className={
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors " +
                  (s.active ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/60")
                }
              >
                <s.icon className="size-4" /> {s.label}
              </button>
            ))}
            <Link
              to="/settings/automations"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted/60"
            >
              <Workflow className="size-4" /> Automations
              <StatusChip tone="seal" size="sm" dot={false} className="ml-auto">
                {enabled}
              </StatusChip>
            </Link>
            <div className="my-2 border-t border-border/70" />
            <Link
              to="/settings/studio"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-muted/60"
            >
              <LockKeyhole className="size-4" /> CO Studio
              <StatusChip tone="neutral" size="sm" dot={false} className="ml-auto">
                Locked
              </StatusChip>
            </Link>
          </nav>

          <div className="space-y-5">
            <Panel>
              <PanelHeader title="Workspace" subtitle="Identity used across certificates and emails" />
              <div className="grid gap-5 px-5 pb-5 sm:grid-cols-2">
                <Field label="Workspace name" value="Seal Training Operations" />
                <Field label="Region" value="United Kingdom" />
                <Field label="Certificate prefix" value="SEAL" />
                <Field label="Default validity" value="24 months" />
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Certificate issuing"
                subtitle="Controls applied to every generated credential"
              />
              <div className="divide-y divide-border border-t border-border">
                {[
                  {
                    label: "Require approval before PDF generation",
                    hint: "Certificates enter preview and approval first.",
                    on: true,
                  },
                  {
                    label: "Email certificates to learners",
                    hint: "Sends the PDF once approved.",
                    on: true,
                  },
                  {
                    label: "Include QR verification on the back",
                    hint: "Adds a scannable verification code.",
                    on: false,
                  },
                ].map((r) => (
                  <div key={r.label} className="flex items-center gap-4 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.hint}</p>
                    </div>
                    <Switch defaultChecked={r.on} />
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Automations</p>
                <p className="text-xs text-muted-foreground">
                  {enabled} of {automations.length} automations are currently enabled.
                </p>
              </div>
              <Button variant="seal" asChild>
                <Link to="/settings/automations">
                  <Workflow className="size-4" /> Manage automations
                </Link>
              </Button>
            </Panel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
