# Business Rules Document

---

## 1. Customer Rules

| ID | Business Rule | Reference |
| :--- | :--- | :--- |
| **BR-CUST-01** | **Data Ownership:** A customer's data belongs exclusively to the customer. They retain the right to view, export, or delete their personal data at any time. | Charter Principle #2, PRD F5[cite: 5] |
| **BR-CUST-02** | **Contact Validation:** A customer's contact details (`Name`, `Email`, `Phone`) must pass pre-submission validation before being accepted or dispatched to CRM pipelines. | PRD F3-US6[cite: 5] |
| **BR-CUST-03** | **Deduplication:** A customer may submit only one quote request per active session. Duplicate submissions are explicitly blocked rather than silently re-sent. | PRD F3-US11[cite: 5] |

---

## 2. Privacy & Data Protection Rules

| ID | Business Rule |
| :--- | :--- |
| **BR-PRIV-01** | **Sensitive PII Ban:** Sensitive PII must **NEVER** be persisted in application databases, written to observability logs, or shared with external partners or third-party institutions under any circumstance. |
| **BR-PRIV-02** | **Privacy Policy Reachability:** A direct, working link to `/privacy` must be visible across all global navigation footers and modal consent notices prior to data capture. The policy must clearly define the user's right to access, export, and delete records per BR-CUST-01. |

### Restricted Categories (Canonical PII Definition)
Under **BR-PRIV-01**, the following sensitive data categories are strictly forbidden from storage or external transmission[cite: 5]:

* **Government-Issued IDs:** Social Security Numbers (SSN), Social Insurance Numbers (SIN), driver's license numbers, and passport numbers[cite: 5].
* **Payment & Account Data:** Credit/debit card numbers, bank routing/account numbers, and investment portfolio details[cite: 5].
* **Authentication Data:** PINs, passwords, and security question answers[cite: 5].
* **Biometric Data:** Fingerprints, retina scans, and facial geometry used for banking authentication[cite: 5].

---

## 3. Consultant Lead Routing & SLA Rules

| ID | Business Rule | Reference |
| :--- | :--- | :--- |
| **BR-ROUT-01** | **Anonymized Consultant Outreach:** Consultant dispatch notifications and portal views must never disclose customer contact details (`Name`, `Email`, `Phone`). Only financial parameters (`loan_amount`, `monthly_income`, `investment_amount`, `tenure`) and the anonymous internal reference token may be shared. | BR-PRIV-01, PRD F3-US13 |
| **BR-ROUT-02** | **Administrative Quality Gate:** No consultant quote may be delivered directly to a customer without prior administrative approval (`status = 'approved'`). Raw consultant submissions must hold in `pending_admin_review`. | PRD F3-US14 |
| **BR-ROUT-03** | **Consolidated Offer Sheet Delivery:** Customers must not receive piecemeal emails per consultant. Approved bids are aggregated into a single side-by-side comparison offer sheet delivered in one email either upon 3 approvals or at the 5-day deadline. | PRD F3-US7, F3-US15 |
| **BR-ROUT-04** | **Strict 5-Day SLA Expiration:** Any consultant bid remaining in `pending_consultant_submission` upon `quote_requests.sla_deadline <= now()` is automatically transitioned to `expired`. The system triggers delivery of whatever bids have been approved up to that point. | PRD F3-US15 |
| **BR-ROUT-05** | **Zero Customer ID Exposure:** Reference IDs must remain strictly internal system identifiers. They must never be displayed in user-facing confirmation modals or customer emails. | PRD F3-US7, F3-US9 |
| **BR-ROUT-06** | **Direct Consultation Ingestion:** Users booking consultations via Calendly must be immediately synchronized to HubSpot CRM as leads with `source = 'Calendly Direct Booking'` regardless of previous site activity. | PRD F3-US16 |
