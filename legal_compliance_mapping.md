# Project SANKET: Legal Compliance Mapping Document

*This report is submitted in fulfillment of Deliverable #4, mapping to Section H.5 (Legal Compliance Checklist) of the hackathon problem statement.*

## 1. Executive Summary

Investigative interview tools must navigate a complex web of constitutional protections, evidentiary rules, and data privacy mandates. Project SANKET is engineered with a **compliance-by-design** architecture. 

This document maps every major technical component of the SANKET system directly to the Indian legal authorities that govern its use.

---

## 2. Section-by-Section Legal Mapping

### 2.1 Constitution of India, Article 20(3) (Protection against Self-Incrimination)
**Legal Mandate:** "No person accused of any offence shall be compelled to be a witness against himself."
**Technical Mapping:**
*   **No "Lie Detection" Capabilities:** The system strictly surfaces physiological and positional anomalies (e.g., `gazeProbability`, `pitchProbability`) rather than binary "truthful/deceptive" labels.
*   **Inadmissibility Tagging:** In `backend/core/security.py`, every exported artifact is cryptographically signed with an `ASSISTIVE — NOT EVIDENCE` header. This ensures the output is used solely for the Investigating Officer's situational awareness, legally firewalling it from being introduced as substantive evidence.
*   **No Coercive Alarms:** The UI (`TelemetryCharts.jsx`) operates silently without buzzers or red flashing alerts, ensuring the technology does not create a coercive environment that violates the voluntariness of the subject's statements.

### 2.2 Selvi v. State of Karnataka (2010) 7 SCC 263
**Legal Mandate:** The Supreme Court ruled that involuntary administration of polygraphs, narco-analysis, and BEAP violates Articles 20(3) and 21.
**Technical Mapping:**
*   **Prohibition of Polygraphs/VSA:** SANKET strictly relies on non-invasive visual observation (via standard RGB cameras and MediaPipe posture tracking). We explicitly ban the integration of proprietary Layered Voice Analyzers (LVA) or polygraphs in our audio/video pipelines.
*   **Consent-Absent Fallback Mode:** To respect the voluntariness doctrine, `frontend/src/components/ConsentModal.jsx` intercepts the workflow before the camera activates. If the subject declines consent, the system degrades gracefully into a `fallbackMode` that completely disables all AI inference on the subject, acting only as a secure digital notepad for the officer.

### 2.3 Constitution of India, Article 21 (Right to Privacy) & DPDP Act 2023
**Legal Mandate:** The *Puttaswamy* judgment established privacy as a fundamental right. The DPDP Act 2023 establishes obligations for data fiduciaries regarding purpose limitation, consent, and data erasure.
**Technical Mapping:**
*   **Data Residency (On-Device Processing):** The SANKET prototype is built entirely as a local FastAPI/React stack intended for edge deployment (e.g., NVIDIA Jetson). No subject video or audio is ever transmitted to cloud APIs (AWS/GCP), satisfying strict data residency rules.
*   **Consent Hash Logging:** The initial consent signature is hashed and tied directly to the `session_id` in the database (`backend/api/api_v1/endpoints/compliance.py`), proving explicit consent was obtained prior to data processing.
*   **Cryptographic Erasure (Right to be Forgotten):** The backend features a `/erase_session` endpoint. Triggering this destroys the session's cryptographic key (`session_key = "DESTROYED_CRYPTOGRAPHICALLY"`), rendering the AES-256 encrypted artifact permanently unrecoverable once a case is closed.

### 2.4 Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023
**Legal Mandate:** Procedural requirements for the conduct, recording, and custody of investigative interrogations.
**Technical Mapping:**
*   **Two-Officer Export Rule:** To maintain strict chain-of-custody and prevent unauthorized data exfiltration, the `/export` endpoint mandates that the `requesting_officer_id` and the `authorizing_officer_id` must be distinct.
*   **Vulnerability/Distress Halt:** If a subject exhibits signs of acute distress, the officer must click the "Distress" button (`handleDistress` in `App.jsx`). This immediately halts the inference polling loop and logs the event, adhering to procedural protections for vulnerable subjects.

### 2.5 Bharatiya Sakshya Adhiniyam (BSA) 2023 & IT Act 2000
**Legal Mandate:** Evidentiary rules surrounding electronic records (BSA) and obligations to secure sensitive personal data (IT Act Sec 43A, 72A).
**Technical Mapping:**
*   **Hash-Chained Audit Logging:** In `backend/core/security.py`, the `AuditLogger` class implements a Merkle-style hash chain. Every event (session start, vulnerability trigger, export) is hashed alongside the `previous_hash`. This guarantees 100% tamper-evident logs. Any unauthorized modification to the database will invalidate the cryptographic chain.
*   **Role-Based Access & TLS 1.3:** The architecture specifies that transit between the capture rig and the on-premise server utilizes TLS 1.3 with mutual certificate authentication, fulfilling IT Act data security mandates.
