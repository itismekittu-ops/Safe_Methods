# AI Observability, Monitoring, Guardrails & Evaluations

---

## 1. Guardrails

The active security layer intercepting prompts pre-LLM and blocking/rewriting unsafe outputs post-LLM before the user ever sees them[cite: 4].

> **Governing Principle:** No user input reaches the LLM, and no LLM output reaches the user, without passing both an input and an output guardrail check[cite: 4].

### Sensitive PII (Canonical Definition)
`GR-IN-04` through `GR-IN-06` and `GR-OUT-03` detect the following categories[cite: 4]:
* **Government-Issued IDs:** Social Security Numbers (SSN), Social Insurance Numbers (SIN), driver's license numbers, passport numbers[cite: 4].
* **Payment & Account Data:** Credit/debit card numbers, bank routing/account numbers, investment portfolio details[cite: 4].
* **Authentication Data:** PINs, passwords, security question answers[cite: 4].
* **Biometric Data:** Fingerprints, retina scans, facial geometry used for banking authentication[cite: 4].

> **Mandate:** None of the above may be saved in application data or shared with any partner or third party, under any circumstance[cite: 4].

---

### Input Guardrails (Pre-LLM)

| ID | Requirement | Notes / Details |
| :--- | :--- | :--- |
| **GR-IN-01** | **Reject empty messages** | Returns a clear, user-facing message before any LLM call[cite: 4]. |
| **GR-IN-02** | **Token-based length limit** | Rejects messages exceeding defined limits measured in tokens to protect the context window[cite: 4]. |
| **GR-IN-03** | **Detect jailbreak / injections** | Detects role-play overrides, "ignore previous instructions", system prompt reveal requests, and developer-mode framing[cite: 4]. |
| **GR-IN-04** | **Detect Sensitive PII** | Intercepts SIN/SSN-shaped digit sequences[cite: 4]. |
| **GR-IN-05** | **Multi-turn PII detection** | Detects sensitive PII spread across multiple turns in one conversation[cite: 4]. |
| **GR-IN-06** | **Non-standard PII detection** | Detects spaced-out digits, alternate separators, and spelled-out numbers[cite: 4]. |
| **GR-IN-07** | **Recoverable error paths** | Every blocked input offers a rephrase path or a route to a human—never a dead end or bare error[cite: 4]. |

---

### Output Guardrails (Post-LLM, Pre-User)

| ID | Requirement | Notes / Details |
| :--- | :--- | :--- |
| **GR-OUT-01** | **Empty response fallback** | Catches empty LLM responses and substitutes a defined fallback message[cite: 4]. |
| **GR-OUT-02** | **Length limit check** | Catches responses exceeding a defined token length limit[cite: 4]. |
| **GR-OUT-03** | **PII leak prevention** | Catches sensitive PII-shaped content appearing in LLM output (hallucinated or echoed)[cite: 4]. |
| **GR-OUT-04** | **System disclosure defense** | Prevents revealing system prompts, guardrail logic, or retrieval mechanisms under adversarial pressure[cite: 4]. |
| **GR-OUT-05** | **context-stuffing version** | **Highest Stakes:** Any specific rate, percentage, or figure in the response must match a value present in the injected rates table for that request. A number not present in the injected data is flagged/blocked. General conceptual answers require no such match. |

---

### Failure-Mode & Consent Enforcement

| ID | Category | Requirement |
| :--- | :--- | :--- |
| **GR-FAIL-01** | **System Failure** | If a guardrail call fails (timeout/error), the system **fails closed**—the message is not passed to the LLM[cite: 4]. |
| **GR-FAIL-02** | **Failure Granularity** | Non-safety checks (e.g., tone) may fail open; PII and jailbreak checks **never** fail open[cite: 4]. |
| **GR-FAIL-03** | **Bypass Isolation** | Internal testing bypasses must be config-gated and logged—never reachable via user messages[cite: 4]. |
| **GR-CONSENT-01** | **Consent Gate** | Quote submissions missing explicit, checked consent are **never** sent to CRM or external FIs[cite: 4]. |

---

## 2. Retrieval & Ranking Integrity

