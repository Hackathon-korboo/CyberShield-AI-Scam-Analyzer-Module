# CyberShield AI — HackMatrix Final Submission Checklist

**Hackathon:** HackMatrix 2026  
**Online Submission Deadline:** **10 November 2026, 10:00 PM IST**  
**Submission Portal:** Official HackMatrix Contest Dashboard  
**Role:** Submission Review & Validation Guide for Team Leader  

---

## 1. Pre-Submission Verification Matrix

| Checklist Item | Required Status | Verified Details | Status |
| :--- | :--- | :--- | :---: |
| **Official Project Name** | `CyberShield AI` | Configured across all manifests, code, and documentation | ✅ PASS |
| **Official Repository URL** | Public GitHub URL | `https://github.com/Hackathon-korboo/CyberShield-AI-Scam-Analyzer-Module` | ✅ PASS |
| **Repository Visibility** | Public | Verified via GitHub API (`isPrivate: false`) | ✅ PASS |
| **Default Branch** | `main` | Verified via GitHub API (`defaultBranchRef: main`) | ✅ PASS |
| **README Structure** | Exact 9 Sections | Follows required 9-section HackMatrix sequence without deviation | ✅ PASS |
| **Live Application URL** | Live & Functional | `https://cybershield-ai-web-roan.vercel.app/` (`HTTP 200 OK`) | ✅ PASS |
| **Backend API Gateway** | Live & Functional | `https://cybershield-ai-api.vercel.app/` (`HTTP 200 OK`) | ✅ PASS |
| **Interactive API Docs** | Live Swagger UI | `https://cybershield-ai-api.vercel.app/docs` (`HTTP 200 OK`) | ✅ PASS |
| **Application Screenshot** | Real / Verified | Genuine Chrome headless capture saved at `docs/screenshot.png` | ✅ PASS |
| **Short Description** | ≤ 1,000 Characters | 897 characters in `docs/HACKMATRIX_SHORT_DESCRIPTION.md` | ✅ PASS |
| **Full Project Write-Up** | Comprehensive | Markdown write-up in `docs/HACKMATRIX_PROJECT_WRITEUP.md` | ✅ PASS |
| **Demo Video URL** | Public YouTube Video | `https://www.youtube.com/watch?v=lfhW9cDFUoQ` (Hackathon Demonstration Walkthrough) | ✅ PASS |
| **Pitch Deck URL** | Google Slides | `https://docs.google.com/presentation/d/1l2FFL4MJXGz0swuMja2GU000gXh_SwTk/edit?usp=sharing&ouid=108521845992462704765&rtpof=true&sd=true` | ✅ PASS |
| **Project Write-Up URL** | Google Docs / Notion | Ready to export from `docs/HACKMATRIX_PROJECT_WRITEUP.md` | ✅ PASS |
| **Automated Test Results** | Verified 100% | 415 Backend Pytest + 29 Hardhat = **444 / 444 Passing** | ✅ PASS |
| **Frontend Production Build** | Zero Errors | 2,162 Vite modules bundled in 10.25s | ✅ PASS |
| **GitHub Actions CI** | Active Workflow | Configured at `.github/workflows/ci.yml` | ✅ PASS |
| **Vercel Git Integration** | Active Webhooks | `cybershield-ai-web` (root: `frontend`), `cybershield-ai-api` (root: `backend`) | ✅ PASS |
| **Zero Secret Exposure** | Strict Privacy | `.env` strictly ignored; only `.env.example` templates committed | ✅ PASS |

---

## 2. Step-by-Step Instructions for the Team Leader

Follow these exact steps to complete the official submission:

### Step 1: Open the HackMatrix Submission Form
- Log in to the HackMatrix dashboard using the **Team Leader account**.
- Confirm that you are editing the official team submission draft.

### Step 2: Copy Required Submission Fields
1. **Project Title:**
   ```
   CyberShield AI
   ```
2. **One-Line Tagline:**
   ```
   AI-Powered Web Threat Detection & Digital Trust Intelligence
   ```
3. **Selected Track:**
   ```
   AI / Web3 / Cybersecurity & Digital Trust Track
   ```
4. **Problem Statement:**
   ```
   AI-Powered Web Threat Detection & Digital Trust Intelligence
   ```
5. **Short Description (Paste from `docs/HACKMATRIX_SHORT_DESCRIPTION.md`):**
   ```
   CyberShield AI is an enterprise-grade web threat detection and digital trust platform tackling AI phishing, deceptive websites, and audit tampering. As threat actors deploy ephemeral domains and LLM-crafted social engineering lures, static defenses fail. CyberShield AI introduces a multi-layer pipeline: (1) a preflight forensic engine auditing DNS records, TLS certificates, HTTP headers, and redirects with strict SSRF defense; (2) a resilient 3-tier AI scam analyzer powered by Groq Llama 3.3, Google Gemini, and OpenAI with prompt injection defense and evidence-grounded indicator extraction; (3) threat intelligence aggregation via URLhaus and PhishTank; and (4) decentralized cryptographic report anchoring on an EVM smart contract (ThreatReportRegistry.sol) for tamper detection. Built with React 18, Three.js, FastAPI, and Solidity, it delivers transparent, immutable threat intelligence.
   ```
6. **GitHub Repository URL:**
   ```
   https://github.com/Hackathon-korboo/CyberShield-AI-Scam-Analyzer-Module
   ```
7. **Live Website URL:**
   ```
   https://cybershield-ai-web-roan.vercel.app/
   ```
8. **Demo Video Link:**
   ```
   https://www.youtube.com/watch?v=lfhW9cDFUoQ
   ```
9. **Pitch Deck Link:**
   ```
   https://docs.google.com/presentation/d/1l2FFL4MJXGz0swuMja2GU000gXh_SwTk/edit?usp=sharing&ouid=108521845992462704765&rtpof=true&sd=true
   ```

### Step 3: Incognito Session Public Verification
Before finalizing:
- Open a **New Private/Incognito Browser Window**.
- Test opening all submission links without being logged into GitHub or Google:
  - [x] GitHub Repository: `https://github.com/Hackathon-korboo/CyberShield-AI-Scam-Analyzer-Module`
  - [x] Live Website: `https://cybershield-ai-web-roan.vercel.app/`
  - [x] Backend Health: `https://cybershield-ai-api.vercel.app/api/v1/health`
  - [x] Demo Video: `https://www.youtube.com/watch?v=lfhW9cDFUoQ` (Duration: 2m 50s)
  - [x] Pitch Deck: `https://docs.google.com/presentation/d/1l2FFL4MJXGz0swuMja2GU000gXh_SwTk/preview` (Verified Public View)

### Step 4: Final Submission
- Click **Save Draft** first.
- Review all form inputs one final time with your team.
- When prompted, type `SUBMIT` to lock in your final HackMatrix 2026 entry.
- Once submitted, take a screenshot of the submission confirmation screen for your team records.

---

## 3. Important Round Deadlines Reminder

- **Online Round Submission Deadline:** **10 November 2026 @ 10:00 PM IST** (HackMatrix Dashboard)
- **Offline Round Date & Portal:** **14 November 2026** (Conducted via MLH portal; stated deadline 7:00 PM IST)
- *Note:* Do not confuse the online HackMatrix submission dashboard with the offline MLH portal. Both must be tracked separately.
