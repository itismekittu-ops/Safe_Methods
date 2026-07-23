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
