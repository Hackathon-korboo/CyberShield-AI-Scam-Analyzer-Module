"""CyberShield Nexus — Domain & Brand Trust Intelligence (Core Innovation 5)

Performs comprehensive domain registration provenance (RDAP), public Certificate
Transparency log auditing (crt.sh), and algorithmic brand impersonation/homograph detection.

Guarantees:
- Newly registered domain is weighted as one evidence signal, not absolute proof of fraud.
- Robust timeout handling (2.5s max) with non-blocking graceful fallbacks.
- Identifies homoglyph/punycode spoofing targeting monitored brands.
"""

import asyncio
import re
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from urllib.parse import urlparse
import httpx
from pydantic import BaseModel, Field


class RDAPMetadata(BaseModel):
    """Domain registration lifecycle from public RDAP directory."""
    domain: str
    status: str  # 'COMPLETED', 'UNAVAILABLE', 'RATE_LIMITED', 'ERROR'
    creation_date: Optional[str] = None
    expiration_date: Optional[str] = None
    updated_date: Optional[str] = None
    registrar: Optional[str] = None
    nameservers: List[str] = Field(default_factory=list)
    age_days: Optional[int] = None
    is_newly_registered: bool = False  # < 30 days old


class CertificateTransparencyAudit(BaseModel):
    """Historical certificate issuance records from CT logs."""
    domain: str
    status: str  # 'COMPLETED', 'UNAVAILABLE', 'TIMEOUT', 'ERROR'
    certificate_count: int = 0
    issuers: List[str] = Field(default_factory=list)
    observed_subdomains: List[str] = Field(default_factory=list)
    first_seen: Optional[str] = None
    last_seen: Optional[str] = None


class BrandImpersonationFinding(BaseModel):
    """Brand mimicry or homoglyph detection."""
    brand_name: str
    impersonation_type: str  # 'HOMOGLYPH_PUNYCODE', 'SUBDOMAIN_TRICK', 'TYPOSQUAT_KEYWORD', 'EXACT_AFFIX'
    suspect_token: str
    official_domain: str
    confidence: int  # 0 - 100
    description: str


class DomainIntelligenceResult(BaseModel):
    """Unified domain trust intelligence package."""
    domain: str
    rdap: RDAPMetadata
    certificate_transparency: CertificateTransparencyAudit
    brand_findings: List[BrandImpersonationFinding] = Field(default_factory=list)
    risk_level: str  # 'Critical', 'High', 'Medium', 'Low', 'Benign'
    risk_score: int  # 0 - 100
    warning_signals: List[str] = Field(default_factory=list)
    evidence: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


