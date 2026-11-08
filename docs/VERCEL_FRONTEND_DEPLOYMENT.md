# CyberShield AI Version 2 — Vercel Frontend Deployment Guide

**Target Component**: React 18 + TypeScript + Vite + Three.js 3D Experience  
**Source Directory**: `D:\My Created Projects\CyberShield_AI_Version_2-main\frontend`  
**Vercel Project Name**: `cybershield-ai-web`  
**Framework Preset**: Vite  

---

## 1. Project Specifications

| Setting | Value |
| :--- | :--- |
| **Project Name** | `cybershield-ai-web` |
| **Root Directory** | `frontend/` |
| **Framework** | Vite |
| **Install Command** | `npm ci` (or `npm install`) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Node.js Version** | 18.x or 20.x |

---

## 2. Configuration Files Prepared

### 2.1 SPA Catch-All Rewrite (`frontend/vercel.json`)
Guarantees that direct browser visits to `/dashboard`, `/scanner`, `/analyzer`, `/history`, and `/settings` do not return 404 errors:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2.2 Deployment Exclusions (`frontend/.vercelignore`)
Prevents local development cache from bloating the deployment bundle:

```
node_modules
.env
.env.local
.env.*.local
.git
.vscode
dist
```

### 2.3 Production API Client (`frontend/src/services/api.ts`)
Dynamically connects to your production backend URL:

```typescript
const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || '/api/v1';

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## 3. Environment Variables for Frontend

| Variable | Required? | Example Value | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **Yes (in production)** | `https://cybershield-ai-api.vercel.app/api/v1` | Points frontend Axios requests to the deployed backend API |

> ⚠️ **Critical Security Rule**: Never add backend private keys, database passwords, or AI secrets to `VITE_*` environment variables. All `VITE_*` variables are embedded into public client-side JavaScript bundles.

---

## 4. Step-by-Step Deployment Instructions

### Step 1: Open Terminal in Frontend Directory
```powershell
cd "D:\My Created Projects\CyberShield_AI_Version_2-main\frontend"
```

### Step 2: Log In to Vercel (One-Time Setup)
```powershell
vercel login
```
*Select your preferred login method (GitHub, GitLab, or Email) and complete verification in the browser.*

### Step 3: Deploy Preview Version
```powershell
vercel
```
When prompted by Vercel CLI:
- `Set up and deploy?` → **Y**
- `Which scope do you want to deploy to?` → *(Select your account)*
- `Link to existing project?` → **N**
- `What's your project's name?` → **`cybershield-ai-web`**
- `In which directory is your code located?` → **`./`**
- `Want to modify these settings?` → **N** *(Vercel will detect Vite and use `dist`)*

### Step 4: Configure Production Environment Variable
Add the backend URL in the Vercel Dashboard under **Project Settings → Environment Variables**:
- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://<YOUR-BACKEND-PROJECT>.vercel.app/api/v1`
- **Environments**: Production, Preview, Development

### Step 5: Deploy to Production
```powershell
vercel --prod
```

---

## 5. Post-Deployment Verification Checklist

- [ ] **Homepage Load**: Ceramic 3D robot renders smoothly at 60 FPS without WebGL errors.
- [ ] **Prompt Typer Interaction**: Preset prompts cycle and submit to analyzer.
- [ ] **SPA Direct Refresh**: Refreshing on `/dashboard` or `/history` loads correctly without a 404.
- [ ] **No Localhost Requests**: Browser DevTools Network tab shows all API requests going to `VITE_API_BASE_URL`.
- [ ] **Mobile Responsiveness**: Navigation collapses cleanly on mobile viewports.
