import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Bell, Check, Loader2, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/seal/app-shell";
import { EmptyState, PageHeader, Panel, PanelHeader } from "@/components/seal/primitives";
import { StatusChip } from "@/components/seal/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  dismissNotification,
  markNotificationsRead,
  notifyTeam,
  type NotificationTone,
} from "@/lib/notifications.functions";
import { useMyAccess, useNotifications, useRefreshGlobal } from "@/hooks/use-seal-session";

export const Route = createFileRoute("/settings/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Seal settings" },
      {
        name: "description",
        content: "Read workspace notifications and send announcements to the Seal training team.",
      },
      { property: "og:title", content: "Notifications — Seal settings" },
      { property: "og:description", content: "Workspace notifications and team announcements." },
    ],
  }),
  component: NotificationsPage,
});

const tones: { value: NotificationTone; label: string }[] = [
  { value: "info", label: "Update" },
  { value: "success", label: "Good news" },
  { value: "warning", label: "Needs attention" },
  { value: "danger", label: "Urgent" },
];

const toneChip: Record<NotificationTone, "neutral" | "success" | "warning" | "danger"> = {
  info: "neutral",
  success: "success",
  warning: "warning",
  danger: "danger",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function NotificationsPage() {
  const access = useMyAccess();
  const notifications = useNotifications();
  const refreshGlobal = useRefreshGlobal();
  const send = useServerFn(notifyTeam);
  const markRead = useServerFn(markNotificationsRead);
  const dismiss = useServerFn(dismissNotification);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tone, setTone] = useState<NotificationTone>("info");

  const sendMutation = useMutation({
    mutationFn: () => send({ data: { title, body, tone } }),
    onSuccess: (result) => {
      setTitle("");
      setBody("");
      refreshGlobal();
      toast.success("Notification sent", { description: `Delivered to ${result.sent} team member(s).` });
    },
    onError: (error: Error) => toast.error("Could not send", { description: error.message }),
  });

  const readMutation = useMutation({
    mutationFn: (id?: string) => markRead({ data: id ? { id } : {} }),
    onSuccess: refreshGlobal,
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => dismiss({ data: { id } }),
    onSuccess: refreshGlobal,
  });

  if (access.isLoading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" /> Loading notifications…
        </div>
      </AppShell>
    );
  }

  if (access.isError || !access.data) {
    return (
      <AppShell>
        <Panel className="mx-auto max-w-md p-8 text-center">
          <Bell className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold">Sign in to see your notifications</p>
          <Button variant="seal" className="mt-4" asChild>
            <Link to="/auth" search={{ redirect: "/settings/notifications" }}>
              Go to sign in
            </Link>
          </Button>
        </Panel>
      </AppShell>
    );
  }

  const items = notifications.data ?? [];
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Notifications"
          description="Everything the workspace has told you, plus announcements you can send to the team."
          crumbs={[
            { label: "Seal", to: "/" },
            { label: "Settings", to: "/settings" },
            { label: "Notifications" },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to="/settings">
                  <ArrowLeft className="size-4" /> Back to settings
                </Link>
              </Button>
              <Button
                variant="outline"
                disabled={!unread || readMutation.isPending}
                onClick={() => readMutation.mutate(undefined)}
              >
                <Check className="size-4" /> Mark all read
              </Button>
            </div>
          }
        />

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <Panel>
            <PanelHeader
              title="Your inbox"
              subtitle={unread ? `${unread} unread` : "You are all caught up"}
            />
            {notifications.isLoading ? (
              <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" /> Loading…
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No notifications yet"
                description="Team announcements and workspace alerts will appear here."
              />
            ) : (
              <div className="divide-y divide-border border-t border-border">
                {items.map((n) => (
                  <div key={n.id} className="flex gap-3 px-5 py-4 transition-colors hover:bg-muted/40">
                    <span
                      className={
                        "mt-1.5 size-2 shrink-0 rounded-full " + (n.readAt ? "bg-border" : "bg-seal")
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{n.title}</p>
                        <StatusChip tone={toneChip[n.tone]} size="sm" dot={false}>
                          {tones.find((t) => t.value === n.tone)?.label ?? "Update"}
                        </StatusChip>
                      </div>
                      {n.body ? <p className="mt-1 text-xs text-muted-foreground">{n.body}</p> : null}
                      <p className="mt-1 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
                    </div>
                    <div className="flex items-start gap-1">
                      {!n.readAt ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Mark read"
                          onClick={() => readMutation.mutate(n.id)}
                        >
                          <Check className="size-4" />
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Remove"
                        onClick={() => dismissMutation.mutate(n.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel className="h-fit">
            <PanelHeader title="Notify the team" subtitle="Admins only" />
            <div className="space-y-4 px-5 pb-5">
              <div className="space-y-1.5">
                <Label htmlFor="n-title" className="text-xs text-muted-foreground">
                  Title
                </Label>
                <Input
                  id="n-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Session paperwork due"
                  disabled={!access.data.isAdmin}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="n-body" className="text-xs text-muted-foreground">
                  Message
                </Label>
                <Textarea
                  id="n-body"
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Add any detail the team needs."
                  disabled={!access.data.isAdmin}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <div className="flex flex-wrap gap-1.5">
                  {tones.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      disabled={!access.data.isAdmin}
                      onClick={() => setTone(t.value)}
                      className={
                        "rounded-full border px-3 py-1 text-xs transition-colors " +
                        (tone === t.value
                          ? "border-seal bg-seal/10 font-medium text-foreground"
                          : "border-border text-muted-foreground hover:bg-muted/60")
                      }
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                variant="seal"
                className="w-full"
                disabled={!access.data.isAdmin || !title.trim() || sendMutation.isPending}
                onClick={() => sendMutation.mutate()}
              >
                {sendMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Send to everyone
              </Button>
              {!access.data.isAdmin ? (
                <p className="text-xs text-muted-foreground">
                  Only administrators can send workspace notifications.
                </p>
              ) : null}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
