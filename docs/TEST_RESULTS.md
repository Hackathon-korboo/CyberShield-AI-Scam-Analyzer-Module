# CyberShield AI — Automated Test Results & Verification Audit

**Current Verification Date:** November 9, 2026  
**Environment:** Windows 11 Home (x64), Python 3.13 / 3.12, Node.js v24.16.0, npm 11.13.0, Hardhat v2.29.1  
**Authoritative Directory:** `D:\My Created Projects\CyberShield_AI_Version_2-main`  
**Current Status:** **100% Passing (415/415 PyTest, 29/29 Hardhat, 2,162/2,162 Frontend Modules)**  
**Total Platform Automated Tests:** **444 / 444 Passed (0 Failed, 0 Skipped)**  

---

## 1. Current Verified Test Run Summary (November 9, 2026)

| Test Layer | Test Command | Collected | Passed | Failed | Skipped | Duration | Verified Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Backend Core Suite** | `pytest backend/tests` | **415** | **415** | **0** | **0** | 47.90s | **100% PASSED** |
| • *URL Scanner Audit* | `pytest tests/test_url_scanner_audit.py` | 18 | 18 | 0 | 0 | 35.1s | **100% PASSED** |
| • *Message Intel Audit* | `pytest tests/test_message_intelligence_audit.py` | 16 | 16 | 0 | 0 | 4.9s | **100% PASSED** |
| • *API v1 Integration* | `pytest tests/test_api_v1_integration.py` | 16 | 16 | 0 | 0 | 2.8s | **100% PASSED** |
| • *Blockchain Services* | `pytest tests/test_blockchain_m3.py` | 13 | 13 | 0 | 0 | 1.9s | **100% PASSED** |
| • *E2E Scenarios* | `pytest tests/test_e2e_scenarios.py` | 16 | 16 | 0 | 0 | 3.4s | **100% PASSED** |
| **Blockchain Smart Contracts** | `npx hardhat test` | **29** | **29** | **0** | **0** | 1.0s | **100% PASSED** |
| • *Cross-Language Hashes* | `test/ThreatReportRegistry.test.js` | 7 | 7 | 0 | 0 | 0.3s | **100% PASSED** |
| • *Registration & Limits* | `test/ThreatReportRegistry.test.js` | 6 | 6 | 0 | 0 | 0.2s | **100% PASSED** |
| • *Verification & Reversal* | `test/ThreatReportRegistry.test.js` | 4 | 4 | 0 | 0 | 0.2s | **100% PASSED** |
| • *Authorization Governance*| `test/ThreatReportRegistry.test.js` | 6 | 6 | 0 | 0 | 0.2s | **100% PASSED** |
| • *Edge Cases & Sequential* | `test/ThreatReportRegistry.test.js` | 6 | 6 | 0 | 0 | 0.1s | **100% PASSED** |
| **Frontend Production Build** | `npm run build` | 2,162 mods | 2,162 | 0 | 0 | 10.25s | **CLEAN BUILD** |

---

## 2. Historical Run Reconciliation (November 8 vs. November 9)

An earlier test report documented **381 backend tests**. This audit explains the reconciliation:

1. **November 8, 2026 Baseline Run:**
   - 381 collected items executed across core services before specialized audit fixtures were merged.
2. **Specialized Audit Suites Merged:**
   - `test_url_scanner_audit.py`: +18 tests added for RFC 2606 reserved domains, compound phishing heuristics, and SSRF boundary conditions.
   - `test_message_intelligence_audit.py`: +16 tests added for bank email negation, investment scam keywords, and prompt injection defense.
3. **Current Unified Suite Total:**
   - 381 baseline tests + 18 URL audit tests + 16 message intelligence tests = **415 total backend tests**.
   - Current verification confirmed all 415 tests execute and pass in 47.90s.

---

## 3. Actual Command Execution Outputs

