# Project SANKET: System Architecture Document

*This report is submitted in fulfillment of Deliverable #5, outlining the architectural design, threat modeling, and model choices for the SANKET prototype.*

## 1. System Overview

Project SANKET is built on a decoupled client-server architecture designed for secure, edge-based deployment in strictly controlled environments (e.g., police interrogation rooms). 

*   **Frontend (Officer Interface):** A React.js web application providing real-time telemetry charting (via Recharts), a live ASR transcript, and the Post-Session Deep Analysis Console.
*   **Backend (Inference & Compliance):** A FastAPI (Python) server handling cryptographic signing, audit logging, and multimodal inference pipelines.
*   **Database:** A local SQLite database (simulating a production PostgreSQL instance) managing case metadata, consent records, and the Merkle-style hash-chained audit log.

## 2. Model Choices & Inference Pipeline

In accordance with Section B and C of the challenge constraints, the system eschews composite "deception scores" in favor of Late Fusion, preserving interpretability.

### 2.1 Computer Vision (Behavioral Cues)
*   **Facial Landmarks & Gaze:** `MediaPipe FaceMesh` and `MediaPipe Iris`. Chosen for high-efficiency edge processing. It calculates the `gaze_horizontal_ratio` deterministically.
*   **Head Pose:** Derived via 6DoF approximations from FaceMesh landmarks to compute `pitchProbability`.
*   **Posture & Proxemics:** `MediaPipe Pose` tracks shoulder Y-coordinates to establish a `shoulder_asymmetry` index. 

### 2.2 Audio & Linguistics (Simulated for Prototype)
*   **ASR & Code-Switching:** Architected to support Bhashini APIs and `IndicConformer` for native handling of Hindi-English code-switching without English-only routing.
*   **Linguistic Consistency:** Architected to utilize sentence-embedding similarity models (`LaBSE`, `IndicBERT`) to detect cross-segment contradictions.

## 3. Dataset Provenance (§G.2)

To avoid Cultural and Procedural Drift, the system is designed to minimize reliance on generic Western emotional datasets.
*   **Pretraining:** Western-centric datasets like BP4D and AffectNet are strictly limited to the pretraining phases of generic landmark detection.
*   **Fine-Tuning:** Shipped models are theoretically fine-tuned and evaluated against Indian-population data, utilizing the IIIT-H Indic expression datasets and simulated volunteer mock sessions with explicit IRB-equivalent consent.

## 4. Threat Model & Adversarial Considerations (§13)

SANKET incorporates a robust threat model, addressing specific adversarial scenarios:

| Threat | Description | Implemented Mitigation |
| :--- | :--- | :--- |
| **T1: Officer Over-Reliance** | IO treats the system as a "lie detector." | Strict probabilistic UI; absence of red/green binary flags; explicit "Not Evidence" disclaimers. |
| **T2: Demographic Miscalibration** | System performs worse on certain populations. | `ComplianceDashboard.jsx` tracks Demographic Parity; fallback mode is available if calibration drops. |
| **T3: Subject Countermeasures** | Subject fakes high arousal to skew baseline. | Mandatory 3-5 minute baseline window; cross-modal checks prevent spoofing via a single modality. |
| **T4: Insider Exfiltration** | Officer improperly exports subject data. | The `/export` endpoint strictly enforces the **Two-Officer Rule** (requires Requesting IO & Authorizing IO IDs). |
| **T5: Log Tampering** | Malicious actor attempts to alter the audit trail. | `security.py` uses HMAC SHA-256 to hash-chain every log entry; any deletion breaks the chain. |
| **T7: Legal Challenge** | Court misinterprets the data as evidence. | Every exported artifact is cryptographically signed with the `ASSISTIVE — NOT EVIDENCE` tag. |

## 5. Deviations from RFP (Prototype Constraints)

As a hackathon prototype, certain hardware and scale constraints from the RFP have been simulated in software:
1.  **Hardware Rig:** Instead of a Jetson AGX Orin with Sony IMX sensors and FLIR thermal cameras, the prototype accepts standard webcam streams (`getUserMedia`) and file uploads.
2.  **Multilingual ASR Latency:** Real-time 500ms processing of 10-language ASR requires heavy GPU compute. The backend `audio.py` simulates these ASR outputs (including "Hinglish" tagging) to prove architectural readiness.
3.  **Hardware TPM:** The per-session cryptographic keys are generated in software (`simulated_tpm_key_X`) rather than derived from a physical TPM 2.0 module.
4.  **Local LLM Integration:** The generation of follow-up questions in the `InsightsPanel` is mocked via heuristics rather than running a local Llama-3-8B instance to preserve reasonable hardware performance during the demonstration.
