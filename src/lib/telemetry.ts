import { apiClient } from "@/lib/api";

const SESSION_KEY = "commonones_session_id";

function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getTelemetrySessionId() {
  try {
    const saved = window.localStorage.getItem(SESSION_KEY);
    if (saved) {
      return saved;
    }
    const sid = generateSessionId();
    window.localStorage.setItem(SESSION_KEY, sid);
    return sid;
  } catch {
    return generateSessionId();
  }
}

export async function trackEventSafe(input: {
  eventName: string;
  userId?: string | null;
  payload?: Record<string, string | number | boolean>;
}) {
  try {
    await apiClient.trackEvent({
      eventName: input.eventName,
      userId: input.userId || null,
      sessionId: getTelemetrySessionId(),
      pagePath: window.location.pathname + window.location.search,
      referrer: document.referrer || "",
      source: "web",
      payload: input.payload || {},
    });
  } catch {
    // 埋点失败不影响主流程
  }
}
