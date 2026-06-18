# █ PROJECT SANKET
**A Legally Compliant, Multimodal Assistive Interview Platform for Indian Law Enforcement**

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![React](https://img.shields.io/badge/React-18-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-blue)
![Status](https://img.shields.io/badge/Status-Hackathon_Prototype-brightgreen)

## 📖 Overview
**Project SANKET** is a decoupled, edge-deployed assistive interview tool designed specifically for the rigorous constraints of an Indian Police interrogation room. 

It acts as a cognitive co-pilot for Investigating Officers (IOs), tracking physiological anomalies (gaze, pitch, posture) and providing real-time transcripts, while strictly adhering to Indian constitutional law (*Selvi v. State of Karnataka 2010*, DPDP Act 2023).

> ⚠️ **CRITICAL DISCLAIMER:** SANKET is strictly an **observational aid**. It does **NOT** perform "lie detection," which is scientifically invalid and legally prohibited. All outputs are probabilistic and mathematically secured with an `ASSISTIVE — NOT EVIDENCE` cryptographic tag.

---

## 🚀 Key Features

*   **Real-time Multimodal Telemetry:** A live, discreet dashboard surfacing gaze shifts, postural changes, and vocal anomalies instantly via `MediaPipe`.
*   **Compliance-by-Design:** Enforces a Consent-Absent fallback mode and prevents self-incrimination via strict data sovereignty (100% on-device processing).
*   **Code-Switching ASR:** Architected to handle "Hinglish" and complex linguistic code-switching seamlessly.
*   **Post-Session Deep Review:** Auto-generates structured, cross-referenced case reports for Senior IOs.
*   **Enterprise-Grade Security:** Features an HMAC SHA-256 Merkle-style hash-chained audit log and a strict "Two-Officer" export rule.

---

## 🛠️ Tech Stack

*   **Frontend:** React.js, Vite, Recharts, Lucide React
*   **Backend:** FastAPI (Python), SQLAlchemy, Pydantic
*   **Computer Vision Engine:** MediaPipe (FaceMesh, Pose, Iris tracking)
*   **Database:** SQLite (designed for seamless migration to PostgreSQL)
*   **Security:** Cryptographic Hash Chaining, TLS 1.3 architecture simulation

---

## 📄 Hackathon Deliverables

As part of the hackathon submission, the following architectural and compliance documents have been included in the repository:
1.  **[Architecture Document](./architecture_document.md):** Detailed breakdown of model choices, deployment pathways, and threat modeling.
2.  **[Legal Compliance Mapping](./legal_compliance_mapping.md):** 1-to-1 mapping of technical features against the DPDP Act 2023, BNSS 2023, and Supreme Court rulings.
3.  **[Bias & Calibration Report](./bias_calibration_report.md):** Documentation of demographic parity tracking and the explainability (XAI) architecture.
4.  **[Pitch Deck](./pitch_deck.md):** A 10-page executive summary presentation.

---

## ⚙️ Installation & Setup

### Prerequisites
*   Python 3.10+
*   Node.js 18+ & npm
*   Git

### 1. Clone the Repository
```bash
git clone https://github.com/saivivekduvva/Project-SANKET.git
cd Project-SANKET
```

### 2. Run the Backend (FastAPI)
```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```
*The backend will now be running at http://localhost:8000*

### 3. Run the Frontend (React/Vite)
Open a **new terminal window** and navigate to the frontend directory:
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
*The frontend will now be running at http://localhost:5173*

---

## 👮 Usage Workflow

1.  **Start a Session:** Open the frontend UI. You will be prompted by the `ConsentModal`.
2.  **Consent / Fallback:** If the subject consents, the system enters the `baselining` mode for 3 minutes before actively tracking anomalies. If consent is refused, the system enters a DPDP-compliant Fallback Mode (no camera tracking).
3.  **Live Telemetry:** The IO observes the rolling timeline of physiological cues and can use the Insights Panel for suggested questions.
4.  **Halt / Distress:** The IO can click the **Distress** button at any time to immediately halt the AI tracking and log a vulnerability event.
5.  **Post-Session Export:** The Senior IO reviews the Top 5 anomalies and authorizes an export. The system generates a cryptographically signed JSON/PDF artifact.

---

## ⚖️ License
This project is open-sourced under the MIT License. See the [LICENSE](LICENSE) file for details.
