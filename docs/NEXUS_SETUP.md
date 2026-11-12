# CyberShield Nexus — Setup, Local Run & Emergency Rollback Guide

**Document Version**: 1.0.0  
**Project**: CyberShield AI (HackMatrix 2026)  
**Authoritative Local Repository**: `D:\My Created Projects\CyberShield_AI_Version_2-main`  

---

## 1. Quick Start (Local Run)

### Backend API Server
```powershell
cd 'D:\My Created Projects\CyberShield_AI_Version_2-main'
& 'backend\venv\Scripts\uvicorn.exe' app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation & Swagger UI: `http://127.0.0.1:8000/docs`

### Frontend Application
```powershell
cd 'D:\My Created Projects\CyberShield_AI_Version_2-main\frontend'
npm run dev
```
Local Application URL: `http://localhost:5173`

---

## 2. Emergency 1-Click Rollback

If you ever wish to completely revert all Nexus innovations and restore the repository to the exact pre-Nexus baseline (`c33ef2c`), a dedicated rollback script is provided:

### Option A: Double-Click the Batch File
Run:
```
D:\My Created Projects\CyberShield_AI_Version_2-main\RESTORE_PRE_NEXUS.bat
```

### Option B: Execute via Git Command Line
```powershell
cd 'D:\My Created Projects\CyberShield_AI_Version_2-main'
git checkout main
git reset --hard backup-pre-nexus-c33ef2c
git clean -fd
```
This guarantees 100% instantaneous restoration to commit `c33ef2c` without any residual files.

---

## 3. Nexus Innovation Routes Reference

| Feature | Frontend Route | Backend REST Endpoint | Primary Capability |
| :--- | :--- | :--- | :--- |
| **Evidence Relationship Graph** | `/graph` | `GET /api/v1/nexus/graph` | Multi-hop BFS campaign correlation (Solid vs Dashed edges) |
| **Golden Hour Response** | `/golden-hour` | `POST /api/v1/nexus/golden-hour/generate` | 1-to-3 hour emergency guidance & 1930 Helpline integration |
| **QR Code & UPI Forensics** | `/qr` | `POST /api/v1/nexus/qr/analyze` | NPCI parameter extraction & scan-to-receive fraud alert |
| **Email Authentication** | `/email` | `POST /api/v1/nexus/email/authenticate` | SPF/DKIM/DMARC DNS checks & From/Reply-To alignment |
| **Domain & Brand Intel** | `/domain` | `POST /api/v1/nexus/domain/intel` | RDAP age, CT logs, homoglyph & typosquatting detection |
| **Community Threat Feed** | `/community` | `GET /api/v1/nexus/community/feed` | Zero-PII crowdsourced threat indicator feed |
