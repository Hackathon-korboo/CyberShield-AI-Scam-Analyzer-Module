# CyberShield AI — Vercel & GitHub Auto-Deployment Architecture Report

**Report Date:** 2026-11-09  
**Platform:** Vercel Global Edge & Fluid Compute  
**Official GitHub Repository:** [https://github.com/Hackathon-korboo/CyberShield-AI-Scam-Analyzer-Module](https://github.com/Hackathon-korboo/CyberShield-AI-Scam-Analyzer-Module)  
**Primary Organization / Scope:** `souvik-s-projects4`  

---

## 1. Production Deployment Overview

CyberShield AI is configured as a dual-project architecture on Vercel:

| Service Layer | Vercel Project Name | Root Directory | Framework Preset | Production URL | GitHub Auto-Deploy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend Web UI** | `cybershield-ai-web` | `frontend` | Vite | **[cybershield-ai-web-roan.vercel.app](https://cybershield-ai-web-roan.vercel.app)** | **CONNECTED & ACTIVE** |
| **FastAPI Backend** | `cybershield-ai-api` | `backend` | FastAPI | **[cybershield-ai-api.vercel.app](https://cybershield-ai-api.vercel.app)** | **CONNECTED & ACTIVE** |

---

## 2. GitHub Continuous Deployment Configuration

Both projects are connected directly to the official HackMatrix repository via the Vercel Git integration:

### Frontend Project: `cybershield-ai-web`
- **Project ID:** `prj_3RJ3RDtlcj4Cqp0jviflTU3nWUnB`
- **Connected Repository:** `https://github.com/Hackathon-korboo/CyberShield-AI-Scam-Analyzer-Module`
- **Production Branch:** `main`
- **Root Directory:** `frontend`
- **Output Directory:** `dist`
- **Build Command:** `npm run build` (`tsc && vite build`)
- **Install Command:** `npm install`
- **Environment Variables:**
  - `VITE_API_BASE_URL` = `https://cybershield-ai-api.vercel.app/api/v1` (Production, Preview, Development)

### Backend Project: `cybershield-ai-api`
- **Project ID:** `prj_3bD2Oyk7hBm9Ub7qqcXfgpsxcNf0`
- **Connected Repository:** `https://github.com/Hackathon-korboo/CyberShield-AI-Scam-Analyzer-Module`
- **Production Branch:** `main`
- **Root Directory:** `backend`
- **Framework Preset:** `FastAPI` (Zero-configuration native routing)
- **Install Command:** `pip install -r requirements.txt`
- **Environment Variables (Stored in Vercel Secret Vault):**
  - `ENVIRONMENT` = `production`
  - `DEBUG` = `false`
  - `CORS_ORIGINS` = `https://cybershield-ai-web-roan.vercel.app,https://cybershield-ai-web.vercel.app,http://localhost:5173,http://127.0.0.1:5173`
  - `AI_PROVIDER` = `groq`
  - `GROQ_API_KEY` = `[Active Production Secret]`
  - `GEMINI_API_KEY` = `[Active Production Secret]`
  - `OPENAI_API_KEY` = `[Active Production Secret]`
  - `GROQ_MODEL` = `llama-3.3-70b-versatile`
  - `GEMINI_MODEL` = `gemini-1.5-flash`
  - `OPENAI_MODEL` = `gpt-4o-mini`

---

## 3. Auto-Deployment Trigger Matrix

- **Push to `main` Branch:**
  - Automatically triggers parallel production builds for both `cybershield-ai-web` and `cybershield-ai-api`.
  - Seamlessly updates `https://cybershield-ai-web-roan.vercel.app` and `https://cybershield-ai-api.vercel.app`.
- **Push to Feature Branches (e.g. `feature/member-2-ai-scam-analyzer`):**
  - Triggers isolated preview deployments with unique URLs (e.g., `https://cybershield-ai-web-git-*.vercel.app`) for smoke testing.
- **Pull Requests:**
  - Generates preview deployment comments directly in GitHub pull requests.

---

## 4. Manual Verification & Dashboard Confirmation

To view deployment progress and build logs in the web interface:
1. Navigate to [Vercel Dashboard](https://vercel.com/souvik-s-projects4).
2. Click on **`cybershield-ai-web`** or **`cybershield-ai-api`**.
3. Under the **Deployments** tab, verified builds will show the Git commit message and hash linked to `Hackathon-korboo/CyberShield-AI-Scam-Analyzer-Module`.