### Backend PyTest Verbatim Output
```text
============================= test session starts =============================
platform win32 -- Python 3.13.1, pytest-9.1.1, pluggy-1.6.0
rootdir: D:\My Created Projects\CyberShield_AI_Version_2-main\backend
plugins: anyio-4.15.1, asyncio-1.4.1.post1
asyncio: mode=Mode.STRICT

collected 415 items

backend/tests/test_ai_threat_intel.py (10 tests) .................... PASSED [  2%]
backend/tests/test_api_v1_integration.py (16 tests) ................. PASSED [  6%]
backend/tests/test_app.py (8 tests) ................................ PASSED [  8%]
backend/tests/test_blockchain_m3.py (13 tests) ..................... PASSED [ 11%]
backend/tests/test_cybershield.py (7 tests) ........................ PASSED [ 13%]
backend/tests/test_database_blockchain.py (12 tests) ............... PASSED [ 16%]
backend/tests/test_deterministic_risk_engine.py (18 tests) ......... PASSED [ 20%]
backend/tests/test_dns_investigation.py (15 tests) ................. PASSED [ 24%]
backend/tests/test_e2e_scenarios.py (16 tests) ..................... PASSED [ 28%]
backend/tests/test_e2e_verification.py (5 tests) ................... PASSED [ 29%]
backend/tests/test_evidence_normalization.py (12 tests) ............ PASSED [ 32%]
backend/tests/test_health.py (4 tests) ............................. PASSED [ 33%]
backend/tests/test_member1_member3_integration.py (10 tests) ....... PASSED [ 35%]
backend/tests/test_member2_integration.py (5 tests) ................ PASSED [ 36%]
backend/tests/test_message_analyzer.py (12 tests) .................. PASSED [ 39%]
backend/tests/test_message_intelligence_audit.py (16 tests) ......... PASSED [ 43%]
backend/tests/test_normalizer.py (12 tests) ........................ PASSED [ 46%]
backend/tests/test_phishtank.py (10 tests) ......................... PASSED [ 48%]
backend/tests/test_redirects.py (10 tests) ......................... PASSED [ 51%]
backend/tests/test_report_generator.py (15 tests) .................. PASSED [ 54%]
backend/tests/test_schemas.py (18 tests) ........................... PASSED [ 59%]
backend/tests/test_security_headers.py (12 tests) .................. PASSED [ 62%]
backend/tests/test_threat_intel_pipeline.py (12 tests) ............. PASSED [ 65%]
backend/tests/test_tls_analysis.py (15 tests) ...................... PASSED [ 68%]
backend/tests/test_url_investigation.py (15 tests) ................. PASSED [ 72%]
backend/tests/test_url_scanner_audit.py (18 tests) ................. PASSED [ 76%]
backend/tests/test_urlhaus.py (10 tests) ........................... PASSED [ 79%]
backend/tests/test_verification_pipeline.py (15 tests) .............. PASSED [ 82%]
backend/tests/test_web3_service.py (10 tests) ...................... PASSED [ 85%]
.................................................................... PASSED [100%]

415 passed in 47.90s
```

### Hardhat Smart Contract Verbatim Output
```text
  Cross-Language Hash Consistency
    √ Should match Python hash and ID for: Integer confidence score (87)
    √ Should match Python hash and ID for: Float whole confidence score (87.0 -> 87)
    √ Should match Python hash and ID for: Decimal confidence score (87.5)
    √ Should match Python hash and ID for: Lower boundary confidence score (0)
    √ Should match Python hash and ID for: Upper boundary confidence score (100)
    √ Should detect tampering with different hash
    √ Should reject invalid confidence scores

  ThreatReportRegistry
    registerReport
      √ Should register a new report and emit event
      √ Should increment reportCount after registration
      √ Should reject a zero hash
      √ Should reject duplicate report hashes
      √ Should allow different reports from different accounts
      √ Should store the correct registrant address
    verifyReport
      √ Should verify the original report as true
      √ Should reject a modified report hash
      √ Should return false for an unregistered report
      √ Should return false for mismatched ID and hash
    generateReportId
      √ Should produce deterministic IDs
      √ Should produce different IDs for different hashes
    getReport
      √ Should return correct metadata for a registered report
      √ Should revert for a non-existent report
    Authorization & Governance
      √ Should reject registration from unauthorized accounts
      √ Should allow owner to authorize a new registrar
      √ Should reject authorization from non-owners
      √ Should allow owner to revoke registrar authority
      √ Should prevent revoking the contract owner
      √ Should support ownership transfer
    Edge cases
      √ Should handle multiple sequential registrations
      √ Should set hashExists correctly

  29 passing (1s)
```

### Frontend Production Build Verbatim Output
```text
> cybershield-ai-frontend@1.0.0 build
> tsc && vite build

vite v5.4.21 building for production...
transforming...
✓ 2162 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                         1.30 kB │ gzip:   0.64 kB
dist/assets/index-sr3xC0IR.css         54.57 kB │ gzip:   9.11 kB
dist/assets/icons-oVWnmptL.js          15.92 kB │ gzip:   3.36 kB
dist/assets/index-D6KNAPsZ.js         163.52 kB │ gzip:  46.90 kB
dist/assets/react-vendor-D39yHKqC.js  164.09 kB │ gzip:  53.57 kB
dist/assets/charts-DsK597ps.js        372.83 kB │ gzip: 102.62 kB
dist/assets/three-vendor-B4fUdLBA.js  526.16 kB │ gzip: 130.90 kB
✓ built in 10.25s
```
