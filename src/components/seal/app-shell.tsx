import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Plus,
  Radar,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { StatusChip } from "./status-chip";
import { Avatar } from "./primitives";

const nav = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Sessions", to: "/sessions", icon: CalendarDays, badge: "6" },
  { label: "Courses", to: "/courses", icon: GraduationCap },
  { label: "Certificates", to: "/certificates", icon: ShieldCheck, badge: "2" },
  { label: "People", to: "/people", icon: Users },
  { label: "Organisations", to: "/organisations", icon: Building2 },
  { label: "Tracking", to: "/tracking", icon: Radar, badge: "!" },
];

const secondary = [
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "Automations", to: "/settings/automations", icon: Sparkles },
];

const notifications = [
  {
    title: "Certificate awaiting approval",
    detail: "SEAL-2026-0421 · Sofia Marchetti",
    tone: "warning" as const,
    time: "12m",
  },
  {
    title: "Tracking item overdue",
    detail: "Attendance confirmation · SES-2465",
    tone: "danger" as const,
    time: "6d",
  },
  {
    title: "Session completed",
    detail: "SES-2470 · Harbourline Logistics",
    tone: "success" as const,
    time: "1w",
  },
];

function NavList({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const item = (
    entry: { label: string; to: string; icon: React.ComponentType<{ className?: string }>; badge?: string },
    exact = false,
  ) => {
    const active = exact ? pathname === entry.to : pathname.startsWith(entry.to) && entry.to !== "/";
    const isActive = entry.to === "/" ? pathname === "/" : active;
    return (
      <Link
        key={entry.to}
        to={entry.to}
        onClick={onNavigate}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.06)]"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary transition-all duration-300",
            isActive ? "opacity-100" : "scale-y-0 opacity-0",
          )}
        />
        <entry.icon className="size-[18px] shrink-0 opacity-90" />
        <span className="flex-1 truncate">{entry.label}</span>
        {entry.badge ? (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              entry.badge === "!"
                ? "bg-seal text-seal-foreground"
                : "bg-sidebar-border/70 text-sidebar-foreground",
            )}
          >
            {entry.badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <nav className="flex flex-1 flex-col gap-6 px-3">
      <div className="space-y-1">
        <p className="px-3 pb-1 text-[10px] font-bold tracking-[0.18em] text-sidebar-foreground/40 uppercase">
          Operations
        </p>
        {nav.map((entry) => item(entry, entry.to === "/"))}
      </div>
      <div className="space-y-1">
        <p className="px-3 pb-1 text-[10px] font-bold tracking-[0.18em] text-sidebar-foreground/40 uppercase">
          Configure
        </p>
        {secondary.map((entry) => item(entry))}
      </div>
    </nav>
  );
}

function SidebarInner({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <div className="flex h-full flex-col bg-sidebar py-5">
      <Link to="/" onClick={onNavigate} className="mb-6 flex items-center gap-3 px-6">
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-seal text-sm font-bold text-seal-foreground shadow-seal">
          S
        </span>
        <span>
          <span className="block text-display text-lg leading-none text-sidebar-accent-foreground">
            Seal
          </span>
          <span className="block text-[10px] tracking-[0.2em] text-sidebar-foreground/50 uppercase">
            Training ops
          </span>
        </span>
      </Link>
      <NavList onNavigate={onNavigate} />
      <div className="mt-6 px-3">
        <div className="rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/50 p-4">
          <div className="flex items-center gap-2 text-sidebar-accent-foreground">
            <LifeBuoy className="size-4" />
            <p className="text-xs font-semibold">Compliance health</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-sidebar-accent-foreground tabular-nums">82%</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sidebar-border">
            <div className="h-full w-[82%] rounded-full bg-gradient-seal transition-all duration-700" />
          </div>
          <p className="mt-2 text-[11px] text-sidebar-foreground/60">
            6 items need attention this week
          </p>
        </div>
      </div>
    </div>
  );
}

export function CreateMenu({ className }: { className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="seal" className={className}>
          <Plus className="size-4" />
          Create
          <ChevronDown className="size-3.5 opacity-80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-xl p-1.5 shadow-pop">
        <DropdownMenuLabel className="text-[10px] tracking-widest text-muted-foreground uppercase">
          Create new
        </DropdownMenuLabel>
        <DropdownMenuItem asChild className="rounded-lg py-2.5">
          <Link to="/sessions/new">
            <CalendarDays className="size-4 text-seal" />
            <span>
              <span className="block text-sm font-semibold">Create Session</span>
              <span className="block text-xs text-muted-foreground">Schedule training</span>
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-lg py-2.5">
          <Link to="/certificates/new">
            <ShieldCheck className="size-4 text-seal" />
            <span>
              <span className="block text-sm font-semibold">Create Certificate</span>
              <span className="block text-xs text-muted-foreground">Issue a credential</span>
            </span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-md items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm text-muted-foreground shadow-card transition-colors hover:border-seal/40"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search sessions, people, certificates…</span>
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] sm:block">
          ⌘K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search Seal…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Go to">
            {nav.map((n) => (
              <CommandItem key={n.to} onSelect={() => setOpen(false)} asChild>
                <Link to={n.to}>
                  <n.icon className="size-4" /> {n.label}
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => setOpen(false)} asChild>
              <Link to="/sessions/new">
                <Plus className="size-4" /> Create Session
              </Link>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)} asChild>
              <Link to="/certificates/new">
                <Plus className="size-4" /> Create Certificate
              </Link>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-sidebar-border/60 lg:block">
        <SidebarInner />
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] border-sidebar-border p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarInner onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="hidden flex-1 sm:block">
              <GlobalSearch />
            </div>
            <div className="flex-1 sm:hidden" />

            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Bell className="size-4" />
                    <span className="absolute top-1.5 right-1.5 size-2 animate-[sheen_2.4s_ease-in-out_infinite] rounded-full bg-seal" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 rounded-2xl p-0 shadow-pop">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold">Notifications</p>
                    <Button variant="link" size="sm" className="h-auto p-0">
                      Mark all read
                    </Button>
                  </div>
                  <div className="max-h-80 divide-y divide-border overflow-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.title}
                        className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
                      >
                        <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", `bg-${n.tone}`)} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{n.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{n.detail}</p>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{n.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border p-2">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to="/tracking">View tracking workspace</Link>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <CreateMenu />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl border border-border bg-surface py-1 pr-2 pl-1 shadow-card transition-colors hover:border-seal/40">
                    <Avatar initials="PN" className="size-7 rounded-lg" />
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-pop">
                  <div className="px-2 py-2">
                    <p className="text-sm font-semibold">Priya Nandan</p>
                    <p className="text-xs text-muted-foreground">Operations Manager</p>
                    <StatusChip tone="seal" size="sm" className="mt-2">
                      Admin workspace
                    </StatusChip>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/people/$personId" params={{ personId: "per-6" }}>
                      My profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Workspace settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings/automations">Automations</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
