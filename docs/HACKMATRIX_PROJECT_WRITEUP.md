# CyberShield AI — Comprehensive Project Write-Up

**Hackathon:** HackMatrix 2026  
**Track:** AI / Web3 / Cybersecurity & Digital Trust Track  
**Project Title:** CyberShield AI  
**Format:** Full Technical Document (Suitable for Google Docs / Notion export)  

---

## 1. Executive Summary

CyberShield AI is an autonomous, enterprise-grade cybersecurity analysis platform engineered to protect organizations and digital citizens against modern web threats, AI-generated social engineering, and fraudulent websites. By synthesizing preflight network forensics, multi-tier generative AI scam reasoning, and decentralized blockchain cryptographic verification, CyberShield AI establishes a complete, zero-trust digital intelligence pipeline.

The platform provides end users with an intuitive, interactive React 18 / Three.js 3D interface, and exposes a robust FastAPI backend capable of processing forensic investigations with rapid response times, ground-truth evidence validation to minimize model hallucinations, and decentralized audit immutability.

---

## 2. Problem Statement & Threat Landscape

### 2.1 The Rise of LLM-Generated Social Engineering
Traditional phishing detection relies heavily on static regex heuristics, keyword blocklists (e.g., searching for "URGENT", "WIRE TRANSFER"), and spam scoring models. Threat actors now use generative AI to produce contextually nuanced, grammatically flawless, and hyper-personalized phishing messages that mimic legitimate bank communications, corporate executive requests, and supplier notices. These attacks easily evade conventional email gateways.

### 2.2 Ephemeral and Cloaked Infrastructure
Malicious campaigns increasingly rely on short-lived infrastructure:
- **Fast-Flux DNS:** Rapidly alternating IP mappings to defeat IP blacklists.
- **Dynamic Throwaway Domains:** Domains registered and activated within minutes, weaponized for fewer than 4 hours, and discarded before security vendors categorize them.
- **Multi-Hop Cloaked Redirects:** Web servers serving benign content to automated security crawlers while redirecting targeted human victims through cloaked intermediary paths to credential harvesting forms.

