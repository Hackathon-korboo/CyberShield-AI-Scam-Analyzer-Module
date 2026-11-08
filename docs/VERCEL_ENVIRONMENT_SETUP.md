# CyberShield AI Version 2 — Vercel Environment Variables Setup Guide

**Purpose**: Comprehensive reference and onboarding guide for configuring production environment variables across both Vercel projects (`cybershield-ai-api` and `cybershield-ai-web`).

> 🛡️ **Zero-Credential Exposure Rule**:  
> Sensitive credentials (API keys, database passwords, private keys) must **NEVER** be committed to Git or pasted into public logs. Enter them directly into the encrypted **Environment Variables** tab of each project in the [Vercel Dashboard](https://vercel.com/dashboard).

---

## 1. Project 1: Backend Environment Variables (`cybershield-ai-api`)

Configure these variables in **Vercel Dashboard → `cybershield-ai-api` → Settings → Environment Variables**:

### 1.1 Core Application Configuration
| Variable Name | Mandatory? | Recommended Value | Description & Purpose |
| :--- | :---: | :--- | :--- |
| `ENVIRONMENT` | **Yes** | `production` | Sets application mode, disabling verbose debug traces |
| `DEBUG` | **Yes** | `false` | Disables FastAPI debug mode for OWASP compliance |
| `PORT` | Optional | `8000` | Port allocation handled automatically by Vercel serverless |
| `LOG_LEVEL` | Optional | `INFO` | Application log output verbosity |
| `CORS_ORIGINS` | **Yes** | `https://cybershield-ai-web.vercel.app` | Comma-separated list of allowed frontend origins (No wildcards) |

---

### 1.2 Persistent Production Database
| Variable Name | Mandatory? | Format & Registration Link | Purpose |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes (Prod)** | `postgresql://user:pass@host/db?sslmode=require`<br>• Free serverless Postgres: [Neon.tech](https://neon.tech/)<br>• Managed Postgres: [Supabase.com](https://supabase.com/) | Persistent relational storage for scan history, threat intelligence, and canonical reports |

*Note: If omitted during local development, CyberShield AI automatically falls back to local SQLite (`sqlite:///./cybershield.db`). For persistent Vercel production hosting, PostgreSQL is required.*

---

### 1.3 AI Scam Analysis Engine (Member 2 Failover Hierarchy)
CyberShield AI employs an intelligent **3-tier cloud failover hierarchy** to guarantee zero downtime:

| Variable Name | Tier | Provider Link & Model | Mandatory? |
| :--- | :--- | :--- | :---: |
| `GROQ_API_KEY` | **Primary Engine** | [Groq Cloud Console](https://console.groq.com/keys)<br>Model: `openai/gpt-oss-120b` | Recommended (Free & Ultra Fast) |
| `GEMINI_API_KEY` | **Backup Engine 1** | [Google AI Studio](https://aistudio.google.com/app/apikey)<br>Model: `gemini-1.5-flash` | Recommended (Free Tier Available) |
| `OPENAI_API_KEY` | **Backup Engine 2** | [OpenAI API Keys](https://platform.openai.com/api-keys)<br>Model: `gpt-4o-mini` | Optional |
| `AI_PROVIDER` | Selector | `groq` | Optional (Defaults to `groq`) |

> 💡 **Offline Fallback Guarantee**: If all external AI API keys are omitted or rate-limited, CyberShield AI automatically switches to its internal **deterministic offline heuristic engine**. The platform never crashes when keys are unavailable.

---

### 1.4 External Threat Intelligence Providers (Member 1 & Member 4)
| Variable Name | Provider | Registration Link | Mandatory? |
| :--- | :--- | :--- | :---: |
| `URLHAUS_API_KEY` | abuse.ch URLhaus | [URLhaus API Registration](https://urlhaus.abuse.ch/api/) | Optional (Public feed active) |
| `PHISHTANK_API_KEY` | Cisco Talos PhishTank | [PhishTank Developer Info](https://phishtank.org/developer_info.php) | Optional |

---

### 1.5 Blockchain & Cryptographic Verification (Member 3)
| Variable Name | Mode | Example Value / Provider | Mandatory? |
| :--- | :--- | :--- | :---: |
| `BLOCKCHAIN_RPC_URL` | Public Testnet | `https://sepolia.infura.io/v3/<KEY>` ([Infura](https://infura.io) / [Alchemy](https://alchemy.com)) | Optional |
| `REGISTRY_CONTRACT_ADDRESS` | Public Testnet | Deployed `ThreatReportRegistry` contract address | Optional |
| `REGISTRAR_PRIVATE_KEY` | Public Testnet | Dedicated test wallet private key (Sepolia ETH funded) | Optional |
| `CHAIN_ID` | Public Testnet | `11155111` (Sepolia) or `80002` (Polygon Amoy) | Optional |

> ⚠️ **Simulation Mode Notice**: When `BLOCKCHAIN_RPC_URL` is omitted, CyberShield AI activates **Deterministic Cryptographic Simulation Mode**. It computes the exact RFC 8785 canonical SHA-256 hash and generates a simulated proof labeled as `SIMULATION MODE`. Real mainnet gas funds and private keys are never required for operation.

---

## 2. Project 2: Frontend Environment Variables (`cybershield-ai-web`)

Configure this variable in **Vercel Dashboard → `cybershield-ai-web` → Settings → Environment Variables**:

| Variable Name | Mandatory? | Example Value | Purpose |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes** | `https://cybershield-ai-api.vercel.app/api/v1` | Points frontend API client to the production backend REST endpoints |

---

## 3. Local Environment File Mapping (`API.env`)

For local execution, the pre-configured keys in `D:\My Created Projects\CyberShield_AI_Version_2-main\API.env` provide live connectivity to Groq, Gemini, and OpenAI. To use them locally:
```powershell
# Copy local keys to root .env
Copy-Item "API.env" ".env"
```
*(Remember: `.env` is permanently gitignored and excluded from Vercel deployments via `.vercelignore`.)*
