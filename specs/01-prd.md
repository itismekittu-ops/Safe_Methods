# Product Requirement Document (PRD)

---

## FEATURE 1: (F1) Financial Advice Chat Widget 

### Description & Purpose
An inline, non-popup AI chat widget embedded in the homepage hero. It answers financial questions from a defined knowledge base and LLM if the answer is not available in RAG knowledge base. Chat widget guides visitors toward either follow-up prompts or continue the conversation manually or requesting quotes from recommended financial institutions (from Financial Institutions displayed & ranked in right side bar "top Matches" section).

### Objectives
* **Primary Objective 1:** Provide visitors with unbiased, free, and fair financial advice, in the main chat widget. Additionally ranking financial institutions that meets customer needs in the right side bar (Top Matches section). 
* **Primary Objective 2:** Display a right sidebar option to contact and receive competitive quotes/bids from multiple financial institutions, saving user time and enabling side-by-side comparison.
* **Secondary Objective:** If a user chooses not to engage with financial institutions immediately, provide sound online advice and encourage them to connect for quotes in the future.

---

### User Stories under Feature 1

#### (F1-US1) Ask a Question and Get an Answer
* **As a** visitor,
* **WHEN I** ask a financial question or express a need in plain language,
* **I want to** receive a concise response (maximum 2–3 lines) accompanied by a list of satisfying products/services,
* **AND** see up to 3 relevant follow-up prompts at the bottom of the screen,
* **AND** see a list of relevant banks and consultants in the right sidebar,
* **So that** I can quickly become informed and make a confident decision.
* **Dependencies:** EVALS

#### (F1-US2) See Best-Matched Financial Products & Banks
* **As a** visitor,
* **WHEN I** ask a financial question,
* **I want to** see which financial products/banks best meet my needs in the right sidebar (ordered from top match to least match),
* **AND IF** needed, select specific banks or advisors to request quotes or advice from,
* **So that** I can visually compare options and understand the competitive landscape.
* **Dependencies:** F1-US1

#### (F1-US3) Rationale on How Financial Products Are Ranked
* **As a** visitor,
* **WHEN I** submit a query or seek product information,
* **I want to** view (upon request) the specific criteria used to rank the banks (e.g., posted interest rates and other stated factors),
* **AND** see a 1–2 line trade-off explanation in the chat window between top options (if supported by RAG/knowledge base data),
  * *Example 1 (Personal Loan):* Display the bank with the lowest posted interest rate at the top.
  * *Example 2 (GIC/Fixed Deposit):* Display the bank providing the highest return at the top.
* **So that** I can trust the ranking is powered by objective, real-world data rather than an arbitrary process.
* **Dependencies:** F1-US2

#### (F1-US4) Trust That Rankings Are Never Paid For
* **As** Safe Methods,
* **WHEN** any bank or institution is displayed in the Top Matches panel,
* **I want** rankings to be generated purely from objective data with no override mechanisms for paying institutions,
* **AND** log every ranking decision for independent auditability,
* **So that** our core promise of fair, unmanipulated competition is enforced programmatically.
* **Dependencies:** F1-US3

#### (F1-US5) See General Education Clearly Separated from Specific Recommendations
* **As a** visitor,
* **WHEN** SafeBot's response mixes educational explanations with specific recommendations,
* **I want** the two visually and textually distinguished (e.g., *"Here's how X works"* separated from *"Based on your situation, here's what's recommended"*),
* **So that** I never confuse general educational concepts with personalized advice.
* **Dependencies:** F4-US8

#### (F1-US6) See Suggested Follow-Up Questions
* **As a** visitor,
* **WHEN I** receive an AI response,
* **I want to** see contextually relevant follow-up questions at the bottom of the chat window,
* **So that** I can continue exploring without needing to type prompts from scratch.
* **Dependencies:** F1-US1

#### (F1-US7) Display List of FIs with Consultant Profiles
* **As a** visitor,
* **WHEN I** receive a response to my financial question,
* **I want** the right sidebar to display:
  1. A sequential list of financial institutions (FIs) and matched consultants relevant to my topic.
  2. Products ordered from most attractive to least.
  3. Consultants clearly paired with their respective institutions.
  4. The mandatory disclaimer: *"Prices are indicative and subject to change. For best results it is recommended to connect directly with the advisor for personalized offer."*
* **So that** I can assess rates, terms, and leading market experts at a glance.
* **Dependencies:** F4-US1 (Guardrails), F4-US3 (Grounding)

