# CyberShield Nexus — Unified Technical Architecture

**Document Version**: 1.0.0  
**Project**: CyberShield AI (HackMatrix 2026)  
**Authoritative Local Repository**: `D:\My Created Projects\CyberShield_AI_Version_2-main`  

---

## 1. High-Level System Architecture

CyberShield Nexus bridges the gap between passive threat detection, victim recovery, and peer intelligence through an evidence-first, modular design:

```
+---------------------------------------------------------------------------------------+
|                                CYBERSHIELD NEXUS UI                                   |
|   Dashboard | URL Scanner | Message Analyzer | Threat Graph | Golden Hour | QR & UPI  |
|             Email Authenticator | Domain Intel | Community Telemetry Feed             |
+---------------------------------------------------------------------------------------+
                                           |
                                      REST APIs
                                           |
+---------------------------------------------------------------------------------------+
|                               FASTAPI V1 MASTER ROUTER                                |
|  /scans/url | /scans/message | /nexus/graph | /nexus/golden-hour | /nexus/qr/analyze  |
|  /nexus/email/authenticate   | /nexus/domain/intel | /nexus/community | /reports/verify  |
+---------------------------------------------------------------------------------------+
                                           |
    +--------------------------------------+-------------------------------------+
    |                                      |                                     |
    v                                      v                                     v
+-----------------------+      +-----------------------+      +----------------------+
|  MEMBER 1: PERIMETER  |      |   MEMBER 2: AI ENGINE  |      |  MEMBER 3: TRUST     |
|  - SSRF Preflight     |      |   - PIIRedactor (P0)  |      |  - Canonical Hasher  |
|  - DNS Forensics      |      |   - 3-Tier LLM Fallback|     |  - Hardhat EVM Smart |
|  - Redirect Tracer    |      |   - EvidenceValidator |      |    Contract Registry |
|  - TLS & Cert Check   |      |   - Prompt Injection   |      |  - On-Chain Proofs   |
|  - Defensive Headers  |      |     Mitigation         |      |  - Local Simulation  |
+-----------------------+      +-----------------------+      +----------------------+
    |                                      |                                     |
    +--------------------------------------+-------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                                CYBERSHIELD NEXUS SERVICES                             |
|  - ThreatGraphService: Ingests scan indicators, correlates campaigns, multi-hop BFS   |
|  - GoldenHourService: 5-scenario victim response wizard, 1930 / cybercrime.gov.in     |
|  - QRUPIAnalyzer: Decodes payload, parses NPCI parameters, flags scan-to-receive fraud |
|  - EmailAuthService: Checks RFC 5322 alignment, SPF TXT records, DMARC policies       |
|  - DomainIntelService: RDAP registration age, crt.sh CT logging, brand homoglyphs     |
|  - SecurityPostureService: Independent A+ to F hygiene grading for web infrastructure |
|  - CommunityThreatService: Zero-PII opt-in crowdsourced indicator feed               |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                               RELATIONAL PERSISTENCE                                  |
|  scans | threat_reports | risk_reports | scan_events | intelligence_results           |
|  threat_entities | threat_relationships | community_threat_reports                    |
+---------------------------------------------------------------------------------------+
```

---

## 2. Core Service Specifications

### 2.1 Threat Relationship Graph Engine (`ThreatGraphService`)
- **Entity Ingestion**: Automatically triggered upon scan completion for URLs, domains, IPs, phone numbers, emails, and message hashes.
- **Verification Tagging**:
  - `is_verified = True`: Mathematical indicator equality (same IP, same domain, exact phone match). Rendered as **solid edges**.
  - `is_verified = False`: Heuristic pattern inference (brand impersonation, template similarity). Rendered as **dashed edges**.
- **Query Complexity**: Breadth-First Search (BFS) bounded by depth `hops <= 3` and node limit `max_nodes = 60` to guarantee sub-50ms API response times.

### 2.2 Golden Hour Incident Response (`GoldenHourService`)
- **Time Criticality**: Targets the 1-to-3-hour window when financial lien placements by police nodal officers on beneficiary accounts prevent fund exfiltration.
- **Official Infrastructure**:
  - Toll-Free Helpline: `1930` (National Cyber Crime Reporting Helpline).
  - Portal: `https://cybercrime.gov.in/` (Ministry of Home Affairs).
  - Sachet Portal: `https://sachet.rbi.org.in/` (Reserve Bank of India).
  - Chakshu: `https://sancharsaathi.gov.in/sfc/` (Department of Telecommunications).
- **Zero-Credential Policy**: Never requests passwords, PINs, or active session tokens.

### 2.3 QR Code & UPI Scam Forensics (`QRUPIAnalyzer`)
- **NPCI Specification**: Parses `upi://pay?pa=...&pn=...&am=...&cu=...&tn=...`.
- **Scan-to-Receive Mitigation**: Detects social engineering lures where victims are falsely instructed to scan a QR code to "receive cash". Scanning a QR code ALWAYS deducts funds.
- **Safety Boundaries**: No automatic URL redirection, zero outbound payment triggering.

### 2.4 AI Privacy & PII Redaction (`PIIRedactor`)
- **Masking Mechanism**: Multi-pass regular expressions targeting Indian mobile numbers, emails, UPI VPAs, bank accounts, and OTP secrets.
- **Reversible Local Mapping**: Preserves an in-memory dictionary `{ "[REDACTED_PHONE_1]": "+91 9876543210" }` within the local process scope so the final report presents authentic evidence to authorized users while keeping third-party LLMs completely blinded to sensitive customer data.
