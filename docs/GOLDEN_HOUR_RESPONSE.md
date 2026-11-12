# CyberShield Nexus — Golden Hour Incident Response Center

**Document Version**: 1.0.0  
**Module**: `app.services.nexus.golden_hour`  
**API Endpoints**: 
- `GET /api/v1/nexus/golden-hour/scenarios`
- `POST /api/v1/nexus/golden-hour/generate`

---

## 1. What is the "Golden Hour"?

In financial cyber fraud, the **Golden Hour** refers to the initial 1 to 3 hours immediately following an unauthorized transaction or credential compromise. During this window:
1. Siphoned funds are typically routed through intermediate mule accounts before cash withdrawal or crypto conversion.
2. Dialing **1930** (Citizen Financial Cyber Fraud Reporting System) enables state police nodal officers to immediately place an administrative lien or debit freeze on the fraudster's beneficiary bank account or payment wallet.
3. Prompt reporting increases the mathematical probability of fund recovery exponentially compared to reporting after 24 hours.

---

## 2. Five Supported Incident Scenarios

| Scenario | Incident Trigger | Threat Classification | Immediate Priority |
| :--- | :--- | :--- | :--- |
| **Scenario A** | Received suspicious message/SMS, did not click | Low / Precautionary | Report sender number to DoT Chakshu (`sancharsaathi.gov.in/sfc`); block sender in messaging app. |
| **Scenario B** | Clicked suspicious URL, entered no credentials | Medium / Monitoring | Clear browser cookies and cache; inspect push notification permissions; submit link to CyberShield scanner. |
| **Scenario C** | Entered passwords, account numbers, or OTP | High / Credential Theft | Change passwords from an independent clean device; invoke "Log Out Everywhere"; re-enroll MFA with an Authenticator app. |
| **Scenario D** | Transferred money via UPI, NetBanking, or Card | **CRITICAL EMERGENCY** | **Call 1930 immediately**; contact bank fraud desk using verified number on card; lodge formal complaint on `cybercrime.gov.in`. |
| **Scenario E** | Downloaded suspicious APK or remote-control software | **CRITICAL EMERGENCY** | Enable Airplane Mode immediately to sever remote control; revoke Device Admin permissions; scan with Play Protect. |

---

## 3. Verified Law Enforcement Infrastructure

- **National Cyber Crime Helpline (India)**: `1930` (Toll-Free, 24x7, MHA National Nodal Network).
- **National Cyber Crime Reporting Portal**: `https://cybercrime.gov.in/`
- **RBI Sachet Portal**: `https://sachet.rbi.org.in/`
- **Department of Telecommunications Chakshu**: `https://sancharsaathi.gov.in/sfc/`

---

## 4. Evidence Preservation Protocol

Victims are explicitly instructed **NOT** to factory reset their devices immediately if financial loss occurred:
- Police forensic teams require intact SMS headers and call records.
- Note the 12-digit UTR (Unique Transaction Reference) number from bank SMS or passbook.
- Capture full-screen screenshots of payment confirmations, beneficiary VPAs, and attacker messages.
