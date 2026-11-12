# CyberShield Nexus — QR Code & UPI Scam Forensics

**Document Version**: 1.0.0  
**Module**: `app.services.nexus.qr_upi_analyzer`  
**API Endpoint**: `POST /api/v1/nexus/qr/analyze`  

---

## 1. Overview & Threat Vectors

QR codes are increasingly weaponized in social engineering campaigns across India and international markets. The two most prominent fraud vectors addressed by CyberShield Nexus are:

1. **Predatory "Scan-to-Receive" Fraud**:
   Fraudsters posing as buyers on marketplaces (OLX, Quikr) or customer service executives send victims a QR code, claiming: *"Scan this QR code to receive your refund / advance payment"*. 
   **In reality, scanning a QR code and entering a UPI PIN ALWAYS debits funds.** CyberShield Nexus immediately flags this predatory pattern as **CRITICAL FRAUD**.

2. **VPA Brand Impersonation**:
   Fraudsters register Virtual Payment Addresses resembling official organizations (e.g. `paytm.refund.desk@okhdfcbank`, `sbi.yono.support@upi`). CyberShield Nexus decomposes the VPA handle and verifies brand legitimacy.

---

## 2. Decoded NPCI UPI Parameter Matrix

| Parameter Key | Parameter Name | Forensic Purpose |
| :--- | :--- | :--- |
| `pa` | Payee VPA | Identifies recipient handle; audited for brand mimicry and disposable handles. |
| `pn` | Payee Display Name | Audited for deceptive lures ("Receive Cashback", "Electricity Refund"). |
| `am` | Requested Amount | Audited for high pre-filled debit amounts disguised as small test fees. |
| `cu` | Currency | Defaults to INR; flags unexpected international foreign currency requests. |
| `tn` | Transaction Note | Extracted for urgency words, lottery pretexts, and fake claim notices. |
| `mc` | Merchant Category Code | Distinguishes verified retail merchants from unregistered personal VPAs. |

---

## 3. Strict Safety Guarantees

- **Zero Outbound Payments**: CyberShield AI never initiates or triggers payment calls.
- **Zero PIN Requests**: CyberShield AI will NEVER prompt the user to input a UPI PIN or banking password.
- **Credential Protection**: Decoded Wi-Fi profile passwords (`WIFI:S:...;P:...;`) are stripped in summaries and never dispatched to AI providers.
- **Fairness in Scoring**: A standard grocery or merchant payment QR is classified as **Low Risk / Benign**. Legitimate commercial payments are not falsely condemned.
