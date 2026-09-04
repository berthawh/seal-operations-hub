import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/team.functions";
import { getWorkspace } from "@/lib/workspace.functions";
import { listNotifications } from "@/lib/notifications.functions";

const clientOnly = typeof window !== "undefined";

/** True once we know the visitor has a Supabase session. Prevents 401s on public screens. */
export function useHasSession() {
  const [hasSession, setHasSession] = useState(false);
  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setHasSession(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return hasSession;
}


/** Signed-in user, roles and profile. Shared by every screen so edits appear everywhere. */
export function useMyAccess() {
  const fn = useServerFn(getMyAccess);
  const hasSession = useHasSession();
  return useQuery({
    queryKey: ["my-access"],
    queryFn: () => fn(),
    enabled: clientOnly && hasSession,
    retry: false,
    staleTime: 30_000,
  });
}

/** The company record shown across settings, certificates and the shell. */
export function useWorkspace() {
  const fn = useServerFn(getWorkspace);
  const hasSession = useHasSession();
  return useQuery({
    queryKey: ["workspace"],
    queryFn: () => fn(),
    enabled: clientOnly && hasSession,
    retry: false,
    staleTime: 30_000,
  });
}

/** The signed-in user's notifications. Polled so new ones arrive without a refresh. */
export function useNotifications() {
  const fn = useServerFn(listNotifications);
  const hasSession = useHasSession();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => fn(),
    enabled: clientOnly && hasSession,
    retry: false,
    refetchInterval: 60_000,
  });
}

/** Refresh everything that is shared globally after a save. */
export function useRefreshGlobal() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["my-access"] });
    void queryClient.invalidateQueries({ queryKey: ["workspace"] });
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    void queryClient.invalidateQueries({ queryKey: ["team"] });
  };
}

export function initialsFrom(name: string | null | undefined, email?: string | null) {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (!parts.length) return "S";
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + second).toUpperCase();
}
