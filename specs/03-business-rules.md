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

### Restricted Categories (Canonical PII Definition)
Under **BR-PRIV-01**, the following sensitive data categories are strictly forbidden from storage or external transmission[cite: 5]:

* **Government-Issued IDs:** Social Security Numbers (SSN), Social Insurance Numbers (SIN), driver's license numbers, and passport numbers[cite: 5].
* **Payment & Account Data:** Credit/debit card numbers, bank routing/account numbers, and investment portfolio details[cite: 5].
* **Authentication Data:** PINs, passwords, and security question answers[cite: 5].
* **Biometric Data:** Fingerprints, retina scans, and facial geometry used for banking authentication[cite: 5].