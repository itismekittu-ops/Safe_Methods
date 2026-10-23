import mixpanel from "mixpanel-browser";

const CONSENT_KEY = "safemethods_cookie_consent";

const MIXPANEL_TOKEN =
  "5b490303fe451a3033d443c44011ebfa" ||
  import.meta.env.VITE_MIXPANEL_TOKEN;

const SENSITIVE_FIELDS = ["password", "sin", "ssn", "account_number"];

let initialized = false;

function hasConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "all";
  } catch {
    return false;
  }
}

function sanitize(properties: Record<string, unknown>): Record<string, unknown> {
  const cleaned = { ...properties };
  for (const field of SENSITIVE_FIELDS) {
    delete cleaned[field];
  }
  return cleaned;
}

export function initMixpanel(): void {
  if (initialized || typeof window === "undefined" || !MIXPANEL_TOKEN) return;

  mixpanel.init(MIXPANEL_TOKEN, {
    opt_out_tracking_by_default: true,
    track_pageview: false,
    persistence: "localStorage",
  });

  const consent = hasConsent();
  if (consent) {
    mixpanel.opt_in_tracking();
  } else {
    mixpanel.opt_out_tracking();
  }

  initialized = true;
}

export function updateMixpanelConsent(granted: boolean): void {
  if (!initialized) return;
  if (granted) {
    mixpanel.opt_in_tracking();
  } else {
    mixpanel.opt_out_tracking();
  }
}

export function trackMixpanelPageView(path: string): void {
  if (!initialized) return;
  mixpanel.track("Page View", { page_path: path });
}

export function trackMixpanelEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (!initialized) return;
  if (properties) {
    mixpanel.track(eventName, sanitize(properties));
  } else {
    mixpanel.track(eventName);
  }
}

export function identifyMixpanelUser(
  userId: string,
  traits?: Record<string, unknown>
): void {
  if (!initialized) return;
  mixpanel.identify(userId);
  if (traits) {
    mixpanel.people.set(sanitize(traits));
  }
}

export function resetMixpanel(): void {
  if (!initialized) return;
  mixpanel.reset();
}
