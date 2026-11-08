# CyberShield AI — HackMatrix Submission Package

**Hackathon:** HackMatrix 2026  
**Track:** AI / Web3 / Cybersecurity & Digital Trust Track  
**Official Project Name:** CyberShield AI  
**One-Line Description:** An AI-powered zero-trust web threat detection and digital trust platform uniting preflight network forensics, resilient multi-LLM scam analysis, and on-chain cryptographic tamper verification.  
**Official GitHub Repository:** [https://github.com/Hackathon-korboo/CyberShield-AI-Scam-Analyzer-Module](https://github.com/Hackathon-korboo/CyberShield-AI-Scam-Analyzer-Module)  
**Live Production Web Application:** [https://cybershield-ai-web-roan.vercel.app/](https://cybershield-ai-web-roan.vercel.app/)  
**Live Backend API Gateway:** [https://cybershield-ai-api.vercel.app/](https://cybershield-ai-api.vercel.app/)  
**Swagger API Documentation:** [https://cybershield-ai-api.vercel.app/docs](https://cybershield-ai-api.vercel.app/docs)  
**Submission Deadline:** 10 November 2026, 10:00 PM IST  

---

## 1. Project Overview

CyberShield AI is an autonomous cybersecurity analysis platform that establishes a zero-trust threat intelligence pipeline. It unites deep technical website forensics, multi-tier AI social engineering and scam detection, and decentralized blockchain cryptographic report immutability.

Modern phishing attacks and social engineering campaigns are orchestrated at speeds beyond human triage capabilities. Attackers use generative AI to construct grammatically convincing lures and deploy short-lived domains that evade static blocklists. Simultaneously, traditional centralized logging systems are vulnerable to retrospective tampering, insider threats, and evidentiary loss.

CyberShield AI solves these challenges by combining:
1. **Technical Network Forensics & SSRF Guard** — Validating DNS, TLS, security headers, and redirect chains before any outbound request occurs.
2. **Resilient 3-Tier AI Analysis** — Utilizing Groq Cloud (Llama 3.3 70B), Google Gemini 1.5 Flash, and OpenAI GPT-4o-mini with offline regex fallback for high-throughput scam intent detection.
3. **Decentralized Immutability** — Registering canonical SHA-256 / Keccak-256 hashes of forensic reports onto an EVM smart contract (`ThreatReportRegistry.sol`) for permanent proof of origin and tamper resistance.
4. **Interactive 3D Sentinel Interface** — Providing users and security analysts with an intuitive React 18 / Three.js 3D dashboard displaying real-time threat telemetry.

---

## 2. Core Feature Matrix

| Feature | Engineering Lead | Technical Capability |
| :--- | :--- | :--- |
| **SSRF Zero-Outbound Guard** | Member 1 | Validates target domain and IP against private/reserved ranges (`10.0.0.0/8`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.169.254`, RFC 2606) before external connection. |
| **DNS & TLS Forensics** | Member 1 | Queries authoritative DNS records (A, AAAA, MX, TXT), validates X.509 certificate validity and issuer authority, and audits defensive headers (CSP, HSTS, X-Frame-Options). |
| **Multi-Hop Redirect Tracer** | Member 1 | Follows cloaked redirect paths up to 5 hops, recording intermediary HTTP status codes and latency. |
| **3-Tier AI Failover Engine** | Member 2 | Orchestrates primary Groq Llama 3.3 (300+ t/s) with automatic failover to Gemini 1.5 Flash and OpenAI GPT-4o-mini, backed by local regex heuristics. |
| **Evidence Grounding** | Member 2 | Strictly requires all AI-identified threat indicators to match verbatim excerpts in the submitted text, preventing LLM hallucinations. |
| **Threat Intelligence Feeds** | Member 1 & 4 | Cross-references URLs against live feeds from abuse.ch URLhaus malware registry and PhishTank community database. |
| **Cryptographic Anchoring** | Member 3 | Generates canonical SHA-256 hashes of reports and commits proofs to `ThreatReportRegistry.sol` smart contract on EVM networks. |
| **Instant Tamper Verification** | Member 3 | Recalculates report hashes on-demand via API to verify audit-trail integrity (`/api/v1/reports/{id}/verify`). |
| **Three.js 3D Sentinel UI** | Member 4 | Interactive WebGL 3D robot scene with dynamic lighting, responsive prompts, and real-time threat visualization. |
| **Unified REST API** | Member 4 | Consolidated OpenAPI 3.0 specification covering URL scanning, message analysis, report verification, and system status. |

---

## 3. Technology Stack

- **Frontend:** React 18.2, Vite 5.4, TypeScript 5.2, Three.js 0.187, Tailwind CSS 3.4, Recharts 2.12, Lucide React.
- **Backend:** Python 3.12, FastAPI 0.115, Uvicorn, Pydantic v2.7, HTTPX 0.27, SQLAlchemy 2.0, Web3.py 6.0, Psycopg2.
- **AI Models:** Groq Llama-3.3-70b-versatile, Google Gemini-1.5-flash, OpenAI GPT-4o-mini, Local Regex Heuristic Engine.
- **Threat Feeds:** abuse.ch URLhaus, PhishTank.
- **Smart Contracts:** Solidity 0.8.24, Hardhat 2.29, Ethers.js.
- **Hosting & CI/CD:** Vercel Global Edge (Frontend), Vercel Fluid Compute Serverless (Backend), GitHub Actions CI.

---

## 4. Four-Member Contribution Breakdown

- **Member 1 (Backend Core & Forensics):** Developed the master FastAPI gateway, preflight SSRF protection, DNS resolver, TLS certificate inspector, HTTP header auditor, redirect tracer, threat intelligence integration, and report generator.
- **Member 2 (AI Scam Analyzer Engine):** Designed the 3-tier multi-provider LLM failover architecture, prompt-injection defense mechanisms, EvidenceValidator ground-truth matching, and offline heuristic pattern matching.
- **Member 3 (Blockchain & Cryptography):** Authored `ThreatReportRegistry.sol`, canonical report hashing engine (SHA-256 & Keccak-256), Web3.py client adapter, Hardhat test suite, and tamper-detection logic.
- **Member 4 (Frontend UI & 3D WebGL Experience):** Created the React 18 Single Page Application, Three.js 3D Sentinel Robot canvas, risk scoring dashboard, telemetry charts, URL scanner view, message analyzer view, and REST API integration.

---

## 5. Verified Build and Test Status

| Component | Test Suite | Total Tests | Passed | Failed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Backend Core** | PyTest (`pytest backend/tests`) | **415** | **415** | 0 | **100% Passed** |
| **Smart Contracts** | Hardhat (`npx hardhat test`) | **29** | **29** | 0 | **100% Passed** |
| **Frontend App** | Vite / TypeScript (`npm run build`) | 2,162 modules | 100% | 0 | **100% Clean Build** |
| **Total Automated Tests** | All Suites Combined | **444** | **444** | 0 | **100% Passing** |

---

## 6. Deployment Information

- **Frontend Live Target:** `https://cybershield-ai-web-roan.vercel.app/`
- **Backend Live Target:** `https://cybershield-ai-api.vercel.app/`
- **Backend Health Check:** `https://cybershield-ai-api.vercel.app/api/v1/health`
- **System Diagnostics:** `https://cybershield-ai-api.vercel.app/api/v1/system/status`
- **Interactive Documentation:** `https://cybershield-ai-api.vercel.app/docs`
- **Continuous Integration:** `.github/workflows/ci.yml` triggers automated tests and builds on every push to `main` and pull requests.

---

## 7. Submission Form Information Reference

When completing the HackMatrix online form:
- **Project Title:** CyberShield AI
- **Repository URL:** `https://github.com/Hackathon-korboo/CyberShield-AI-Scam-Analyzer-Module`
- **Live Demo URL:** `https://cybershield-ai-web-roan.vercel.app/`
- **Track:** AI / Web3 / Cybersecurity & Digital Trust Track *(Pending confirmation in team leader dashboard)*
- **Problem Statement:** AI-Powered Web Threat Detection & Digital Trust Intelligence
- **Demo Video Link:** `https://www.youtube.com/watch?v=lfhW9cDFUoQ` (Hackathon Demonstration Walkthrough)
- **Pitch Deck:** `OPTIONAL — NOT SUBMITTED` (Per team decision based on official HackMatrix guidelines)
- **Project Documentation Link:** Google Docs / Notion export of [`docs/HACKMATRIX_PROJECT_WRITEUP.md`](HACKMATRIX_PROJECT_WRITEUP.md)
- **Short Description:** See [`docs/HACKMATRIX_SHORT_DESCRIPTION.md`](HACKMATRIX_SHORT_DESCRIPTION.md)