#### (F1-US8) Continue a Multi-Turn Conversation
* **As a** visitor,
* **WHEN I** receive an answer or click a suggested prompt,
* **I want to** continue asking follow-up questions in the same window with prior chat context preserved,
* **So that** I can seamlessly build upon an existing conversation or pivot to a new topic without repeating myself.
* **Dependencies:** F1-US1

#### (F1-US9) Conversation Survives Page Refresh Within Session
* **As a** visitor,
* **WHEN I** accidentally refresh or reload the browser tab mid-conversation,
* **I want** my current chat history restored exactly as I left it within that specific browser session,
* **So that** a accidental page refresh doesn't destroy my progress.
* **Dependencies:** F1-US8

#### (F1-US10) Conversation Clears When Tab Is Closed
* **As a** visitor,
* **WHEN I** close the browser tab or window running `safemethods.com`,
* **I want** my session conversation history completely cleared,
* **So that** my data is not accessible to subsequent users on shared or public devices.
* **Dependencies:** F1-US9

#### (F1-US11) Show Relevant Exit-Intent Offer Before Visitor Leaves
* **As** Safe Methods,
* **WHEN** a visitor exhibits exit intent (e.g., moving the cursor toward browser window controls),
* **I want to** trigger a prominent, easily dismissible modal presenting an offer or piece of content relevant to their recent chat topics,
* **So that** we capture a high-intent lead before the user leaves.
* **Dependencies:** F1-US2, F3-US1

#### (F1-US12) Limit Exit-Intent Popup Frequency
* **As** Safe Methods,
* **WHEN** an exit-intent popup is triggered and dismissed by a user who stays on the site,
* **I want** the popup suppressed for the remainder of that session,
* **So that** we avoid frustrating engaged users.
* **Dependencies:** F1-US11

#### (F1-US13) Exit-Intent Fallback for Mobile Visitors
* **As** Safe Methods,
* **WHEN** a visitor browses from a mobile device without cursor-tracking capability,
* **I want** alternative exit-intent triggers (e.g., back-button interaction, scroll velocity, or time-on-page signals),
* **So that** mobile users receive comparable engagement opportunities.
* **Dependencies:** F1-US11

---

## FEATURE 2: (F2) User Authentication

### Description & Purpose
Supports email/password and Google OAuth authentication with session state integrated into the top navbar and automatic local cache purge upon logout. Powered by **Supabase Authentication**.

### Primary User Benefit
Returning users can sign in and resume personalized sessions safely; logging out on shared devices ensures local chat context is wiped.

### Key Capabilities
* User Registration & Password Strength Checks
* Email/Password Login & Google OAuth
* Secure Session Management & Navbar State Integration
* Password Reset Flow
* Automatic Local Cache Purge on Logout

---

### User Stories under Feature F2

#### (F2-US1) Create a Secure Account
* **As a** new visitor,
* **WHEN I** register for an account,
* **I want to** sign up using my name, email, and password,
* **AND** have my password checked against strength rules prior to account creation,
* **So that** my account remains secure against basic compromise attempts.
* **Dependencies:** Supabase Auth

#### (F2-US2) Log In with Email and Password
* **As an** existing user,
* **WHEN I** return to the platform,
* **I want to** log in with my email and password and immediately see my authenticated status reflected in the navigation bar,
* **So that** I can access protected features without re-registering.
* **Dependencies:** F2-US1

#### (F2-US3) Sign In with Google OAuth
* **As a** visitor,
* **WHEN I** choose OAuth authentication,
* **I want to** sign in using my Google account via strictly verified domains,
* **So that** I can authenticate seamlessly without creating new passwords.
* **Dependencies:** Google OAuth, Supabase Auth

#### (F2-US4) Log Out Securely
* **As an** authenticated user,
* **WHEN I** log out,
* **I want** my session terminated immediately and all locally stored chat history purged from the device,
* **So that** my private data is protected on public or shared terminals.
* **Dependencies:** F2-US1, F1-US8

---

## Feature 3: (F3) Get Quotes (Multi-Bank Quote Request)

### Description & Purpose
Allows visitors to submit a single contact form to request official quotes from all recommended financial institutions currently listed in their Top Matches panel.

### Objectives
1. Capture user lead data via a unified form.
2. Persist leads into the central CRM.
3. Transmit authorized lead details strictly to the selected banks/FIs.
4. Display real-time UI confirmation and trigger follow-up transactional emails/SMS containing processing timelines.

---

### Acceptance Criteria

