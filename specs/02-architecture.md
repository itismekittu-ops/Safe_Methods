# Architecture Design Document (ADD)

---

## 1. Engineering Principles / Architecture rules

The system architecture shall strictly adhere to the following principles:

* **Guardrail-First Architecture:** Every user request must be validated by input guardrails before interacting with the LLM.
* **Single Source of Truth:** Centralized definitions for business logic, guardrails, prompts, and system configurations.
* **Stateless Application Architecture (Twelve-Factor VI — Processes):** The backend server does not retain client session state between requests. Each request is processed independently with all necessary context (e.g., auth tokens, parameters) provided by the client.
* **Layer Separation:** Strict separation of Frontend, Backend, AI Pipeline, and Data layers.
* **Backend-Centric Logic:** Business logic resides strictly on the backend. The frontend is solely responsible for presentation.
* **Security by Design:** Default security controls, access policies, and data protection built in from the ground up.
* **Environment-Based Configuration (Twelve-Factor III — Config):** System configurations and secrets managed exclusively through environment variables.
* **Dev/Prod Parity (Twelve-Factor X):** Development, staging, and production differ only in configuration values — never in logic branches. No environment-conditional code paths that skip guardrails, use mock data instead of real validation, or alter security behavior.
* **Built-in AI Observability:** Observability, tracing, and logging built into every AI request turn.
* **Context-Injected Grounding:** Numeric/factual data (rates, terms) is injected directly into the model's context per request from the rates table — not retrieved via vector search or RAG. General conceptual responses draw on the model's own knowledge.
* **Architectural Documentation:** Every major decision must be explicitly documented.

---

## 2. Technical Architecture

### System Components & Tech Stack

| Layer | Technologies | Responsibilities |
| :--- | :--- | :--- |
| **Frontend** | Vite, React, TypeScript, Tailwind CSS | UI presentation, layout, user interaction, client-side UI states. |
| **Backend** | Supabase Edge Functions | Business logic, secure endpoint execution, guardrail processing, third-party API integration. |
| **Database** | Supabase PostgreSQL | Relational data persistence, Row Level Security (RLS), vector embeddings. |
| **Observability** | Langfuse | Request tracing, prompt tracing, model tracing, latency tracking, evaluation logging. |
| **Integrations** | Calendly, HubSpot | Booking management and CRM lead processing. |

---

### Data Models & Schemas

* **`leads`**: `(id, name, email, phone, source, created_at)`
* **`consultants`**: `(id, name, title, avatar_url, specialties[])`
* **`banks`**: `(id, name, logo_url, specialties[])`
* **`chat_sessions`**: `(id, user_id [nullable], created_at)`
* **`chat_messages`**: `(id, session_id, role, content, created_at)`
* **`rates`**: `(id, institution, product_type, term, rate_percent, updated_at)`
* **`quote_requests`**: `(id, name, email, phone, request_type [loan/investment], loan_amount, monthly_income, investment_amount, tenure, selected_institutions[], consent_given, consent_timestamp, created_at, status)`

---

### Security Boundaries & Anti-Patterns (Forbidden)

> **Strict Non-Negotiables:**
> * **NO** hardcoded secrets or keys anywhere in the codebase.
> * **NO** Supabase Service Role Key exposure in client-side code.
> * **NO** trusting client-side-only validation for guardrails or safety filters.

---

### Performance Benchmarks & Targets

| Metric Target | Target Threshold | Notes / Constraints |
| :--- | :--- | :--- |
| **Chat Response End-to-End** | `< 4 seconds` | Total duration including retrieval and generation. |
| **Guardrail Check Overhead** | `< 150 ms` | Maximum latency allowed for input/output checks. |
| **Page Load Time** | `< 2 seconds` | Initial frontend loading threshold. |
| **Edge Function Memory Leaks** | `Zero tolerance` | Strict memory management in serverless functions. |
| **$N+1$ Retrieval Queries** | `Forbidden` | Batch or optimize vector and database lookups. |

---

## 3. Data Architecture & Governance

### Data Governance Standards
* **Row Level Security (RLS):** Enforced across all database tables to isolate tenant and user data.
* **Controlled Access:** Backend access restricted via edge functions and authenticated sessions.
* **Secret Management:** Strict isolation of production vs. development secrets using environment variables.
* **Explicit Consent Enforcement:** Explicit consent must be captured and recorded (`quote_requests.consent_given` & `consent_timestamp`) prior to transmitting data to external financial institutions.

---

## 4. Privacy, Security & Compliance

* **Sensitive PII Protection:** Personally Identifiable Information (PII) and Sensitive Personal Information must be strictly protected across all workflows.
* **Redaction for Observability:** Sensitive PII must be redacted/masked (e.g., `[PII_DETECTED]`) prior to sending traces to Langfuse.
* **Minimal Exposure:** Sensitive PII user information must never be exposed to third-party AI LLM providers unless required for query execution.

---

## 5. Visual Theme & UI Conventions

* **Core Design Philosophy:** Grounded, private-wealth aesthetic designed as a departure from generic SaaS/fintech templates.
* **Color Palette:** Primary Ivory, Emerald Green, and Gold accents.
* **Typography:** 
  * Headings: `Playfair Display`
  * Body & UI elements: `Inter`
* **Borders & Radius Rules:** Restrained `2px` to `8px` corner radii across components, with intentional exceptions for pill-shaped chat inputs and category cards. Thin gold hairline dividers used instead of heavy drop shadows.