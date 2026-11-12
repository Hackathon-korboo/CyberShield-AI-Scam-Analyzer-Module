# CyberShield Nexus — Domain & Brand Trust Intelligence

**Document Version**: 1.0.0  
**Module**: `app.services.nexus.domain_intelligence`  
**API Endpoint**: `POST /api/v1/nexus/domain/intel`  

---

## 1. Multi-Signal Domain Investigation

CyberShield Nexus evaluates target web destinations across three complementary pillars:

```
+-------------------------------------------------------------------------------+
|                       DOMAIN TRUST INTELLIGENCE                               |
|                                                                               |
|   +---------------------+   +---------------------+   +-------------------+   |
|   |   RDAP REGISTRATION |   |  CERTIFICATE LOGS   |   |   BRAND MIMICRY   |   |
|   |   - Registration Age|   |  - Historical Issuance | - Homoglyph Punycode |   |
|   |   - Creation Date   |   |  - Active Subdomains|   | - Subdomain Tricks|   |
|   |   - Registrar Name  |   |  - CA Trust Chain   |   | - Keyword Affixes |   |
|   +---------------------+   +---------------------+   +-------------------+   |
+-------------------------------------------------------------------------------+
```

---

## 2. Pillar Breakdown

### 2.1 RDAP Domain Intelligence
- Queries the authoritative public Registration Data Access Protocol (RDAP) directory via `https://rdap.org/domain/<domain>`.
- Calculates domain age in days.
- **Newly Registered Flag**: Domains registered within the past 30 days receive an elevated suspicion indicator because newly minted domains account for a disproportionate share of disposable phishing campaigns.
- **Fairness Guarantee**: A newly registered domain alone is treated as one evidence signal, never as conclusive proof of fraud.

### 2.2 Certificate Transparency (CT) Log Auditing
- Queries public Certificate Transparency databases (`crt.sh`) with strict 2.5s timeouts.
- Analyzes historical certificate issuance count and observed subdomains.
- Detects rapid certificate re-issuance from untrusted or disposable certificate authorities.

### 2.3 Brand Impersonation & Homoglyph Engine
- Monitored Brand Registry: Financial institutions (**SBI**, **HDFC**, **ICICI**, **Paytm**, **PhonePe**, **PayPal**) and technology platforms (**Google**, **Microsoft**, **Amazon**, **Apple**, **Netflix**).
- **Homoglyph Detection**: Detects Cyrillic and Greek lookalike character substitutions (`а` for `a`, `о` for `o`, `р` for `p`, `с` for `c`).
- **Punycode / IDN**: Identifies `xn--...` internationalized domain names attempting deceptive visual mimicry.
- **Subdomain Deception**: Flags domains structured as `brand.official.domain.attacker-host.xyz`.