#### Functional Requirements
* Visitors can request quotes from all recommended banks simultaneously in one step.
* **Explicit, unchecked-by-default consent** is required before submission.
* Form dynamic fields toggle based on selected context (**Loan** vs. **Investment**).
* Client and server-side validation must check input fields (`Name`, `Email`, `Phone`) prior to CRM submission.
* Incomplete or invalid submissions must be blocked from reaching the CRM.
* Duplicate submissions within a single session are prevented.
* Confirmation UI popups and transactional confirmation emails trigger immediately upon valid submission.

#### Non-Functional Requirements
* External data sharing is strictly limited to user-consented institutions.
* Rate limiting enforced on quote submission endpoints to prevent spam.
* Secure HTTPS transport and Supabase Row Level Security (RLS) on database tables.

---

### User Stories under Feature (F3)

#### (F3-US1) Trigger "Get Quotes" from Top Matches Panel
* **As a** visitor,
* **WHEN I** am viewing the Top Matches panel,
* **I want** a prominent *"Get Quotes"* button located at the bottom of the panel that opens the multi-bank quote request modal,
* **So that** I can request quotes from all matched banks in a single action.
* **Dependencies:** F1-US2

#### (F3-US2) Fill Out Contact Information
* **As a** visitor,
* **WHEN** the quote form opens,
* **I want** clear fields for my `Name`, `Email`, and `Phone Number` (Optional), with clear required indicators,
* **So that** submitting my details is fast and effortless.
* **Dependencies:** F3-US1

#### (F3-US3) Explicit Consent Requirement
* **As a** visitor,
* **WHEN** completing the quote form,
* **I want** an unchecked-by-default consent checkbox that disables the submit button until explicitly checked,
* **So that** my data is never transmitted without explicit authorization.
* **Dependencies:** F3-US2

#### (F3-US4) Clear Disclosure of Data Recipients
* **As a** visitor,
* **WHEN** reviewing the consent section,
* **I want to** see an explicit list of the exact institutions receiving my information (matching my active Top Matches panel),
* **So that** I know precisely who will receive my details.
* **Dependencies:** F3-US1, F3-US3

#### (F3-US5) Dynamic Form Toggling (Loan vs. Investment)
* **As a** visitor,
* **WHEN** filling out the quote request,
* **I want to** toggle between **Loan** and **Investment** modes to dynamically reveal relevant fields:
  * **Loan:** `Loan Amount`, `Monthly Income`
  * **Investment:** `Investment Amount`, `Term`
* **So that** I only fill out data relevant to my financial request.
* **Dependencies:** F3-US2

#### (F3-US6) Pre-Submission Data Validation
* **As the** system,
* **WHEN** a user clicks submit,
* **I want to** validate field formatting (`Name`, `Email`, `Phone`) before dispatching,
* **AND** display clear inline error messages for invalid fields while blocking CRM transmission,
* **So that** incomplete or junk records never pollute the CRM.
* **Dependencies:** F3-US2, F3-US5

#### (F3-US7) Immediate Confirmation Modal
* **As a** visitor,
* **WHEN I** submit a valid quote form,
* **I want** a confirmation modal stating *"You will receive offers from all selected advisors/banks within 5 business days"* that auto-dismisses after 5 seconds,
* **So that** I get immediate feedback without lingering UI obstructions.
* **Dependencies:** F3-US6

#### (F3-US8) Contextual Blog Recommendations Post-Submission
* **As a** visitor,
* **WHEN I** complete a quote submission,
* **I want** the Top Matches panel to recommend specific articles and case studies matching my chat topic,
* **So that** I can review relevant resources while waiting for quotes.
* **Dependencies:** F3-US6, F1-US7

#### (F3-US9) Transactional Email Confirmation
* **As a** visitor,
* **WHEN my** quote request succeeds,
* **I want to** receive an automated email summarizing my submission, linking relevant educational content, and offering a free 10–15 minute consult link,
* **So that** I have a permanent record in my inbox.
* **Dependencies:** F3-US6

#### (F3-US10) Structured CRM Payload Ingestion
* **As** Safe Methods,
* **WHEN a** valid submission is received,
* **I want** contact details and product specifics (Loan/Investment parameters) ingested into structured CRM fields,
* **So that** sales operations can act on leads without manual cleanup.
* **Dependencies:** F3-US6

#### (F3-US11) Duplicate Submission Prevention
* **As** Safe Methods,
* **WHEN a** user attempts to submit a second quote request within the same session,
* **I want** the system to detect the prior submission and display existing status instead of duplicating CRM records,
* **So that** lead databases remain clean and deduplicated.
* **Dependencies:** F3-US6, F3-US10

