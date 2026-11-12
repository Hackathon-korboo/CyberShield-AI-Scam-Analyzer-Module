# CyberShield Nexus — AI Privacy, PII Redaction & Security Architecture

**Document Version**: 1.0.0  
**Module**: `app.services.nexus.pii_redactor`  
**API Endpoint**: `POST /api/v1/nexus/privacy/redact`  

---

## 1. Zero-Trust AI Privacy Architecture

When users submit scam messages, emails, or SMS bodies for AI-powered analysis, those texts often contain sensitive personal data:
- Victim's personal phone number or home address.
- Private banking account numbers or partial credit card digits.
- Authentic one-time passwords (OTPs) and verification PINs.
- Personal email communications.

Transmitting raw customer secrets to external cloud LLM providers (Groq, Gemini, OpenAI) violates enterprise privacy principles and exposes users to third-party data retention risks.

CyberShield Nexus introduces the **AI Privacy & PII Redaction Engine**:

```
+-------------------------------------------------------------------------------+
|                      PII REDACTION & LOCAL RESTORATION                        |
|                                                                               |
|  [Raw User Message with Personal Details]                                     |
|                         |                                                     |
|                         v                                                     |
|             [PIIRedactor Analysis Pass]                                       |
|             /                         \                                       |
|            /                           \                                      |
|           v                             v                                     |
|  [Sanitized Text]             [Local In-Memory Mapping]                       |
|  - Phone -> [REDACTED_PHONE_1] - [REDACTED_PHONE_1] -> +91 9876543210         |
|  - OTP   -> [REDACTED_SECRET_1]- [REDACTED_SECRET_1]-> 849201                 |
|  - Email -> [REDACTED_EMAIL_1] - [REDACTED_EMAIL_1] -> user@domain.com        |
|           |                           (NEVER EXPOSED TO CLOUD)                |
|           v                                     |                             |
|  [Third-Party Cloud LLM]                        |                             |
|  (Groq / Gemini / OpenAI)                       |                             |
|           |                                     |                             |
|           v                                     |                             |
|  [AI Reasoning & Evidence Findings]             |                             |
|           |                                     |                             |
|           +-----------------+-------------------+                             |
|                             |                                                 |
|                             v                                                 |
|          [Authorized Forensic Threat Report]                                  |
|          (Displays authentic evidence to user)                                |
+-------------------------------------------------------------------------------+
```

---

## 2. Blockchain Zero-PII Attestation Guarantee

Under Member 3's decentralized blockchain anchoring architecture:
1. Only canonical SHA-256 and Keccak-256 report hashes are committed to the Hardhat smart contract ledger.
2. Zero personal data, message bodies, phone numbers, or account references are recorded on-chain.
3. On-chain records serve strictly as tamper-proof verification anchors without exposing sensitive user telemetry to public blockchain explorers.

---

## 3. Strict Browser Isolation Assessment (Visual Clone Detection)

Per Section 13 guidelines:
> *"NEVER run an unrestricted browser crawler inside the normal application process. If adequate isolation cannot be provided, do not implement this feature. Document it as blocked by security requirements instead."*

### Security Evaluation & Policy Decision:
Running headless Chrome or Playwright crawlers inside the main application worker without dedicated micro-VM sandboxes creates severe vulnerabilities:
- Outbound SSRF bypasses via client-side JavaScript redirects.
- DNS rebinding attacks against internal container networks.
- Arbitrary memory exhaustion (DDoS) from heavy client-rendered WebGL or Canvas miners.

**Decision**: Visual brand clone screenshotting is formally **BLOCKED BY SECURITY POLICY** until isolated hardware-enforced micro-VM runners are deployed.
