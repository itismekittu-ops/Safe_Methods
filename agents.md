## Core Principles & Non-Negotiables

> **Constitution Rule:** These core principles dictate platform behavior and architectural decisions. They are immutable and shall **NEVER** change.

### Primary Directives ("North Star")
* **Customer First:** Optimize every feature, workflow, and algorithm to win and preserve **Customer Trust**.
* **Data Ownership:** Customer data belongs exclusively to the customer.
* **Strict Consent:** Explicit customer consent is strictly required before sharing any data.

### Data Integrity & AI Guardrails
* **Fair Competition:** Compare products objectively using verifiable, real data.
* **Zero Fabrication:** Never fabricate financial regulations, interest rates, or product data under any circumstances.
* **Explainable AI:** Explicitly separate educational content from financial recommendations. Show assumptions and explain trade-offs clearly.
* **Unbiased Rankings:** Never manipulate product rankings or accept pay-for-play prioritization.

### Human Oversight & Transparency
* **Human-in-the-Loop:** Recommend human consultation across all customer interactions and final advice outcomes.
* **Encourage Second Opinions:** Actively prompt users to engage with human consultants (displayed in the right sidebar) to receive free expert advice from diverse financial institutions.
* **Transparent Criteria:** Rank products using clear, transparent criteria (primarily posted interest rates, followed by specific secondary features).

### Compliance & Ethics
* **Regulatory Compliance:** Always disclose platform limitations and avoid conflicts of interest.
* **Legal Accuracy:** Never simulate or fabricate financial regulatory advice.

# 🗺️ Specification Directory & System Map

> **Operational Directive:** You are acting as a Senior Lead Engineer building this application via Spec-Driven Development (SDD) in Bolt.  
> **Platform Engine:** Bolt.new | **Single Source of Truth (SSOT):** `/specs/`
>  Read this `agents.md` file to understand the project map before generating code.
---

## 📚 1. Document Index Map / Spec Directory

| Document Name | File Path | Scope & System Responsibilities | Primary AI Consultation Trigger |
| :--- | :--- | :--- | :--- |
| **00. Constitution** | `.specs/00-constitution.md` | Core principles, data ownership directives, | Mission | Vision | Prior to making high-level tech stack or architectural decisions. |
| **01. PRD** | `.specs/01-prd.md` | User stories (F1–F5), UI requirements, acceptance criteria, integration workflows. | Before implementing UI flows, features, or frontend user interactions. |
| **02. Architecture (ADD)** | `.specs/02-architecture.md` | Engineering Principles, Architecture rules | Tech Stack & Infrastrucre Specifications | System components, database models, performance targets, technical constraints. | Before creating DB tables, writing Edge Functions, or building APIs. |
| **03. Business Rules** | `.specs/03-business-rules.md` | Customer ownership rules (BR-CUST) and canonical Sensitive PII definitions (BR-PRIV). | When setting up form validation, data persistence, or user rights endpoints. |
| **04. AI Observability & Security** | `.specs/04-AI-Observability-Security.md` | Pre/Post Guardrails (GR-IN, GR-OUT), Langfuse REST tracing, sensitive PII redaction, 6D Evals. | When building AI chat pipelines, error handlers, or telemetry handlers. |



---

## 🤖 6. How Bolt Should Execute Tasks

When initiating a new feature or file modification in Bolt:

1. **Execute Incrementally:** Implement step-by-step without creating unrequested code or inventing logic outside the specification files.
2. **Locate the Feature:** Find the feature module in Section 2 above.
3. **Consult Associated Files:** Open and read the relevant `.md` spec files listed in Section 1.
4. **Verify Constraints:** Ensure implementation complies with security rules (`03-business-rules.md`) and guardrail specs (`04-AI-Observability-Security.md`).