#### (F3-US12) Graceful Error Recovery
* **As a** visitor,
* **WHEN a** network or server error disrupts submission,
* **I want** an inline error alert explaining the failure while keeping my typed form fields intact,
* **So that** I can retry submission without retyping data.
* **Dependencies:** F3-US6

---

## FEATURE 4: (F4) Guardrails, LLM Evals & LLM Observability

### Description & Purpose
The foundation layer handling safety, evaluation, and observability across all chat interactions. Input guardrails validate incoming user queries; output guardrails inspect LLM responses. Automated evaluations score responses across multiple quality dimensions, and continuous tracing is logged to Langfuse.

### Core Architecture Principles
* **Single Guardrail Principle:** No unsafe query reaches the LLM; no unsafe, ungrounded, or leaking response reaches the user.
* **Independent LLM Judge:** Automated evaluations must use a judge model from a different model family than the generation model.
* **Redacted Tracing:** PII must be masked before entering observability logs.

---

### User Stories under Feature F4

#### (F4-US1) Input Guardrail Checks
* **As** Safe Methods,
* **WHEN** a user dispatches a message,
* **I want** input guardrails to scan for jailbreaks, PII (e.g., SIN/SSN, credit card numbers), empty content, and excessive payload length prior to LLM processing,
* **So that** malicious or confidential inputs are intercepted immediately.
* **Dependencies:** F1-US1

#### (F4-US2) Friendly Fallbacks for Blocked Inputs
* **As a** visitor,
* **WHEN my** message triggers an input safety filter,
* **I want** the query blocked from reaching the LLM and a friendly error message displayed,
* **So that** I am informed clearly without technical jargon.
* **Dependencies:** F4-US1

#### (F4-US3) Redacted PII Incident Logging in Langfuse
* **As** Safe Methods,
* **WHEN an** input guardrail blocks a query,
* **I want** the incident logged in Langfuse with all PII replaced by masked placeholders (e.g., `[PII_DETECTED: sin_number]`),
* **So that** safety audits can occur without storing raw PII in observability logs.
* **Dependencies:** F4-US1

#### (F4-US4) Validated Query Forwarding & Logging
* **As** Safe Methods,
* **WHEN a** query passes input guardrails,
* **I want** it forwarded to the LLM and concurrently logged in Langfuse for session tracking,
* **So that** we maintain an audit trail of valid system queries.
* **Dependencies:** F4-US1

#### (F4-US5) Output Guardrail Inspection
* **As** Safe Methods,
* **WHEN the** LLM generates a response,
* **I want** output guardrails to scan for PII leaks, system prompt leaks, and excessive length before rendering to the user,
* **So that** unsafe generated content is intercepted.
* **Dependencies:** F4-US4

#### (F4-US6) Safe Fallback for Failed Output Inspection
* **As** Safe Methods,
* **WHEN an** LLM output fails safety inspection,
* **I want to** suppress the output, display a safe generic fallback to the user, and log detailed failure metrics in Langfuse,
* **So that** system leaks are prevented without crashing the user interface.
* **Dependencies:** F4-US5

#### (F4-US7) Output Logging to Langfuse
* **As** Safe Methods,
* **WHEN an** output passes all guardrail checks,
* **I want** the final response rendered to the user and full trace details persisted to Langfuse,
* **So that** production outputs remain transparent and auditable.
* **Dependencies:** F4-US5

#### (F4-US8) Grounding & Knowledge Base Integrity
* **As** Safe Methods,
* **WHEN the** LLM states specific factual values (e.g., rates, eligibility rules, product names),
* **I want** those facts strictly constrained to retrieved knowledge base data, while allowing conceptual explanations to be phrased naturally,
* **So that** the model does not hallucinate financial details.
* **Dependencies:** F4-US4, Knowledge Base

#### (F4-US9) RAG Chunk Logging
* **As** Safe Methods,
* **WHEN generating** a response from retrieved context,
* **I want** the exact vector chunks used logged alongside the generation trace in Langfuse,
* **So that** engineers can audit context retrieval quality.
* **Dependencies:** F4-US8

#### (F4-US10) Universal Turn-Level Protection
* **As** Safe Methods,
* **WHEN a** conversation progresses across multiple turns,
* **I want** every individual turn subject to identical Input $\rightarrow$ LLM $\rightarrow$ Output Guardrail sequences,
* **So that** deep-conversation turns maintain identical security standards.
* **Dependencies:** F4-US1 through F4-US9

