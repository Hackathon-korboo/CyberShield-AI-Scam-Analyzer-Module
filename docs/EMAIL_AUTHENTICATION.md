# CyberShield Nexus — Email Authentication & Sender Trust

**Document Version**: 1.0.0  
**Module**: `app.services.nexus.email_auth`  
**API Endpoint**: `POST /api/v1/nexus/email/authenticate`  

---

## 1. Overview & Threat Vectors

Email continues to be the dominant attack vector for phishing and credential harvesting. Attackers frequently exploit the legacy nature of SMTP to spoof official senders:
1. **Display Name Spoofing**: Showing "PayPal Security Alert" in the friendly name while transmitting from a free webmail account (`alert-desk@gmail.com`).
2. **Domain Alignment Mismatch**: Setting the `From` header to an official domain (`company.com`) while setting `Reply-To` to an external attacker-controlled inbox (`hacker@yahoo.com`).
3. **Unauthenticated Infrastructure**: Sending emails from servers not authorized by the domain's SPF or DKIM cryptographic policies.

---

## 2. Authentication Verifications Executed

### 2.1 SPF (Sender Policy Framework)
- Queries authoritative DNS TXT records for `v=spf1 ...`.
- Verifies if the sending mail transfer agent (MTA) IP is authorized.
- Standard verdicts: `PASS`, `FAIL`, `SOFTFAIL`, `NEUTRAL`, `NONE`, `NOT_AVAILABLE`.

### 2.2 DKIM (DomainKeys Identified Mail)
- Verifies the cryptographic public-key signature in the `DKIM-Signature` header.
- Asserts that the message body and critical headers were not tampered with in transit.
- Standard verdicts: `PASS`, `NONE`, `NOT_AVAILABLE`.

### 2.3 DMARC (Domain-based Message Authentication)
- Queries authoritative DNS TXT records for `_dmarc.<domain>`.
- Evaluates policy actions: `p=reject`, `p=quarantine`, `p=none`.
- Inspects receiver MTA `Authentication-Results` headers.

---

## 3. Honest Unavailability Handling

A plain pasted message without RFC 5322 transport headers cannot prove SPF or DKIM authenticity. Rather than fabricating a clean result or an artificial failure, CyberShield Nexus explicitly classifies the authentication state as:
`NOT_AVAILABLE (No RFC 5322 headers provided)`.
