interface Attribution {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  initial_referrer: string;
}

const STORAGE_KEY = "safemethods_attribution";

const UTM_KEYS: (keyof Attribution)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

function captureAttribution(): Attribution {
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const utm_source = params.get("utm_source") ?? "";
  const utm_medium = params.get("utm_medium") ?? "";
  const utm_campaign = params.get("utm_campaign") ?? "";
  const utm_content = params.get("utm_content") ?? "";
  const utm_term = params.get("utm_term") ?? "";
  const initial_referrer =
    typeof document !== "undefined" && document.referrer
      ? document.referrer
      : "Direct";

  return {
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    initial_referrer,
  };
}

(function storeAttribution() {
  if (typeof window === "undefined") return;
  const captured = captureAttribution();
  const hasUtm = UTM_KEYS.some((k) => captured[k]);

  let existing: Attribution | null = null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) existing = JSON.parse(raw) as Attribution;
  } catch {
    existing = null;
  }

  const merged: Attribution = {
    utm_source: hasUtm ? captured.utm_source : (existing?.utm_source ?? ""),
    utm_medium: hasUtm ? captured.utm_medium : (existing?.utm_medium ?? ""),
    utm_campaign: hasUtm
      ? captured.utm_campaign
      : (existing?.utm_campaign ?? ""),
    utm_content: hasUtm ? captured.utm_content : (existing?.utm_content ?? ""),
    utm_term: hasUtm ? captured.utm_term : (existing?.utm_term ?? ""),
    initial_referrer: existing?.initial_referrer || captured.initial_referrer,
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // sessionStorage may be unavailable (private mode) — attribution
    // is best-effort and must not break the page.
  }
})();

export function getStoredAttribution(): Attribution {
  try {
    const raw =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem(STORAGE_KEY)
        : null;
    if (raw) return JSON.parse(raw) as Attribution;
  } catch {
    // fall through
  }
  return {
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
    initial_referrer: "Direct",
  };
}
