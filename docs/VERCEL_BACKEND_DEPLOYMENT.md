# CyberShield AI Version 2 — Vercel Backend Deployment Guide

**Target Component**: FastAPI Master REST API  
**Source Directory**: `D:\My Created Projects\CyberShield_AI_Version_2-main\backend`  
**Vercel Project Name**: `cybershield-ai-api`  
**Runtime**: Python Serverless (`@vercel/python`)  
**Entrypoint**: `api/index.py` (ASGI application factory)  

---

## 1. Project Specifications

| Setting | Value |
| :--- | :--- |
| **Project Name** | `cybershield-ai-api` |
| **Root Directory** | `backend/` |
| **Runtime** | Python 3.12 / 3.11 / 3.10 |
| **Serverless Entrypoint** | `api/index.py` |
| **Package Manifest** | `requirements.txt` |
| **Max Function Execution Duration** | Default 15s (Hobby) / up to 60s (Pro) |

---

## 2. Configuration Files Prepared

### 2.1 Serverless Rewrite Router (`backend/vercel.json`)
Routes all incoming HTTP requests to the FastAPI ASGI handler:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index.py"
    }
  ]
}
```

### 2.2 Serverless ASGI Adapter (`backend/api/index.py`)
Dynamically resolves application packages and exports the instantiated FastAPI app:

```python
"""Vercel Serverless Function entrypoint for CyberShield AI FastAPI Backend."""
import sys
from pathlib import Path

# Add backend directory to sys.path so that 'app' module resolves seamlessly
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

__all__ = ["app"]
```

### 2.3 Deployment Exclusions (`backend/.vercelignore`)
Keeps local Python virtual environments, test suites, and SQLite files out of the serverless image:

```
venv/
.venv/
__pycache__/
.pytest_cache/
tests/
*.db
*.sqlite
*.sqlite3
.env
.env.local
.git/
```

---

## 3. Database Architecture for Production

### Persistent Managed PostgreSQL
In a serverless environment like Vercel, serverless function containers are ephemeral (spun up and shut down on demand). Local SQLite `.db` files written inside a serverless container do not persist across requests.

For full persistence of scan history and cryptographic reports, configure a managed cloud PostgreSQL database:
- **Recommended Free-Tier Providers**:
  - [Neon.tech](https://neon.tech/) (Serverless Postgres with native connection pooling)
  - [Supabase](https://supabase.com/) (Managed PostgreSQL)
  - [Tembo](https://tembo.io/) or AWS RDS
- **Connection String Format**:  
  `DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>?sslmode=require`

### Connection Pooling & Resiliency
`backend/app/database/session.py` has been specifically hardened for serverless operation:
- Automatically replaces legacy `postgres://` prefixes with `postgresql://`.
- Injects `pool_pre_ping=True` to immediately detect dropped or recycled connections.
- Sets `pool_recycle=300` (5 minutes) to avoid stale socket errors in AWS/Vercel serverless containers.
- Safely recovers from transient initialization failures without crashing the application.

---

## 4. Step-by-Step Deployment Instructions

### Step 1: Open Terminal in Backend Directory
```powershell
cd "D:\My Created Projects\CyberShield_AI_Version_2-main\backend"
```

### Step 2: Deploy Preview Version
```powershell
vercel
```
When prompted by Vercel CLI:
- `Set up and deploy?` → **Y**
- `Which scope do you want to deploy to?` → *(Select your account)*
- `Link to existing project?` → **N**
- `What's your project's name?` → **`cybershield-ai-api`**
- `In which directory is your code located?` → **`./`**
- `Want to modify these settings?` → **N**

### Step 3: Configure Environment Variables in Vercel Dashboard
In the Vercel Dashboard under **Project Settings → Environment Variables**, add the required backend variables (see [`docs/VERCEL_ENVIRONMENT_SETUP.md`](VERCEL_ENVIRONMENT_SETUP.md)):
- `ENVIRONMENT=production`
- `DEBUG=false`
- `CORS_ORIGINS=https://cybershield-ai-web.vercel.app`
- `DATABASE_URL=postgresql://...`
- `GROQ_API_KEY=...`
- `GEMINI_API_KEY=...`
- `OPENAI_API_KEY=...`

### Step 4: Deploy to Production
```powershell
vercel --prod
```

---

## 5. Live Endpoint Verification Table

Once deployed, verify that the following endpoints return valid responses:

| Endpoint | HTTP Method | Expected Status | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/v1/health` | `GET` | `200 OK` | Liveness check with database and uptime status |
| `/api/v1/system/status` | `GET` | `200 OK` | Diagnostic status of all AI and threat providers |
| `/api/v1/scans/url` | `POST` | `200 OK` | Full technical URL pre-flight, DNS, and TLS analysis |
| `/api/v1/scans/message` | `POST` | `200 OK` | Master message analysis with AI failover and indicator extraction |
| `/api/v1/scans` | `GET` | `200 OK` | Paginated investigation history |
| `/api/v1/reports/{id}` | `GET` | `200 OK` | Off-chain JSON forensic report retrieval |
| `/api/v1/reports/{id}/verify` | `POST` | `200 OK` | Canonical hash tamper-detection verification |
| `/api/v1/analyze-message` | `POST` | `200 OK` | Member 2 backward-compatible microservice route |
| `/api/v1/stats` | `GET` | `200 OK` | Real-time threat and scan counters for dashboard |
