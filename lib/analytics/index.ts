// Provider-agnostic analytics abstraction.
// Swap the sink later (PostHog, Amplitude, Supabase) without touching callers.

export type AnalyticsEvent =
  | "session_started"
  | "challenge_started"
  | "challenge_completed"
  | "second_challenge_started"
  | "session_completed"
  | "user_returned"
  | "observation_shared"
  | "idea_started"
  | "idea_completed"
  | "idea_developed"
  | "idea_shared"
  | "experiment_started"
  | "landing_demo_started"
  | "landing_demo_completed";

type Props = Record<string, string | number | boolean | undefined>;

interface TrackedEvent {
  event: AnalyticsEvent;
  props?: Props;
  at: string;
}

const STORE_KEY = "yn:analytics";

function sink(e: TrackedEvent) {
  // Dev-friendly sink: console + localStorage ring buffer.
  if (typeof window === "undefined") return;
  try {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", e.event, e.props ?? {});
    const raw = window.localStorage.getItem(STORE_KEY);
    const list: TrackedEvent[] = raw ? JSON.parse(raw) : [];
    list.push(e);
    window.localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(-200)));
  } catch {
    /* analytics must never break the app */
  }
}

export function track(event: AnalyticsEvent, props?: Props) {
  sink({ event, props, at: new Date().toISOString() });
}

export function getTrackedEvents(): TrackedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as TrackedEvent[]) : [];
  } catch {
    return [];
  }
}
