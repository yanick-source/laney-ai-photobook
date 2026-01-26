// Analytics module that respects cookie preferences
// Events are only tracked when user has consented to analytics cookies

type EventName = 
  | "page_view"
  | "button_click"
  | "form_submit"
  | "photo_upload"
  | "photobook_created"
  | "checkout_started"
  | "order_completed"
  | "template_selected"
  | "ai_creation_started"
  | "ai_creation_completed";

interface AnalyticsEvent {
  name: EventName;
  properties?: Record<string, string | number | boolean>;
  timestamp: string;
  path: string;
  sessionId: string;
}

// Generate or retrieve session ID
function getSessionId(): string {
  const stored = sessionStorage.getItem("analytics_session_id");
  if (stored) return stored;
  
  const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  sessionStorage.setItem("analytics_session_id", newId);
  return newId;
}

// Check if analytics consent is given
function hasAnalyticsConsent(): boolean {
  try {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) return false;
    const parsed = JSON.parse(consent);
    return parsed.analytics === true;
  } catch {
    return false;
  }
}

// Queue for events when consent is pending
let eventQueue: AnalyticsEvent[] = [];

// Track an event
export function trackEvent(
  name: EventName,
  properties?: Record<string, string | number | boolean>
): void {
  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
    sessionId: getSessionId(),
  };

  if (!hasAnalyticsConsent()) {
    // Optionally queue events for when consent is given
    // For now, we simply don't track
    if (import.meta.env.DEV) {
      console.log("[Analytics] Event blocked (no consent):", name);
    }
    return;
  }

  // Send event
  sendEvent(event);
}

// Track page view
export function trackPageView(path?: string): void {
  trackEvent("page_view", {
    page: path || window.location.pathname,
    referrer: document.referrer || "direct",
    title: document.title,
  });
}

// Send event to analytics backend
async function sendEvent(event: AnalyticsEvent): Promise<void> {
  if (import.meta.env.DEV) {
    console.log("[Analytics] Event tracked:", event.name, event.properties);
  }

  // Store in localStorage for now (can be sent to backend later)
  try {
    const stored = localStorage.getItem("analytics_events");
    const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
    events.push(event);
    
    // Keep only last 100 events
    const trimmed = events.slice(-100);
    localStorage.setItem("analytics_events", JSON.stringify(trimmed));
  } catch (error) {
    console.error("[Analytics] Failed to store event:", error);
  }

  // Here you could send to an edge function or external analytics service
  // Example: await supabase.functions.invoke('track-analytics', { body: event });
}

// Get stored analytics events (for debugging or sending to backend)
export function getStoredEvents(): AnalyticsEvent[] {
  try {
    const stored = localStorage.getItem("analytics_events");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Clear stored events
export function clearStoredEvents(): void {
  localStorage.removeItem("analytics_events");
}

// Initialize analytics (call on app mount)
export function initAnalytics(): void {
  if (!hasAnalyticsConsent()) {
    if (import.meta.env.DEV) {
      console.log("[Analytics] Waiting for user consent...");
    }
    return;
  }

  if (import.meta.env.DEV) {
    console.log("[Analytics] Initialized with consent");
  }

  // Track initial page view
  trackPageView();
}
