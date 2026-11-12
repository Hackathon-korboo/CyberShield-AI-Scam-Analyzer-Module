# CyberShield AI — Unified Investigation User Journey
## End-to-End Walkthrough: From Target Submission to Incident Response & Blockchain Proof

---

## 1. User Journey Flowchart

```
┌────────────────────────────────────────────────────────┐
│ Phase 1: Entry & Discovery                             │
│ User lands on Overview (/dashboard) or Scanner         │
│ Selects channel: [URL] [Message] [QR/UPI] [Email]      │
│ (Optional: Clicks 1-Click Test Sample)                 │
└──────────────────────────┬─────────────────────────────┘
                           │ Submits Target
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 2: Multi-Vector Investigation Engine             │
│ • URL: SSRF guard, DNS forensics, TLS, URLhaus         │
│ • Message: Local PII scrubbing, Multi-LLM reasoning    │
│ • QR/UPI: NPCI parameter decoding, Scan-to-receive     │
│ • Email: RFC 5322 parsing, SPF/DKIM/DMARC DNS records  │
└──────────────────────────┬─────────────────────────────┘
                           │ Stores Scan, Report, Graph Nodes
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 3: Canonical Forensic Dossier (/report/:id)      │
│ • Calibrated Threat Gauge (0-100) & Risk Level Badge   │
│ • Zero-PII Privacy Shield status banner                │
│ • Verbatim grounded evidence quotes                    │
│ • Transparent Analysis Coverage Matrix                 │
│ • Audit event timeline                                 │
└──────────┬───────────────────────────────┬─────────────┘
           │                               │
   Risk >= High                            │ Any Scan
           ▼                               ▼
┌────────────────────────┐      ┌────────────────────────┐
│ Phase 4: Golden Hour   │      │ Phase 5: Threat Graph  │
│ Victim Response        │      │ Correlation            │
│ • 1930 Helpline Dial   │      │ • Multi-hop BFS network│
│ • Account Lien Steps   │      │ • Verified vs inferred │
│ • Evidence Checklist   │      │ • Related infra nodes  │
└────────────────────────┘      └────────────────────────┘
           │                               │
           └───────────────┬───────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Phase 6: Trust & Cryptographic Verification            │
│ • Deterministic SHA-256 Canonical Fingerprint         │
│ • Arbitrum Sepolia On-Chain Ledger Status              │
│ • Interactive Tamper Simulation (Verifies Hash Shift)  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Step-by-Step Scenario Walkthroughs

### Scenario A: Suspicious QR Code (Scan-to-Receive Scam)
1. **Discovery**: A victim receives a WhatsApp message with a QR code claiming "Scan to receive Rs 4,500 refund from Paytm".
2. **Submission**: User navigates to `/dashboard`, switches to the **QR & UPI** tab, and pastes `upi://pay?pa=refund-support@okhdfcbank&pn=Paytm+Helpdesk&am=4500&cu=INR&tn=Scan+to+receive+cashback`.
3. **Execution**: Clicks **Investigate Target**. Backend executes `POST /api/v1/scans/qr`:
   - Decodes NPCI UPI parameters (`pa`, `pn`, `am`, `tn`).
   - Flags predatory pattern: *"Scanning a UPI QR code ALWAYS deducts money from your account. You NEVER need to scan a QR code to receive money."*
   - Flags brand impersonation on payee name *"Paytm Helpdesk"*.
   - Stores `Scan` record (`scan_id`) and `RiskReport`.
   - Computes canonical SHA-256 hash.
   - Ingests into `ThreatGraphService`.
4. **Canonical Report Dossier**:
   - Immediately redirects to `/report/:scan_id`.
   - Displays **Critical** risk badge and Score **100/100**.
   - Red **Emergency Golden Hour Alert** banner appears: *"Critical Risk Detected. Window: 1-to-3 Hours."*
5. **Incident Response Action**:
   - User clicks **"Call 1930 Helpline"** or **"Launch Response Plan"**.
   - Opens `/golden-hour?scan_id=...&scenario=financial_fraud`.
   - Dynamic checklist instructs victim on how to freeze illicit transfers via their bank nodal officer.

---

### Scenario B: Deceptive Phishing Email (Display Name Spoofing)
1. **Submission**: User receives an email from `"PayPal Account Security" <spoofed-support@paypal-alert.xyz>` with `Reply-To: attacker@mail.com`.
2. **Execution**: User pastes headers into the **Email Headers** tab in `/scanner`. Clicks **Execute Investigation**.
3. **Forensics**: Backend `POST /api/v1/scans/email` inspects RFC 5322 headers:
   - Identifies display name impersonating `"PayPal"`.
   - Detects `From` vs `Reply-To` mismatch (`paypal-alert.xyz` vs `attacker@mail.com`).
   - Queries DNS for SPF and DMARC alignment.
   - Outputs **High** risk verdict.
4. **Graph Exploration**:
   - User clicks **"Explore in Threat Graph"**.
   - Opens `/graph?scan_id=...`, visualizing the relationship between the email entity, domain node `paypal-alert.xyz`, and connected infrastructure.
5. **Verification**:
   - User reviews the SHA-256 canonical hash in the Verification Card.
   - Clicks **"Simulate Data Tampering"** to witness the cryptographic proof detect modification in real time.
