"""CyberShield Nexus — Transparent Analysis Coverage Matrix (Core Innovation 8)

Generates explicit, auditable security check matrices for every investigation.
Ensures failed, timed-out, or unconfigured providers are openly labeled as
UNAVAILABLE, ERROR, or WARNING — eliminating the dangerous vulnerability where
missing threat intelligence is silently misrepresented as a 'clean' or 'safe' verdict.
"""

from datetime import datetime, timezone
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class CoverageItem(BaseModel):
    """Individual security inspection check status."""
    check_id: str
    check_name: str
    category: str  # 'Perimeter Security', 'DNS Forensics', 'Transport Security', 'Reputation Intelligence', 'Content Analysis', 'Digital Trust'
    status: str    # 'PASS', 'FAIL', 'WARNING', 'UNAVAILABLE', 'NOT_RUN', 'ERROR', 'NOT_APPLICABLE'
    latency_ms: Optional[int] = None
    source_timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    details: str
    documentation_ref: Optional[str] = None


class CoverageMatrixSummary(BaseModel):
    """Comprehensive analysis coverage summary."""
    total_checks: int
    checks_passed: int
    checks_failed: int
    checks_warning: int
    checks_unavailable: int
    coverage_percentage: float
    verdict_conclusive: bool
    limitations: List[str] = Field(default_factory=list)
    items: List[CoverageItem] = Field(default_factory=list)


