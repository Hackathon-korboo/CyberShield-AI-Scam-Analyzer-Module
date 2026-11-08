# CyberShield AI — Pitch Deck Slides (HackMatrix 2026)

**Project Name:** CyberShield AI  
**Track:** AI / Web3 / Cybersecurity & Digital Trust Track  
**Format:** 11-Slide Pitch Deck  
**Editable Presentation File:** [`docs/CyberShield_AI_Pitch_Deck.pptx`](CyberShield_AI_Pitch_Deck.pptx)  

---

## Slide 1: Title & Project Introduction
- **Header:** CyberShield AI
- **Subtitle:** AI-Powered Web Threat Detection & Digital Trust Intelligence
- **Category:** HackMatrix 2026 Hackathon Final Submission
- **Core Proposition:** A unified zero-trust defense pipeline combining deep technical network forensics, multi-tier generative AI social engineering analysis, and decentralized blockchain verification.
- **Live Deployments:**
  - Web Application: https://cybershield-ai-web-roan.vercel.app/
  - API Gateway: https://cybershield-ai-api.vercel.app/
  - Official Repository: https://github.com/Hackathon-korboo/CyberShield-AI-Scam-Analyzer-Module

---

## Slide 2: Problem Statement
- **Header:** The Threat Landscape: Next-Generation Social Engineering
- **Key Challenges:**
  1. **AI-Generated Phishing:** Attackers leverage LLMs to create hyper-realistic, grammatically perfect, and contextually targeted deceptive lures that easily bypass keyword filters.
  2. **Ephemeral & Cloaked Infrastructure:** Short-lived domains, fast-flux DNS configurations, and multi-hop cloaked redirects evade traditional static blacklists.
  3. **Scanner Weaponization (SSRF):** Vulnerable security crawlers are manipulated through Server-Side Request Forgery into probing cloud metadata (`169.254.169.254`) and internal subnets.
  4. **Forensic Record Fragility:** Centralized logs and incident databases are susceptible to retrospective tampering, database manipulation, or administrative repudiation.

---

## Slide 3: Why the Problem Matters
- **Header:** High-Stakes Consequences & The Need for Trust
- **Impact Metrics:**
  - Over $10 Billion lost annually worldwide to phishing, credential theft, and business email compromise scams.
  - Zero-Day Attack Windows: Phishing domains operate in micro-bursts, completing credential theft within 4 hours of domain creation.
  - Legal & Evidentiary Gap: Security Operations Centers (SOCs) and fraud victims struggle to prove that forensic evidence was not fabricated or modified post-incident.
  - Requirement: Detection must occur in sub-seconds, survive external API outages, and produce tamper-evident proof.

---

## Slide 4: Our Proposed Solution
- **Header:** CyberShield AI: Multi-Layered Defense & Digital Trust
- **Architecture Pillars:**
  1. **Zero-Outbound Preflight:** Strict SSRF guard and RFC 2606 reserved domain validation.
  2. **Technical Forensic Engine:** Live DNS, SSL/TLS certificate chains, and defensive security header audits.
  3. **3-Tier Resilient AI Engine:** High-speed inference using Groq Llama 3.3 (300+ t/s), backed by Google Gemini 1.5 Flash, OpenAI GPT-4o-mini, and offline regex heuristics.
  4. **Decentralized Cryptographic Anchoring:** Deterministic canonical report serialization (SHA-256) registered on an EVM smart contract (`ThreatReportRegistry.sol`).
  5. **Interactive 3D Sentinel Dashboard:** Real-time WebGL 3D robot interface with interactive telemetry.

---

## Slide 5: Key Platform Capabilities
- **Header:** Enterprise-Grade Threat Intelligence Features
- **Capabilities:**
  - **Dual Forensic Modalities:** Comprehensive URL/website scanner and AI-driven scam message investigator.
  - **EvidenceValidator:** Enforces zero hallucinations by requiring all detected threat indicators to match exact verbatim excerpts.
  - **Live Threat Feeds:** Integrated lookups against abuse.ch URLhaus malware registry and PhishTank verified phishing database with TTL caching.
  - **Deterministic Risk Scoring:** Transparent 0–100 normalized risk score synthesizing technical network signals and linguistic threat patterns.
  - **Instant Tamper Verification:** Single-click verification recalculates report hashes on demand to detect unauthorized modifications.

---

