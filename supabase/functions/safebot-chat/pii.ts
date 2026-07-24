// PII detection, redaction, and multi-turn assembly interception.
// GR-IN-04: per-message sensitive PII (SIN/SSN/card/government ID).
// GR-IN-05: multi-turn PII assembly — detects sensitive PII spread across messages.
// GR-IN-06: non-standard PII (spaced-out digits, alternate separators).
// OBS-PII-01/02/03: redaction before any data leaves for Langfuse.

// ─── Sensitive PII patterns (blocked immediately, per-message) ───

interface PiiMatch {
  label: string;
  value: string;
}

const SENSITIVE_PII_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  // SIN: 9 digits, optionally formatted as XXX-XXX-XXX or XXX XXX XXX
  { pattern: /\b\d{3}[-\s]?\d{3}[-\s]?\d{3}\b/, label: "sin_number" },
  // SSN: XXX-XX-XXXX
  { pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/, label: "ssn" },
  // Credit/debit card: 13-19 digits with optional separators
  { pattern: /\b(?:\d[ -]*?){13,19}\b/, label: "credit_card" },
  // Bare 9-digit government ID
  { pattern: /\b\d{9}\b/, label: "government_id" },
  // Spelled-out digits: "one two three four five six seven eight nine"
  { pattern: /\b(?:zero|one|two|three|four|five|six|seven|eight|nine)(?:\s+(?:zero|one|two|three|four|five|six|seven|eight|nine)){8,}\b/i, label: "spelled_out_id" },
];

// ─── Non-sensitive contact PII fragments (tracked for assembly) ───

interface ContactPiiMatch {
  category: "phone" | "email" | "postal_code" | "person_name" | "street_address";
  value: string;
}

const PHONE_PATTERN = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/;
const EMAIL_PATTERN = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/;
const POSTAL_CODE_PATTERN = /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/i;
const STREET_ADDRESS_PATTERN = /\b\d{1,5}\s+[A-Z][a-zA-Z]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Way|Crescent|Cres)\b/i;

// Lightweight person-name heuristic: "my name is X", "I'm X", "call me X", "this is X"
const NAME_PATTERNS = [
  /(?:my name is|I am|I'm|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/,
];

function detectContactPii(message: string): ContactPiiMatch[] {
  const matches: ContactPiiMatch[] = [];

  const phoneMatch = message.match(PHONE_PATTERN);
  if (phoneMatch) matches.push({ category: "phone", value: phoneMatch[0] });

  const emailMatch = message.match(EMAIL_PATTERN);
  if (emailMatch) matches.push({ category: "email", value: emailMatch[0] });

  const postalMatch = message.match(POSTAL_CODE_PATTERN);
  if (postalMatch) matches.push({ category: "postal_code", value: postalMatch[0] });

  const addressMatch = message.match(STREET_ADDRESS_PATTERN);
  if (addressMatch) matches.push({ category: "street_address", value: addressMatch[0] });

  for (const pattern of NAME_PATTERNS) {
    const nameMatch = message.match(pattern);
    if (nameMatch && nameMatch[1]) {
      matches.push({ category: "person_name", value: nameMatch[1] });
      break;
    }
  }

  return matches;
}

// ─── Per-message sensitive PII check (GR-IN-04) ───

export function detectSensitivePii(message: string): PiiMatch[] {
  const found: PiiMatch[] = [];
  for (const { pattern, label } of SENSITIVE_PII_PATTERNS) {
    const match = message.match(pattern);
    if (match) found.push({ label, value: match[0] });
  }
  return found;
}

// ─── Redaction (OBS-PII-01/02/03) ───

// Replace all sensitive PII with typed markers. Also redacts contact PII
// that appears in the same message to be safe.
export function redactPii(message: string): string {
  let redacted = message;
  let piiCount = 0;

  for (const { pattern, label } of SENSITIVE_PII_PATTERNS) {
    redacted = redacted.replace(pattern, () => {
      piiCount++;
      return `[PII_DETECTED:${label}:${piiCount}]`;
    });
  }

  // Also redact contact PII from traces to be safe
  redacted = redacted.replace(PHONE_PATTERN, "[PII_REDACTED:phone]");
  redacted = redacted.replace(EMAIL_PATTERN, "[PII_REDACTED:email]");
  redacted = redacted.replace(POSTAL_CODE_PATTERN, "[PII_REDACTED:postal_code]");

  return redacted;
}

// ─── Multi-turn PII assembly (GR-IN-05) ───

// Accumulates contact-PII categories across a session. When enough distinct
// categories appear across multiple messages, the combination is flagged as
// PII assembly exposure — even if no single message contained sensitive PII.
//
// Threshold: 2+ distinct contact-PII categories across the session (e.g.,
// name + phone, name + email, phone + email, etc.). This catches the case
// where a user shares their name in one message and their phone in another.

export interface AssemblyResult {
  blocked: boolean;
  reason?: string;
  categories: string[];
}

export function checkMultiTurnAssembly(
  currentMessage: string,
  history: string[]
): AssemblyResult {
  // Collect all contact PII from the current message
  const currentContacts = detectContactPii(currentMessage);
  const currentCategories = new Set(currentContacts.map((c) => c.category));

  // Collect categories from history messages (only user messages — history
  // passed from client alternates user/assistant, but we only care about
  // what the user volunteered)
  const historyCategories = new Set<string>();
  for (const msg of history) {
    const contacts = detectContactPii(msg);
    for (const c of contacts) historyCategories.add(c.category);
  }

  // Merge all categories seen across the session
  const allCategories = new Set([...currentCategories, ...historyCategories]);

  // If 2+ distinct contact-PII categories appear across the session, flag it
  if (allCategories.size >= 2) {
    const catList = Array.from(allCategories).sort();
    return {
      blocked: true,
      reason: `For your security, I've noticed you've shared multiple pieces of personal contact information across our conversation (${catList.join(", ")}). To protect your privacy, please avoid sharing personal details in this chat. If you'd like to receive quotes, please use the "Get Quotes" button to submit your information through our secure form.`,
      categories: catList,
    };
  }

  return {
    blocked: false,
    categories: Array.from(allCategories).sort(),
  };
}