### 2.3 Server-Side Request Forgery (SSRF) Vulnerability in Scanners
Many web vulnerability scanners and link-preview engines inadvertently introduce internal security vulnerabilities. When configured to inspect untrusted user-submitted URLs, an attacker can point the scanner at internal IP addresses (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`) or cloud instance metadata services (`169.254.169.254`) to exfiltrate private credentials, tokens, and database secrets.

### 2.4 The Forensic Audit and Non-Repudiation Gap
In conventional security operations, threat reports, audit logs, and risk assessments are stored in centralized relational databases. These records are subject to retrospective tampering, unauthorized deletion, or administrative compromise. When forensic evidence is presented in financial fraud disputes or legal proceedings, centralized logs lack cryptographic proof of origin and can be legally contested as repudiable.

---

## 3. The Proposed Solution: CyberShield AI Architecture

CyberShield AI implements an end-to-end, multi-layered defensive pipeline designed to address all four vectors:

```
[ Incoming Target: URL or Message ]
               │
               ▼
┌──────────────────────────────────────────────┐
│ 1. Zero-Outbound Preflight & SSRF Guard      │
│    - RFC 2606 Reserved Domain Normalization  │
│    - Loopback, Private & Link-Local Filter   │
└──────────────────────┬───────────────────────┘
                       │ Valid Target
                       ▼
┌──────────────────────────────────────────────┐
│ 2. Deep Technical Network Forensics          │
│    - DNS Record Auditor (A, AAAA, MX, TXT)   │
│    - X.509 TLS/SSL Certificate Chain Check   │
│    - Defensive Security Header Analysis      │
│    - Multi-Hop Redirect Trace (Max 5 Hops)   │
└──────────────────────┬───────────────────────┘
                       │ Network Signals
                       ▼
┌──────────────────────────────────────────────┐
│ 3. 3-Tier Resilient AI Scam Analyzer         │
│    - Primary: Groq Llama 3.3 70B (300+ t/s)  │
│    - Failover 1: Google Gemini 1.5 Flash     │
│    - Failover 2: OpenAI GPT-4o-mini          │
│    - Offline Safety: Local Regex Heuristics  │
│    - EvidenceValidator (Ground-Truth Check)  │
└──────────────────────┬───────────────────────┘
                       │ Linguistic Signals
                       ▼
┌──────────────────────────────────────────────┐
│ 4. Threat Intelligence & Risk Aggregator     │
│    - abuse.ch URLhaus Malware Blacklist Feed │
│    - PhishTank Community Verified Phishing   │
│    - 0–100 Weighted Deterministic Scoring    │
└──────────────────────┬───────────────────────┘
                       │ Unified Report
                       ▼
┌──────────────────────────────────────────────┐
│ 5. Persistence & Blockchain Trust Layer      │
│    - Canonical JSON Normalization (SHA-256)  │
│    - On-Chain Commitment (Keccak-256)        │
│    - ThreatReportRegistry.sol Smart Contract │
└──────────────────────────────────────────────┘
```

---

## 4. In-Depth Component Analysis

### 4.1 Backend Architecture (Member 1 Lead)
The core backend is implemented using **FastAPI** with asynchronous ASGI request processing:
- **Preflight SSRF Guard:** Resolves hostnames against local DNS before initiating outbound HTTP connections. Any IP resolving to loopback (`127.0.0.0/8`), private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local (`169.254.0.0/16`), or multicast ranges is instantly rejected with HTTP 400 Bad Request.
- **DNS Forensics:** Inspects authoritative name servers, mail exchange (MX) presence, and SPF/DMARC TXT records to identify domain spoofability.
- **TLS/SSL Certificate Inspector:** Connects securely over port 443, extracts the X.509 certificate, verifies the validity period, issuer authority, and flags expired or self-signed certificates.
- **Defensive Header Auditor:** Checks for Content Security Policy (`Content-Security-Policy`), Clickjacking protection (`X-Frame-Options`), MIME sniffing defense (`X-Content-Type-Options`), and HTTPS enforcement (`Strict-Transport-Security`).

### 4.2 Resilient AI Scam Analyzer (Member 2 Lead)
The AI analysis engine evaluates deceptive text, emails, SMS lures, and social media inquiries:
- **3-Tier Failover Engine:** Under production conditions, cloud APIs can face rate-limits (HTTP 429), regional outages, or latency spikes. The orchestrator queries **Groq Cloud Llama-3.3-70b-versatile** as primary. If unavailable, it seamlessly switches to **Google Gemini 1.5 Flash**, then **OpenAI GPT-4o-mini**, and finally an offline **Regex Heuristic Engine**.
- **EvidenceValidator:** To prevent LLM hallucinations, the engine verifies that any indicator cited by the AI (such as "Urgent account suspension claim") exists as an exact verbatim substring within the user's submitted content. If the AI hallucinates text, the EvidenceValidator purges the ungrounded assertion.
- **Prompt Injection Hardening:** Defensive system prompts and delimiter isolation ensure that user messages cannot execute jailbreaks or override the threat analyzer's instructions.

### 4.3 Blockchain & Cryptographic Trust Layer (Member 3 Lead)
To guarantee non-repudiation and permanent integrity:
- **Canonical Serialization:** A deterministic serializer sorts JSON keys alphabetically, strips non-deterministic timestamps, and enforces strict UTF-8 formatting.
- **Evidentiary Hash (SHA-256):** Produces a 64-character hexadecimal digest representing the forensic report.
- **EVM Smart Contract (`ThreatReportRegistry.sol`):** Written in Solidity 0.8.24, the registry allows authorized registrar accounts to commit report hashes, timestamps, and threat levels. Duplicate hashes are rejected, and registrar authority can be governed or revoked.
- **Verification API:** Calling `/api/v1/reports/{id}/verify` recalculates the canonical hash from current database state and compares it against the stored hash and on-chain record, immediately exposing any manual tampering.

### 4.4 Frontend Experience & 3D WebGL Interface (Member 4 Lead)
The client interface is built with **React 18**, **Vite**, and **TypeScript**:
- **Three.js 3D Cyber Sentinel:** Features an interactive white ceramic 3D robot scene with studio lighting, gradient face ring, and smooth camera transitions rendered over an ambient cyber grid.
- **Real-Time Telemetry:** Recharts components render risk score distributions, threat classifications, and multi-hop network latency charts.
- **Instant Testing Controls:** Analysts can toggle between forensic URL scanning, scam message analysis, scan history, and one-click cryptographic report verification.

---

## 5. Security Architecture & Threat Modeling

1. **Zero Outbound Exposure:** Synthetic test domains (RFC 2606) such as `.test`, `.example`, `.invalid`, and `.localhost` are treated gracefully with simulated benign responses, preventing needless outbound DNS spam.
2. **Sanitized Exception Handlers:** Production FastAPI exception handlers trap unhandled errors and return generic correlation IDs (`error_id: 6c13fd9c3453`) without leaking stack traces, database schemas, internal paths, or secrets.
3. **Secret Segregation:** Frontend builds expose only public environment variables (`VITE_API_BASE_URL`). All LLM API keys and database credentials reside exclusively in serverless secret vaults.

---

## 6. Verification & Test Metrics

The codebase maintains a dual-layer automated test suite:
- **Backend PyTest Suite:** 415 passed / 415 total (100% success rate across URL auditing, message intelligence, and API integration).
- **Blockchain Hardhat Suite:** 29 passing / 29 total (100% success rate across registry authorization, tamper detection, and cross-language hash consistency).
- **Frontend TypeScript/Vite Compilation:** 2,162 modules transformed with 0 build errors.
- **Total Automated Platform Tests:** **444 / 444 tests passing**.

---

## 7. Limitations & Future Roadmap

### 7.1 Current Limitations
- **On-Chain Gas Funding:** While the smart contract test suite passes 100% and deployment scripts are verified, running on public Ethereum testnets requires live gas funding. The backend defaults to zero-dependency Cryptographic Simulation Mode when public RPCs are absent.
- **Dynamic JavaScript Execution:** The URL inspector audits static response headers and certificates; it does not currently execute dynamic headless browser scripts on the remote web page.

### 7.2 Future Improvements
1. **Real-Time Browser Extension:** A Chrome/Edge extension that intercepts clicked links and queries the CyberShield AI API before the browser renders the page.
2. **Multi-Validator Consensus Oracle:** A decentralized network of independent validator nodes that reach Byzantine Fault Tolerant (BFT) consensus on threat scores before blockchain commitment.
3. **Zero-Knowledge Proofs (ZK-SNARKs):** Allowing financial institutions to prove that a customer was targeted by a confirmed phishing campaign without revealing the customer's identity or private account details.

---

## 8. Conclusion

CyberShield AI provides a complete, production-tested, and verifiable answer to the challenge of modern cyber threats. By uniting technical network forensics, resilient multi-LLM intelligence, and decentralized blockchain cryptographic immutability, the platform establishes digital trust in an increasingly deceptive digital world.
