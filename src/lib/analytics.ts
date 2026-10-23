const CONSENT_KEY = "safemethods_cookie_consent";

// Use your verified GA4 Measurement ID directly
export const GA_ID = "G-TKMYQJXL2W";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// 1. Establish dataLayer & gtag immediately in window scope so calls queue safely
if (typeof window !== "undefined") {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }
}

function hasConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "all";
  } catch {
    return false;
  }
}

let isInitialized = false;

export function initGA(): void {
  if (!GA_ID || typeof window === "undefined" || isInitialized) return;

  const consent = hasConsent();
  const consentState = consent ? "granted" : "denied";

  // 2. Set default consent FIRST before any config or tags execute (Google Consent Mode v2)
  window.gtag!("consent", "default", {
    analytics_storage: consentState,
    ad_storage: consentState,
    ad_user_data: consentState,
    ad_personalization: consentState,
  });

  // 3. Initialize config
  window.gtag!("js", new Date());
  window.gtag!("config", GA_ID, {
    send_page_view: false, // Handled manually on route changes
    anonymize_ip: true,
  });

  // 4. Inject Google Tag Manager script
  const existingScript = document.querySelector(
    `script[src*="googletagmanager.com/gtag/js"]`
  );
  if (!existingScript) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
  }

  isInitialized = true;
}

export function updateGAConsent(granted: boolean): void {
  if (typeof window === "undefined" || !window.gtag) return;
  const state = granted ? "granted" : "denied";

  window.gtag("consent", "update", {
    analytics_storage: state,
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
  });

  // If consent was just granted, immediately fire the current page view
  if (granted) {
    trackPageView(window.location.pathname + window.location.search);
  }
}

export const updateConsent = updateGAConsent;

export function trackPageView(path: string): void {
  if (!GA_ID || typeof window === "undefined") return;

  if (window.gtag) {
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params);
}