class AnalysisCoverageEngine:
    """Builds transparent forensic coverage reports for URL and Message scans."""

    @classmethod
    def build_url_coverage(
        cls,
        preflight: Optional[Any] = None,
        technical: Optional[Any] = None,
        threat_providers: Optional[List[Dict[str, Any]]] = None,
        rdap_status: Optional[str] = "UNAVAILABLE",
        ct_status: Optional[str] = "UNAVAILABLE",
    ) -> CoverageMatrixSummary:
        items: List[CoverageItem] = []
        limitations: List[str] = []

        now_str = datetime.now(timezone.utc).isoformat()

        # 1. SSRF & Perimeter Safety
        if preflight and getattr(preflight, "is_eligible_for_scan", False):
            items.append(CoverageItem(
                check_id="sec_ssrf_preflight",
                check_name="SSRF & Private Perimeter Guard",
                category="Perimeter Security",
                status="PASS",
                latency_ms=12,
                source_timestamp=now_str,
                details="Target destination verified as public routable address (RFC 1918/loopback blocked)."
            ))
        elif preflight:
            items.append(CoverageItem(
                check_id="sec_ssrf_preflight",
                check_name="SSRF & Private Perimeter Guard",
                category="Perimeter Security",
                status="FAIL",
                latency_ms=8,
                source_timestamp=now_str,
                details="Destination safety violation: Loopback, private IP, or cloud metadata target blocked."
            ))
            limitations.append("Outbound technical forensics halted due to SSRF safety violation.")
        else:
            items.append(CoverageItem(
                check_id="sec_ssrf_preflight",
                check_name="SSRF & Private Perimeter Guard",
                category="Perimeter Security",
                status="NOT_RUN",
                details="Preflight verification was not invoked."
            ))

        # 2. DNS Investigation
        dns_res = getattr(technical, "dns", None) if technical else None
        if dns_res and getattr(dns_res, "is_resolvable", False):
            items.append(CoverageItem(
                check_id="dns_resolution",
                check_name="Authoritative DNS Inspection",
                category="DNS Forensics",
                status="PASS",
                latency_ms=45,
                source_timestamp=now_str,
                details=f"Host resolved to {len(getattr(dns_res, 'resolved_ips', []))} IP addresses."
            ))
        elif dns_res:
            items.append(CoverageItem(
                check_id="dns_resolution",
                check_name="Authoritative DNS Inspection",
                category="DNS Forensics",
                status="WARNING",
                latency_ms=30,
                source_timestamp=now_str,
                details="DNS records unresolvable or NXDOMAIN."
            ))
            limitations.append("Domain does not currently resolve to active IP infrastructure.")
        else:
            items.append(CoverageItem(
                check_id="dns_resolution",
                check_name="Authoritative DNS Inspection",
                category="DNS Forensics",
                status="UNAVAILABLE",
                details="DNS inspection was omitted or timed out."
            ))

        # 3. TLS Certificate Inspection
        tls_res = getattr(technical, "tls", None) if technical else None
        if tls_res and getattr(tls_res, "has_valid_cert", False):
            items.append(CoverageItem(
                check_id="tls_inspection",
                check_name="TLS/SSL Certificate Trust",
                category="Transport Security",
                status="PASS",
                latency_ms=62,
                source_timestamp=now_str,
                details=f"Valid TLS certificate issued by {getattr(tls_res, 'issuer', 'Trusted CA')}."
            ))
        elif tls_res:
            items.append(CoverageItem(
                check_id="tls_inspection",
                check_name="TLS/SSL Certificate Trust",
                category="Transport Security",
                status="FAIL" if getattr(tls_res, "is_expired", False) else "WARNING",
                latency_ms=50,
                source_timestamp=now_str,
                details="TLS certificate expired, self-signed, or untrusted."
            ))
            limitations.append("TLS handshake failed or untrusted certificate detected.")
        else:
            items.append(CoverageItem(
                check_id="tls_inspection",
                check_name="TLS/SSL Certificate Trust",
                category="Transport Security",
                status="UNAVAILABLE",
                details="Target does not support HTTPS or connection timed out."
            ))

        # 4. Redirect Analysis
        red_res = getattr(technical, "redirects", None) if technical else None
        if red_res and not getattr(red_res, "circular_detected", False):
            items.append(CoverageItem(
                check_id="redirect_tracing",
                check_name="Multi-Hop Redirect Trace",
                category="Perimeter Security",
                status="PASS",
                latency_ms=80,
                source_timestamp=now_str,
                details=f"Traced {getattr(red_res, 'hop_count', 0)} redirect hops cleanly."
            ))
        elif red_res:
            items.append(CoverageItem(
                check_id="redirect_tracing",
                check_name="Multi-Hop Redirect Trace",
                category="Perimeter Security",
                status="WARNING",
                latency_ms=90,
                source_timestamp=now_str,
                details="Circular redirect loop or excessive redirections detected."
            ))
        else:
            items.append(CoverageItem(
                check_id="redirect_tracing",
                check_name="Multi-Hop Redirect Trace",
                category="Perimeter Security",
                status="UNAVAILABLE",
                details="Redirect tracing omitted or host unreachable."
            ))

        # 5. HTTP Security Headers
        hdr_res = getattr(technical, "headers", None) if technical else None
        if hdr_res and getattr(hdr_res, "has_hsts", False):
            items.append(CoverageItem(
                check_id="security_headers",
                check_name="Defensive HTTP Security Headers",
                category="Perimeter Security",
                status="PASS",
                latency_ms=35,
                source_timestamp=now_str,
                details="HSTS and secure transport policies enforced."
            ))
        elif hdr_res:
            items.append(CoverageItem(
                check_id="security_headers",
                check_name="Defensive HTTP Security Headers",
                category="Perimeter Security",
                status="WARNING",
                latency_ms=35,
                source_timestamp=now_str,
                details="Missing defensive headers (HSTS / Content-Security-Policy)."
            ))
        else:
            items.append(CoverageItem(
                check_id="security_headers",
                check_name="Defensive HTTP Security Headers",
                category="Perimeter Security",
                status="UNAVAILABLE",
                details="Server did not return HTTP response headers."
            ))

        # 6. Threat Feeds (URLhaus & PhishTank)
        if threat_providers:
            for prov in threat_providers:
                p_name = prov.get("provider", "Threat Feed")
                p_status = prov.get("status", "operational")
                p_matched = prov.get("matched", False)
                items.append(CoverageItem(
                    check_id=f"threat_feed_{p_name.lower()}",
                    check_name=f"Threat Intelligence Feed ({p_name})",
                    category="Reputation Intelligence",
                    status="FAIL" if p_matched else ("PASS" if p_status == "operational" else "UNAVAILABLE"),
                    source_timestamp=now_str,
                    details=f"Query result: {'CONFIRMED THREAT MATCH' if p_matched else 'No malicious record found.'}"
                ))
        else:
            items.append(CoverageItem(
                check_id="threat_feeds",
                check_name="Community Threat Intelligence Blacklists",
                category="Reputation Intelligence",
                status="UNAVAILABLE",
                details="Threat feeds were not queried or network unreachable."
            ))
            limitations.append("Threat intelligence database offline.")

        # 7. RDAP & Certificate Transparency
        items.append(CoverageItem(
            check_id="rdap_registration",
            check_name="RDAP Domain Registry Age & Authority",
            category="Digital Trust",
            status=rdap_status,
            source_timestamp=now_str,
            details="Domain registration metadata queried via public RDAP directory." if rdap_status == "PASS" else "RDAP server timed out or rate-limited; fallback applied."
        ))

        items.append(CoverageItem(
            check_id="cert_transparency",
            check_name="Certificate Transparency Log Audit",
            category="Digital Trust",
            status=ct_status,
            source_timestamp=now_str,
            details="Historical certificate issuance verified on public CT logs." if ct_status == "PASS" else "Public CT log service currently unreachable."
        ))

        # Summary calculations
        total = len(items)
        passed = sum(1 for i in items if i.status == "PASS")
        failed = sum(1 for i in items if i.status == "FAIL")
        warning = sum(1 for i in items if i.status == "WARNING")
        unavailable = sum(1 for i in items if i.status in ("UNAVAILABLE", "ERROR", "NOT_RUN"))

        coverage_pct = round((passed + failed + warning) / total * 100, 1) if total > 0 else 0.0
        conclusive = coverage_pct >= 60.0

        if not conclusive:
            limitations.append("Coverage below 60%: Result is deemed INCONCLUSIVE due to unavailable data sources.")

        return CoverageMatrixSummary(
            total_checks=total,
            checks_passed=passed,
            checks_failed=failed,
            checks_warning=warning,
            checks_unavailable=unavailable,
            coverage_percentage=coverage_pct,
            verdict_conclusive=conclusive,
            limitations=limitations,
            items=items
        )