## Slide 6: System Architecture
- **Header:** Five-Layer Intelligence Pipeline
- **Pipeline Breakdown:**
  - **Tier 1 (Client):** React 18, Vite, Three.js 3D Sentinel Robot canvas, Tailwind CSS, and Recharts.
  - **Tier 2 (Unified Gateway):** FastAPI asynchronous ASGI server with strict CORS, rate limiting, and Pydantic validation.
  - **Tier 3 (Forensic & AI Engines):** Preflight SSRF filters, DNS/TLS auditors, and 3-tier LLM failover.
  - **Tier 4 (Threat Intelligence & Scoring):** Real-time feed integration (URLhaus, PhishTank) and deterministic risk engine.
  - **Tier 5 (Trust & Immutability):** Canonical JSON serializer, Web3.py client, and Solidity smart contract registry.

---

## Slide 7: AI Scam-Analysis Workflow
- **Header:** Resilient Inference with 3-Tier Multi-Provider Failover
- **Execution Flow:**
  - **Primary Engine:** Groq Cloud Llama-3.3-70b-versatile delivers high-throughput semantic analysis in under 500ms.
  - **Tier 2 Failover:** Automatically switches to Google Gemini 1.5 Flash if Groq experiences rate limits or network latency.
  - **Tier 3 Failover:** Falls back to OpenAI GPT-4o-mini as a secondary cloud provider.
  - **Tier 4 Offline Safety:** If external network access is completely interrupted, the local regex heuristic engine classifies known financial and urgency patterns.
  - **Prompt Injection Defense:** Input sanitation prevents adversarial prompts and instructions from hijacking LLM reasoning.

---

## Slide 8: Blockchain & Cryptographic Integrity
- **Header:** Decentralized Proof of Authenticity
- **Technical Mechanism:**
  - **Canonical Serialization:** Report payloads are normalized, sorted, and stripped of non-deterministic fields.
  - **Evidentiary Hash (SHA-256):** Human-auditable 64-character hash embedded directly in client reports.
  - **On-Chain Commitment (Keccak-256):** Anchored to the `ThreatReportRegistry.sol` smart contract on EVM networks.
  - **Zero-Dependency Simulation Mode:** Seamless fallback creates identical canonical SHA-256 hashes when public testnet RPCs are unavailable.
  - **Non-Repudiation:** Any tampering with the report summary, evidence, or risk score invalidates the cryptographic proof immediately.

---

## Slide 9: Technology Stack
- **Header:** Production-Verified Technology Stack
- **Components:**
  - **Frontend:** React 18.2, TypeScript 5.2, Vite 5.4, Three.js (WebGL), Tailwind CSS, Lucide React, Recharts.
  - **Backend:** Python 3.12, FastAPI 0.115, HTTPX, SQLAlchemy 2.0, Pydantic v2, Web3.py.
  - **Blockchain:** Solidity 0.8.24, Hardhat 2.29, Ethers.js.
  - **AI Inference:** Groq Cloud, Google Gemini, OpenAI, Regex Heuristics.
  - **Testing:** PyTest (415 passed), Hardhat (29 passing), TypeScript/Vite (2,162 modules bundled).
  - **Hosting:** Vercel Global Edge Network (Frontend) & Vercel Fluid Compute Serverless (FastAPI Backend).

---

## Slide 10: Impact, Limitations & Roadmap
- **Header:** Real-World Application & Future Evolution
- **Impact & Feasibility:**
  - Immediate value for enterprise security teams, anti-fraud units, and individual users identifying suspicious links or emails.
  - Operational limits: Public testnet operations require funded gas wallets; local/simulation mode provides full local parity.
- **Future Roadmap:**
  - **Phase 1:** Browser extension with real-time pre-click URL interception and phishing warning badges.
  - **Phase 2:** Multi-validator decentralized oracle network for decentralized threat consensus.
  - **Phase 3:** Zero-Knowledge Proofs (ZK-SNARKs) to share threat intelligence between organizations without exposing customer PII.

---

## Slide 11: Summary & Live Links
- **Header:** CyberShield AI — Turnkey Submission Ready
- **Summary Points:**
  - Fully integrated 4-member architecture combining core forensics, resilient AI, blockchain trust, and 3D UI.
  - 100% test pass rate: 444 / 444 automated tests passing.
  - Fully deployed and live on Vercel production.
- **Official Links:**
  - Live Web App: https://cybershield-ai-web-roan.vercel.app/
  - API & Swagger Docs: https://cybershield-ai-api.vercel.app/docs
  - GitHub Repository: https://github.com/Hackathon-korboo/CyberShield-AI-Scam-Analyzer-Module
- **Thank You, HackMatrix 2026 Judges & Mentors!**