#### (F4-US11) Operational System Health Monitoring
* **As** Safe Methods,
* **WHEN the** platform is live,
* **I want** Langfuse to track response latency, token costs, error rates, and guardrail block spikes in real-time,
* **So that** engineering is alerted to system anomalies immediately.
* **Dependencies:** F4-US4, F4-US7

#### (F4-US12) LLM-as-Judge Evaluation Suite
* **As** Safe Methods,
* **WHEN evaluating** performance,
* **I want to** evaluate outputs across 6 distinct dimensions (*Groundedness*, *Safety*, *Relevance*, *Completeness*, *Tone*, *Advice-Boundary*) without blending them into a single composite score,
* **So that** performance regressions are pinpointed accurately.
* **Dependencies:** F4-US1 through F4-US11

#### (F4-US13) Independent Judge Model Requirement
* **As** Safe Methods,
* **WHEN executing** automated LLM-as-Judge evaluations,
* **I want** the judge model to belong to a distinct model family from the generation model,
* **So that** self-favorable scoring bias is eliminated.
* **Dependencies:** F4-US12

#### (F4-US14) Golden Dataset Calibration
* **As** Safe Methods,
* **WHEN re-running** system evaluations against golden test datasets,
* **I want** alerts triggered if judge model evaluation scores drift from human-labeled ground truth,
* **So that** evaluation reliability is maintained.
* **Dependencies:** F4-US12, F4-US13

#### (F4-US15) Fail-Closed Safety Defaults
* **As** Safe Methods,
* **WHEN a** guardrail service times out or errors,
* **I want** the transaction to **fail closed** (block the response) and present a retry message to the user,
* **So that** technical safety glitches never expose unchecked outputs.
* **Dependencies:** F4-US1, F4-US5

#### (F4-US16) Multi-Turn PII Assembly Interception
* **As** Safe Methods,
* **WHEN a** user splits sensitive PII across multiple distinct turns (e.g., ID in Turn 1, Account number in Turn 2),
* **I want** guardrails to evaluate multi-turn window history to intercept composite PII,
* **So that** users cannot bypass filters via fragmented inputs.
* **Dependencies:** F4-US1, F4-US10

#### (F4-US17) Model Upgrade Benchmarking
* **As** Safe Methods,
* **WHEN evaluating** alternative LLM providers or model revisions,
* **I want to** execute automated comparative evaluations on golden datasets in Langfuse prior to production deployment,
* **So that** upgrades are validated empirically.
* **Dependencies:** F4-US12, F4-US14

---

## Feature 5: (F5) Data Subject Rights

### Description & Purpose
Provides users with direct control to view, export, or permanently delete personal data held on the platform, operationalizing the principle that *"customer data belongs to the customer."*

### Acceptance Criteria
* Users can view held personal data following authentication.
* Users can download an export file of their data in a standard readable format.
* Users can submit a permanent deletion request (honored subject to mandatory legal retention requirements).
* Deletion audit logs are recorded without retaining deleted PII.

---

### User Stories

#### (F5-US1) View Personal Data
* **As a** user,
* **I want to** view all personal data retained by Safe Methods,
* **So that** I can verify its accuracy and scope.
* **Dependencies:** F2 (Authentication)

#### (F5-US2) Export Personal Data
* **As a** user,
* **I want to** export my data in a structured, machine-readable format,
* **So that** I maintain an independent copy of my personal information.
* **Dependencies:** F5-US1

#### (F5-US3) Delete Personal Data
* **As a** user,
* **I want to** request the permanent deletion of my personal data,
* **So that** I can exercise control over my personal footprint on the platform.
* **Dependencies:** F5-US1

---

## Third-Party Integrations

### HubSpot CRM Touchpoints
* **Lead Ingestion:** Triggered upon a validated quote request (`F3-US6`, `F3-US3`). Transmits lead data containing **only** the user-selected institutions (`F3-US4`).
* **Institution Tagging:** Leads are tagged with selected institution IDs for downstream routing workflows.
* **Deduplication:** Transmits normalized key pairs (lowercased email, digits-only phone) to allow native contact deduplication.
* **Resiliency:** API failures queue leads asynchronously without blocking user UI feedback (`F3-US7`).

### Mixpanel Analytics Touchpoints
* **Funnel Events:** Tracks interactions: `chat_started`, `category_card_clicked`, `get_quotes_opened`, `consent_given`, `consent_denied`, `quote_submitted`, `account_created`, `logged_in`.
* **Privacy Controls:** Blocked message events fire generic flags containing zero raw text payload or block specifics.