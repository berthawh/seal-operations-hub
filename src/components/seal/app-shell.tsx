import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Plus,
  Radar,
  Search,
  Settings,
  ShieldCheck,
  Users,
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
import { supabase } from "@/integrations/supabase/client";
import {
  initialsFrom,
  useMyAccess,
  useNotifications,
  useRefreshGlobal,
  useWorkspace,
} from "@/hooks/use-seal-session";
import { markNotificationsRead } from "@/lib/notifications.functions";
import { ROLE_LABELS } from "@/lib/team.functions";

type NavEntry = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const navGroups: { label: string; items: NavEntry[] }[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/", icon: LayoutDashboard }],
  },
  {
    label: "Training",
    items: [
      { label: "Bookings", to: "/bookings", icon: Inbox },
      { label: "Sessions", to: "/sessions", icon: CalendarDays, badge: "6" },
      { label: "Courses", to: "/courses", icon: GraduationCap },
    ],
  },
  {
    label: "Directory",
    items: [
      { label: "People", to: "/people", icon: Users },
      { label: "Organisations", to: "/organisations", icon: Building2 },
    ],
  },
  {
    label: "Compliance",
    items: [
      { label: "Certificates", to: "/certificates", icon: ShieldCheck, badge: "2" },
      { label: "Renewals", to: "/tracking", icon: Radar, badge: "!" },
    ],
  },
];

const secondary: NavEntry[] = [{ label: "Settings", to: "/settings", icon: Settings }];

/** Partner organisations only ever see their own portal. */
const partnerNav = [
  { label: "Portal", to: "/portal", icon: LayoutDashboard },
  { label: "Book a session", to: "/portal/book", icon: CalendarDays },
  { label: "Courses", to: "/courses", icon: GraduationCap },
];

/** True when the signed-in person belongs to a partner organisation only. */
export function useIsPartner() {
  const access = useMyAccess();
  const roles = access.data?.roles ?? [];
  return roles.length > 0 && roles.every((r) => r === "partner");
}


function NavList({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPartner = useIsPartner();
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
          "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary transition-all duration-300",
            isActive ? "opacity-100" : "scale-y-0 opacity-0",
          )}
        />
        <entry.icon className="size-4 shrink-0 opacity-80" />
        <span className="flex-1 truncate">{entry.label}</span>
        {entry.badge ? (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              entry.badge === "!"
                ? "bg-seal text-seal-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {entry.badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <nav className="flex flex-1 flex-col gap-5 px-3">
      {isPartner ? (
        <div className="space-y-1">
          <p className="px-3 pb-1 text-[10px] font-bold tracking-[0.18em] text-sidebar-foreground/40 uppercase">
            Your organisation
          </p>
          {partnerNav.map((entry) => item(entry, entry.to === "/"))}
        </div>
      ) : (
        <>
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-bold tracking-[0.18em] text-sidebar-foreground/40 uppercase">
                {group.label}
              </p>
              {group.items.map((entry) => item(entry, entry.to === "/"))}
            </div>
          ))}
          <div className="space-y-1">
            <p className="px-3 pb-1 text-[10px] font-bold tracking-[0.18em] text-sidebar-foreground/40 uppercase">
              Configure
            </p>
            {secondary.map((entry) => item(entry))}
          </div>
        </>
      )}
    </nav>
  );
}