class DomainIntelligenceService:
    """Orchestrates parallel RDAP lookups, CT log queries, and brand analysis."""

    # Monitored institutional and financial brands
    BRAND_REGISTRY = {
        "sbi": {"official_domains": ["sbi.co.in", "onlinesbi.sbi", "statebankofindia.com"], "category": "Banking"},
        "hdfc": {"official_domains": ["hdfcbank.com", "hdfc.com"], "category": "Banking"},
        "icici": {"official_domains": ["icicibank.com"], "category": "Banking"},
        "paytm": {"official_domains": ["paytm.com", "paytmbank.com"], "category": "Fintech"},
        "phonepe": {"official_domains": ["phonepe.com"], "category": "Fintech"},
        "google": {"official_domains": ["google.com", "google.co.in", "accounts.google.com"], "category": "Technology"},
        "microsoft": {"official_domains": ["microsoft.com", "login.microsoftonline.com", "live.com"], "category": "Technology"},
        "amazon": {"official_domains": ["amazon.com", "amazon.in"], "category": "E-Commerce"},
        "apple": {"official_domains": ["apple.com", "icloud.com"], "category": "Technology"},
        "netflix": {"official_domains": ["netflix.com"], "category": "Streaming"},
        "paypal": {"official_domains": ["paypal.com"], "category": "Fintech"},
    }

    # Cyrillic / Greek confusable lookalikes
    HOMOGLYPH_MAP = {
        'а': 'a', 'с': 'c', 'е': 'e', 'о': 'o', 'р': 'p', 'х': 'x', 'у': 'y',
        'і': 'i', 'ј': 'j', 'ѕ': 's', 'ԁ': 'd', 'ԛ': 'q', 'ԝ': 'w'
    }

    @classmethod
    async def investigate_domain(cls, domain_or_url: str) -> DomainIntelligenceResult:
        """Runs parallel RDAP, Certificate Transparency, and Brand checks."""
        # Clean domain
        parsed = urlparse(domain_or_url if "://" in domain_or_url else f"http://{domain_or_url}")
        domain = (parsed.hostname or domain_or_url).strip().lower()
        if ":" in domain:
            domain = domain.split(":")[0]

        # Execute RDAP and CT queries concurrently with strict timeouts
        rdap_task = cls._query_rdap(domain)
        ct_task = cls._query_ct_logs(domain)

        rdap_res, ct_res = await asyncio.gather(rdap_task, ct_task, return_exceptions=True)

        if isinstance(rdap_res, Exception) or not isinstance(rdap_res, RDAPMetadata):
            rdap_res = RDAPMetadata(domain=domain, status="UNAVAILABLE")

        if isinstance(ct_res, Exception) or not isinstance(ct_res, CertificateTransparencyAudit):
            ct_res = CertificateTransparencyAudit(domain=domain, status="UNAVAILABLE")

        # Synchronous brand checks
        brand_findings = cls._check_brand_impersonation(domain)

        # Synthesize score and findings
        risk_score = 0
        warning_signals: List[str] = []
        evidence: List[str] = []

        # 1. Evaluate Domain Age
        if rdap_res.status == "COMPLETED" and rdap_res.age_days is not None:
            evidence.append(f"Domain Registered: {rdap_res.creation_date} (Age: {rdap_res.age_days} days).")
            if rdap_res.registrar:
                evidence.append(f"Authoritative Registrar: {rdap_res.registrar}.")
            if rdap_res.is_newly_registered:
                warning_signals.append(f"Newly Registered Domain: Created only {rdap_res.age_days} days ago. High frequency in disposable phishing campaigns.")
                risk_score += 30
            elif rdap_res.age_days > 730:
                evidence.append("Established Domain: Active for over 2 years.")
        else:
            evidence.append(f"RDAP Status: {rdap_res.status} (Public directory query timed out or unindexed).")

        # 2. Evaluate Certificate Transparency
        if ct_res.status == "COMPLETED":
            evidence.append(f"Certificate Transparency: {ct_res.certificate_count} historical certificates indexed.")
            if ct_res.observed_subdomains:
                evidence.append(f"Observed Subdomains ({len(ct_res.observed_subdomains)}): {', '.join(ct_res.observed_subdomains[:5])}")
        else:
            evidence.append(f"Certificate Transparency Status: {ct_res.status}.")

        # 3. Evaluate Brand Impersonation
        for bf in brand_findings:
            warning_signals.append(f"Brand Impersonation Alert: {bf.description}")
            evidence.append(f"Impersonation finding ({bf.impersonation_type}): Targets '{bf.brand_name.upper()}' (Official: {bf.official_domain}).")
            risk_score += bf.confidence // 2

        risk_score = min(100, risk_score)
        if risk_score >= 70:
            risk_level = "Critical"
        elif risk_score >= 45:
            risk_level = "High"
        elif risk_score >= 20:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        recommendations = [
            f"Always verify the exact browser address bar URL against official channels.",
            "Newly registered domains should not be trusted for immediate financial transactions or credential entry."
        ]
        if brand_findings:
            recommendations.append(f"Do NOT enter credentials: This domain mimics an official brand but is not hosted under their official web infrastructure.")

        return DomainIntelligenceResult(
            domain=domain,
            rdap=rdap_res,
            certificate_transparency=ct_res,
            brand_findings=brand_findings,
            risk_level=risk_level,
            risk_score=risk_score,
            warning_signals=warning_signals,
            evidence=evidence,
            recommendations=recommendations
        )

    @classmethod
    async def _query_rdap(cls, domain: str) -> RDAPMetadata:
        """Queries public RDAP bootstrap API with 2.5s timeout."""
        try:
            url = f"https://rdap.org/domain/{domain}"
            async with httpx.AsyncClient(timeout=2.5, follow_redirects=True) as client:
                resp = await client.get(url, headers={"Accept": "application/rdap+json, application/json"})
                if resp.status_code == 200:
                    data = resp.json()
                    events = data.get("events", [])
                    c_date, e_date, u_date = None, None, None
                    for ev in events:
                        action = ev.get("eventAction")
                        ev_date = ev.get("eventDate")
                        if action == "registration":
                            c_date = ev_date
                        elif action == "expiration":
                            e_date = ev_date
                        elif action == "last changed":
                            u_date = ev_date

                    age_days = None
                    is_new = False
                    if c_date:
                        try:
                            # Parse ISO 8601
                            dt = datetime.fromisoformat(c_date.replace("Z", "+00:00"))
                            now = datetime.now(timezone.utc)
                            age_days = max(0, (now - dt).days)
                            is_new = age_days < 30
                        except Exception:
                            pass

                    # Extract registrar name
                    registrar = None
                    entities = data.get("entities", [])
                    for ent in entities:
                        if "registrar" in ent.get("roles", []):
                            vcard = ent.get("vcardArray", [])
                            if len(vcard) > 1:
                                for item in vcard[1]:
                                    if item[0] == "fn":
                                        registrar = item[3]
                                        break

                    # Extract nameservers
                    ns_list = [ns.get("ldhName") for ns in data.get("nameservers", []) if ns.get("ldhName")]

                    return RDAPMetadata(
                        domain=domain,
                        status="COMPLETED",
                        creation_date=c_date,
                        expiration_date=e_date,
                        updated_date=u_date,
                        registrar=registrar,
                        nameservers=ns_list,
                        age_days=age_days,
                        is_newly_registered=is_new
                    )
                elif resp.status_code in (404, 429):
                    return RDAPMetadata(domain=domain, status="UNAVAILABLE" if resp.status_code == 404 else "RATE_LIMITED")
        except Exception:
            pass

        return RDAPMetadata(domain=domain, status="UNAVAILABLE")

    @classmethod
    async def _query_ct_logs(cls, domain: str) -> CertificateTransparencyAudit:
        """Queries crt.sh public Certificate Transparency database."""
        try:
            url = f"https://crt.sh/?q={domain}&output=json"
            async with httpx.AsyncClient(timeout=2.5) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    entries = resp.json()
                    if isinstance(entries, list):
                        issuers = set()
                        subdomains = set()
                        first_seen, last_seen = None, None

                        for item in entries[:50]:
                            issuer = item.get("issuer_name")
                            if issuer:
                                # Extract Common Name or Org from issuer
                                cn_match = re.search(r"CN=([^,]+)", issuer)
                                issuers.add(cn_match.group(1) if cn_match else issuer[:30])

                            name_val = item.get("name_value", "")
                            for sub in name_val.split("\n"):
                                sub = sub.strip().lower()
                                if sub and sub != domain and sub.endswith(domain):
                                    subdomains.add(sub)

                            entry_date = item.get("entry_timestamp")
                            if entry_date:
                                if not first_seen or entry_date < first_seen:
                                    first_seen = entry_date
                                if not last_seen or entry_date > last_seen:
                                    last_seen = entry_date

                        return CertificateTransparencyAudit(
                            domain=domain,
                            status="COMPLETED",
                            certificate_count=len(entries),
                            issuers=list(issuers)[:5],
                            observed_subdomains=list(subdomains)[:10],
                            first_seen=first_seen,
                            last_seen=last_seen
                        )
        except Exception:
            pass

        return CertificateTransparencyAudit(domain=domain, status="UNAVAILABLE")

    @classmethod
    def _check_brand_impersonation(cls, domain: str) -> List[BrandImpersonationFinding]:
        """Detects typosquatting, subdomains tricks, and homoglyph attacks."""
        findings: List[BrandImpersonationFinding] = []

        # 1. Punycode check (starts with xn--)
        if domain.startswith("xn--") or ".xn--" in domain:
            try:
                decoded = domain.encode("ascii").decode("idna")
                findings.append(BrandImpersonationFinding(
                    brand_name="Punycode/IDN",
                    impersonation_type="HOMOGLYPH_PUNYCODE",
                    suspect_token=domain,
                    official_domain="N/A",
                    confidence=85,
                    description=f"Internationalized Domain (IDN) detected: Decodes to '{decoded}'. Often used to impersonate Latin characters with Cyrillic lookalikes."
                ))
            except Exception:
                pass

        # 2. Homoglyph normalized match
        normalized_chars = []
        has_homoglyphs = False
        for char in domain:
            if char in cls.HOMOGLYPH_MAP:
                has_homoglyphs = True
                normalized_chars.append(cls.HOMOGLYPH_MAP[char])
            else:
                normalized_chars.append(char)
        normalized_domain = "".join(normalized_chars)

        if has_homoglyphs:
            findings.append(BrandImpersonationFinding(
                brand_name="Homoglyph Spoof",
                impersonation_type="HOMOGLYPH_PUNYCODE",
                suspect_token=domain,
                official_domain=normalized_domain,
                confidence=95,
                description=f"Mixed-script Homoglyph detected: Replaces Latin characters with lookalikes. Normalizes to '{normalized_domain}'."
            ))

        # 3. Monitored Brand Check
        domain_parts = domain.split(".")
        tld_stripped = domain_parts[0] if len(domain_parts) >= 2 else domain

        for brand, meta in cls.BRAND_REGISTRY.items():
            official_doms = meta["official_domains"]

            # If the domain is actually the official domain, skip
            if any(domain == off or domain.endswith("." + off) for off in official_doms):
                continue

            # Check Subdomain trick: e.g. sbi.co.in.attacker.com or sbi-login.xyz
            if brand in domain:
                # Is it an exact prefix or suffix? e.g. sbi-support or paytm-kyc
                if any(sub == brand for sub in domain_parts[:-1]):
                    findings.append(BrandImpersonationFinding(
                        brand_name=brand,
                        impersonation_type="SUBDOMAIN_TRICK",
                        suspect_token=domain,
                        official_domain=official_doms[0],
                        confidence=90,
                        description=f"Subdomain brand deception: Uses '{brand}' as a subdomain under untrusted host '{domain}'."
                    ))
                elif re.search(rf"\b{brand}[-_]|[-_]{brand}\b", domain):
                    findings.append(BrandImpersonationFinding(
                        brand_name=brand,
                        impersonation_type="TYPOSQUAT_KEYWORD",
                        suspect_token=domain,
                        official_domain=official_doms[0],
                        confidence=85,
                        description=f"Keyword compound typosquatting: Affixes '{brand}' with security or action terms (e.g., support, kyc, update)."
                    ))

        return findings
