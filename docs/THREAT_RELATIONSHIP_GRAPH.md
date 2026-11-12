# CyberShield Nexus — Threat Relationship Intelligence Graph

**Document Version**: 1.0.0  
**Module**: `app.services.nexus.graph_service`  
**API Endpoint**: `GET /api/v1/nexus/graph`  

---

## 1. Overview & Objective

Individual scam incidents often appear isolated when viewed in silos. In reality, modern cybercrime syndicates recycle infrastructure across campaigns:
- Multiple deceptive domains host on the same bulletproof IP address.
- Multiple phishing SMS campaigns direct victims to the same scam UPI VPA or call-center phone number.
- Typosquat domains impersonate the same institutional brand.

The **Evidence Relationship Intelligence Graph** correlates every investigated target against historical threat entities to expose interconnected campaigns.

---

## 2. Entity Model Schema

| Entity Type | Description | Normalization Rule | Example |
| :--- | :--- | :--- | :--- |
| `url` | Submitted target web link | Normalized scheme, stripped trailing slash | `https://sbi-login.xyz/auth` |
| `domain` | Extracted or entered domain | Lowercased hostname, port stripped | `sbi-login.xyz` |
| `ip` | Resolved IP address from DNS | Standard IPv4/IPv6 notation | `198.51.100.42` |
| `phone` | Extracted contact telephone | Digits only (E.164 / 10-digit Indian) | `919876543210` |
| `email` | Extracted email address | Lowercased standard format | `support@scam-portal.xyz` |
| `upi` | Extracted UPI payment identifier | Lowercase VPA handle | `fraudster@okhdfcbank` |
| `brand` | Targeted institution | Monitored registry key | `sbi`, `paytm`, `phonepe` |
| `scan` | Root investigation node | Scan UUID | `scan_8f9c1b2e` |

---

## 3. Relationship Types & Mathematical Verification

| Relationship Type | Verified Status | Edge Representation | Criteria |
| :--- | :--- | :--- | :--- |
| `EXACT_DOMAIN_MATCH` | **Verified** | **Solid Green Edge** | Exact shared registered domain across multiple URLs or scans. |
| `SAME_IP` | **Verified** | **Solid Green Edge** | Authoritative DNS resolution yielded the exact same hosting IP address. |
| `SAME_PHONE` | **Verified** | **Solid Green Edge** | Exact matching contact phone number identified across multiple scam messages. |
| `SAME_UPI_ID` | **Verified** | **Solid Green Edge** | Identical UPI beneficiary VPA targeted across different fraudulent campaigns. |
| `SAME_EMAIL` | **Verified** | **Solid Green Edge** | Identical email address used in From or Reply-To headers. |
| `SAME_BRAND_IMPERSONATION` | **Inferred** | **Dashed Amber Edge** | Heuristic or algorithmic detection indicates mimicry of the same brand. |
| `SIMILAR_MESSAGE_PATTERN` | **Inferred** | **Dashed Amber Edge** | Shared social engineering pretext (e.g. Electricity bill disconnect lure). |

> **Ethical & Forensic Rule**: Inferred relationships are explicitly marked as heuristic correlations. CyberShield AI never asserts criminal attribution based on inferred linkages.