| ID | Requirement |
| :--- | :--- |
| **RANK-01** | Bank rankings generate strictly from objective, defined criteria (posted rates, feature specs)—never from placement fees[cite: 4]. |
| **RANK-02** | Ranking is computed deterministically by sorting the rates table — never by LLM judgment, never vector retrieval. |
| **RANK-03** | Query contextualization rewrites short follow-up questions into standalone queries *before* retrieval[cite: 4]. |

---

## 3. Evaluations

The offline/asynchronous quality layer assessing correctness, accuracy, and safety without blocking user-facing responses[cite: 4]. Configured directly inside Langfuse[cite: 4].

### Evaluation Dimensions (Scored Separately)

| ID | Dimension | What It Catches |
| :--- | :--- | :--- |
| **EVAL-DIM-01** | **Groundedness** | Confidently wrong factual claims not traceable to retrieved chunks[cite: 4]. |
| **EVAL-DIM-02** | **Safety / Guardrail-Hold** | Jailbreak/PII catches missed, or legitimate messages over-blocked[cite: 4]. |
| **EVAL-DIM-03** | **Relevance** | Retrieval returning adjacent-but-wrong context[cite: 4]. |
| **EVAL-DIM-04** | **Completeness** | Multi-part questions answered only partially[cite: 4]. |
| **EVAL-DIM-05** | **Tone / Brand Fit** | Clinical or robotic responses on financial-stress topics[cite: 4]. |
| **EVAL-DIM-06** | **Advice-Boundary Compliance** | Responses reading as personalized advice instead of general information[cite: 4]. |

### Golden Dataset Requirements
* **EVAL-GOLD-01:** Maintain 15–30 hand-labeled golden cases in Langfuse covering clear-pass and clear-fail examples across all six dimensions[cite: 4].

---

## 4. Observability

Full diagnostic traces and logs of the entire agent workflow (inputs, reasoning steps, tool calls, and outputs)[cite: 4].

### Architecture & Trace Structure

* **OBS-ARCH-01:** Logging uses **Basic Auth REST API** to Langfuse (OTLP does not run in the Deno Edge Function runtime)[cite: 4].
* **OBS-ARCH-02:** Langfuse failures must **never** break the chat experience—observability degrading is acceptable, breaking the product is not[cite: 4].
* **OBS-TRACE-01:** One trace per conversation turn, linked to a persistent session ID[cite: 4].
* **OBS-TRACE-02:** Distinct spans per stage (`input_guardrail`, `retrieval`, `generation`, `output_guardrail`, `eval`)[cite: 4].
* **OBS-TRACE-03:** Retrieved RAG chunks attached to the trace for post-hoc groundedness auditing[cite: 4].
* **OBS-TRACE-04:** Model name, model version, and prompt version attached to every trace[cite: 4].
* **OBS-TRACE-05:** Captured latency tracked per individual stage[cite: 4].

---

### Sensitive PII Handling (Critical Requirement)

* **OBS-PII-01:** Raw Sensitive PII is **never** written into a trace—even when caught and blocked[cite: 4].
* **OBS-PII-02:** Redaction occurs inside the Edge Function **before** data is dispatched to Langfuse[cite: 4].
* **OBS-PII-03:** Typed markers (e.g., `[PII_DETECTED: 1]`) are logged in place of raw PII to track rates safely[cite: 4].

---

### Tagging & Alerting

* **OBS-TAG-01:** Every trace is filterable and tagged by guardrail trigger type, RAG topic area, and evaluation scores[cite: 4].
* **OBS-TAG-02:** Threshold alerts configured for safety score drops, guardrail block spikes, or unexplained drops[cite: 4].
* **OBS-TAG-03:** Drops in guardrail triggers during scheduled adversarial tests are flagged as alertable regressions[cite: 4].

---

## 5. System Performance Benchmarks

| Metric Target | Grounded Value |
| :--- | :--- |
| **End-to-End Chat Response** | `< 4 seconds` (Retrieval + Generation)[cite: 4] |
| **Guardrail Overhead** | `< 150 ms`[cite: 4] |
| **Page Load Time** | `< 2 seconds`[cite: 4] |
| **Memory Leaks** | `Zero Tolerance`[cite: 4] |