# CyberShield AI — Unified Navigation Architecture
## Information Architecture, Routing Hierarchy, and Responsive Navigation Design

---

## 1. Information Architecture (IA) Model

CyberShield AI organizes all capabilities into a **5-Pillar Mental Model**:

```
                              CYBERSHIELD AI PLATFORM
                                         │
        ┌───────────────┬────────────────┼───────────────┬───────────────┐
        ▼               ▼                ▼               ▼               ▼
   [ OVERVIEW ]   [ INVESTIGATE ] [ INTELLIGENCE ] [ PROTECTION ]   [ REPORTS ]
   /dashboard       /scanner        /graph           /golden-hour     /history
        │               │                │               │               │
  • Product Intro  • URL / Domain   • Threat Graph  • Golden Hour    • Scan Registry
  • Unified        • Message / SMS  • Domain Intel    Center (1930)  • Report Dossier
    Launcher       • QR & UPI Code  • Community     • Financial        (/report/:id)
  • 4-Pillar Grid  • Email Auth       Threat Feed     Freeze Plan    • Cryptographic
  • Telemetry      • Defanged View  • Subgraph      • 5 Incident       SHA-256 Hash
  • Live Stream    • Forensics        Querying        Scenarios      • Web3 Ledger
```

---

## 2. Primary Navigation Route Specifications

### 1. OVERVIEW
- **Primary Route**: `/dashboard`
- **Aliases**: `/overview`
- **Icon**: `LayoutDashboard`
- **Purpose**: High-level platform command center with instant investigation launcher, 4-pillar capability grid, engine status, and recent activity.

### 2. INVESTIGATE
- **Primary Route**: `/scanner`
- **Aliases**: `/investigate`
- **Icon**: `Search` (with `#ff5500` coral accent)
- **Supported Channels**:
  - `tab=url`: SSRF-guarded URL/domain scanner
  - `tab=message`: PII-shielded AI scam message analyzer
  - `tab=qr`: Zero-outbound-payment QR & UPI forensics
  - `tab=email`: RFC 5322 & DNS SPF/DKIM/DMARC authenticator
- **Purpose**: Full-page multi-modal investigation console.

### 3. INTELLIGENCE
- **Primary Route**: `/graph`
- **Aliases**: `/intelligence`
- **Sub-Routes**:
  - `/graph`: Campaign correlation & multi-hop threat graph
  - `/domain`: RDAP domain age, CT logs & homoglyph detection
  - `/community`: Zero-PII crowdsourced threat indicators
- **Icon**: `Network` (with amber accent)
- **Purpose**: Correlates threat infrastructure and external adversary signals.

### 4. PROTECTION
- **Primary Route**: `/golden-hour`
- **Aliases**: `/protection`
- **Icon**: `PhoneCall` (with red badge: `1930`)
- **Purpose**: Emergency incident response for victims during the 1-to-3 hour golden window.

### 5. REPORTS
- **Primary Route**: `/history`
- **Aliases**: `/reports`
- **Sub-Route**: `/report/:id` (Canonical Forensic Dossier)
- **Icon**: `FileCheck`
- **Purpose**: Immutable registry of past investigations with cryptographic SHA-256 and Web3 audit verification.

### Special Routes:
- `/`: **Experience Showcase** (`Thinking Security` 3D robot interaction & design identity)
- `/settings`: **System & API Configuration** (Health metrics, provider status, API keys)

---

## 3. Deep-Linking and Cross-Pillar Interoperability

| Source | Action | Destination | Deep-Link Syntax |
| :--- | :--- | :--- | :--- |
| **Overview Launcher** | Submit Investigation | Canonical Report | `/report/:scan_id` |
| **Report Dossier** | Explore Connected Threats | Threat Graph | `/graph?scan_id=:scan_id` |
| **Report Dossier (High Risk)** | Emergency Action Plan | Golden Hour Center | `/golden-hour?scan_id=:scan_id&scenario=:type` |
| **Report Dossier (URL)** | Domain Trust Deep-Dive | Domain Intelligence | `/domain?domain=:domain` |
| **Scanner Result** | Full Audit Dossier | Canonical Report | `/report/:scan_id` |
| **Navbar Emergency Pill** | Dial 1930 | Direct Native Call | `tel:1930` |

---

## 4. Design System Tokens & WCAG 2.2 Compliance

- **Primary Background**: Warm paper-white `#efece6` (WCAG contrast > 12:1 against charcoal text).
- **Surface Cards**: Pure white `#ffffff` with stone border `#dedad2`.
- **Primary Text**: Deep charcoal `#141416` (contrast ratio 13.8:1 against `#ffffff`).
- **Muted Text**: Warm stone `#52504c` (contrast ratio 5.2:1, exceeding WCAG AA minimum 4.5:1).
- **Brand Accent**: Electric coral `#ff5500` (used for active states, CTA buttons, and key badges).
- **Emergency Accent**: Crimson `#dc2626` / `#b91c1c` (used exclusively for Golden Hour, 1930 Helpline, and Critical risk warnings).