function SidebarInner({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const workspace = useWorkspace();
  const isPartner = useIsPartner();
  const brand = workspace.data?.companyName ?? "Seal";
  const logo = workspace.data?.logoUrl;
  return (
    <div className="flex h-full flex-col bg-sidebar py-4">
      <Link to="/" onClick={onNavigate} className="mb-5 flex items-center gap-2.5 px-5">
        {logo ? (
          <img src={logo} alt={`${brand} logo`} className="size-8 rounded-lg object-contain" />
        ) : (
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-seal text-[13px] font-semibold text-seal-foreground">
            S
          </span>
        )}
        <span>
          <span className="block max-w-[130px] truncate text-[15px] font-semibold tracking-tight text-sidebar-accent-foreground">
            {brand}
          </span>
          <span className="block text-[10px] tracking-[0.14em] text-sidebar-foreground/50 uppercase">
            Training ops
          </span>
        </span>
      </Link>
      <NavList onNavigate={onNavigate} />
      {isPartner ? null : (
      <div className="mt-6 px-3">
        <div className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/60 px-3 py-3">
          <div className="flex items-center gap-2 text-sidebar-accent-foreground">
            <LifeBuoy className="size-3.5" />
            <p className="text-[11px] font-semibold">Compliance health</p>
          </div>
          <p className="mt-1.5 text-xl font-semibold text-sidebar-accent-foreground tabular-nums">
            82%
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-sidebar-border">
            <div className="h-full w-[82%] rounded-full bg-seal transition-all duration-700" />
          </div>
          <p className="mt-2 text-[11px] text-sidebar-foreground/70">
            6 items need attention this week
          </p>
        </div>
      </div>
      )}
    </div>
  );
}

export function CreateMenu({ className }: { className?: string }) {
  const isPartner = useIsPartner();
  if (isPartner) {
    return (
      <Button variant="seal" className={className} asChild>
        <Link to="/portal/book">
          <Plus className="size-4" /> Book a session
        </Link>
      </Button>
    );
  }
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
        className="bar flex h-8.5 w-full max-w-sm items-center gap-2 px-2.5 text-[13px] text-muted-foreground transition-colors hover:border-foreground/20"
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
  const navigate = useNavigate();
  const access = useMyAccess();
  const notifications = useNotifications();
  const refreshGlobal = useRefreshGlobal();
  const markRead = useServerFn(markNotificationsRead);
  const items = notifications.data ?? [];
  const unread = items.filter((n) => !n.readAt).length;
  const markAll = useMutation({
    mutationFn: () => markRead({ data: {} }),
    onSuccess: refreshGlobal,
  });
  const displayName = access.data?.fullName || access.data?.email || "Signed out";
  const roleLabel = access.data?.roles?.[0] ? ROLE_LABELS[access.data.roles[0]] : null;
  const signOut = async () => {
    await supabase.auth.signOut();
    refreshGlobal();
    void navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-4 left-4 z-40 hidden w-[228px] overflow-hidden rounded-2xl border border-border/70 shadow-card lg:block">
        <SidebarInner />
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6 lg:pr-6 lg:pl-2">
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
                    {unread > 0 ? (
                      <span className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full bg-seal px-1 text-[10px] font-semibold text-seal-foreground">
                        {unread}
                      </span>
                    ) : null}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 rounded-2xl p-0 shadow-pop">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold">Notifications</p>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      disabled={!unread || markAll.isPending}
                      onClick={() => markAll.mutate()}
                    >
                      Mark all read
                    </Button>
                  </div>
                  <div className="max-h-80 divide-y divide-border overflow-auto">
                    {items.length === 0 ? (
                      <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                        {access.data ? "No notifications yet." : "Sign in to see your notifications."}
                      </p>
                    ) : (
                      items.map((n) => (
                        <div
                          key={n.id}
                          className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
                        >
                          <span
                            className={cn(
                              "mt-1.5 size-2 shrink-0 rounded-full",
                              n.readAt ? "bg-border" : "bg-seal",
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{n.title}</p>
                            {n.body ? (
                              <p className="truncate text-xs text-muted-foreground">{n.body}</p>
                            ) : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-border p-2">
                    <Button variant="ghost" size="sm" className="w-full" asChild>
                      <Link to="/settings/notifications">Open notifications</Link>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <CreateMenu />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl border border-border bg-surface py-1 pr-2 pl-1 shadow-card transition-colors hover:border-seal/40">
                    <Avatar
                      initials={initialsFrom(access.data?.fullName, access.data?.email)}
                      className="size-7 rounded-lg"
                    />
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-pop">
                  <div className="px-2 py-2">
                    <p className="truncate text-sm font-semibold">{displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {access.data?.jobTitle || access.data?.email || "Not signed in"}
                    </p>
                    {roleLabel ? (
                      <StatusChip tone="seal" size="sm" className="mt-2">
                        {roleLabel}
                      </StatusChip>
                    ) : null}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings/team">My profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings/company">My company</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Workspace settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {access.data ? (
                    <DropdownMenuItem onSelect={() => void signOut()}>Sign out</DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to="/auth">Sign in</Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1320px] px-4 pt-2 pb-8 sm:px-6 lg:pr-6 lg:pl-2">
          {children}
        </main>
      </div>
    </div>
  );
}
