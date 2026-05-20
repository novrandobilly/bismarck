import { useQuery } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";
import type { Session } from "@/types/session";

export function usePublicSessions() {
  return useQuery({
    queryKey: ["public-sessions"],
    queryFn: () =>
      pb
        .collection("preorder_sessions")
        .getFullList<Session>({ sort: "-fulfillment_date" }),
    retry: false,
  });
}

export function getOpenSession(sessions: Session[]): Session | undefined {
  return sessions.find(
    (s) => s.status === "open" && new Date() <= new Date(s.order_deadline),
  );
}

export function getClosedSessions(sessions: Session[]): Session[] {
  return sessions.filter(
    (s) => s.status === "closed" || new Date() > new Date(s.order_deadline),
  );
}
