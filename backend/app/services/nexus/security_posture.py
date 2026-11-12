"""CyberShield Nexus — Website Security Posture Assessment (Core Innovation 6)

Analyzes defensive HTTP response headers, cookie flags, and transport policies.
Computes an independent Website Security Posture Grade (A+ to F).

Strict Architectural Principle:
Website Security Posture is kept strictly distinct from Malicious Reputation.
Missing defensive headers reflect an operational hygiene weakness or misconfiguration,
NEVER proof that a website is a malicious phishing campaign.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class HeaderFinding(BaseModel):
    """Specific defensive header observation."""
    header_name: str
    observed_value: Optional[str] = None
    status: str  # 'ENFORCED', 'WEAK', 'MISSING'
    expected_value: str
    severity: str  # 'Low', 'Medium', 'High'
    security_impact: str
    remediation_guidance: str


class SecurityPostureAssessment(BaseModel):
    """Complete defensive hygiene evaluation."""
    target_url: str
    posture_score: int  # 0 to 100
    posture_grade: str  # 'A+', 'A', 'B', 'C', 'D', 'F'
    enforced_controls_count: int
    missing_controls_count: int
    findings: List[HeaderFinding] = Field(default_factory=list)
    cookie_hygiene: Dict[str, Any] = Field(default_factory=dict)
    summary: str


class WebsiteSecurityPostureService:
    """Evaluates passive HTTP headers and computes a standardized posture grade."""

    STANDARD_DEFENSIVE_HEADERS = [
        {
            "name": "Strict-Transport-Security",
            "expected": "max-age=31536000; includeSubDomains; preload",
            "weight": 25,
            "severity_if_missing": "High",
            "impact": "Protects against SSL/TLS stripping and man-in-the-middle downgrade attacks.",
            "remediation": "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains' to enforce encrypted HTTPS."
        },
        {
            "name": "Content-Security-Policy",
            "expected": "default-src 'self'; script-src 'self' ...",
            "weight": 25,
            "severity_if_missing": "High",
            "impact": "Mitigates Cross-Site Scripting (XSS) and unauthorized data exfiltration.",
            "remediation": "Define a restrictive Content-Security-Policy header restricting trusted script and frame sources."
        },
        {
            "name": "X-Frame-Options",
            "expected": "DENY or SAMEORIGIN",
            "weight": 15,
            "severity_if_missing": "Medium",
            "impact": "Prevents Clickjacking attacks by forbidding framing inside unauthorized iframes.",
            "remediation": "Add 'X-Frame-Options: DENY' or use CSP 'frame-ancestors' directive."
        },
        {
            "name": "X-Content-Type-Options",
            "expected": "nosniff",
            "weight": 15,
            "severity_if_missing": "Medium",
            "impact": "Stops browsers from MIME-sniffing a response away from the declared content-type.",
            "remediation": "Set 'X-Content-Type-Options: nosniff'."
        },
        {
            "name": "Referrer-Policy",
            "expected": "strict-origin-when-cross-origin or no-referrer",
            "weight": 10,
            "severity_if_missing": "Low",
            "impact": "Protects user privacy by restricting sensitive referrer URL tokens leaked to external domains.",
            "remediation": "Set 'Referrer-Policy: strict-origin-when-cross-origin'."
        },
        {
            "name": "Permissions-Policy",
            "expected": "camera=(), microphone=(), geolocation=()",
            "weight": 10,
            "severity_if_missing": "Low",
            "impact": "Controls browser hardware APIs (microphone, camera, USB) accessible by the web app.",
            "remediation": "Configure 'Permissions-Policy: camera=(), microphone=(), geolocation=()'."
        }
    ]

    @classmethod
    def evaluate_headers(cls, target_url: str, headers: Dict[str, str]) -> SecurityPostureAssessment:
        """Evaluates raw HTTP response headers against modern defense-in-depth standards."""
        # Normalize header keys to lowercase
        norm_headers = {k.lower(): v for k, v in (headers or {}).items()}

        findings: List[HeaderFinding] = []
        enforced_score = 0
        enforced_count = 0
        missing_count = 0

        for rule in cls.STANDARD_DEFENSIVE_HEADERS:
            hdr_key = rule["name"].lower()
            val = norm_headers.get(hdr_key)

            if val:
                enforced_score += rule["weight"]
                enforced_count += 1
                findings.append(HeaderFinding(
                    header_name=rule["name"],
                    observed_value=val,
                    status="ENFORCED",
                    expected_value=rule["expected"],
                    severity="Low",
                    security_impact=rule["impact"],
                    remediation_guidance="Control is active."
                ))
            else:
                missing_count += 1
                findings.append(HeaderFinding(
                    header_name=rule["name"],
                    observed_value=None,
                    status="MISSING",
                    expected_value=rule["expected"],
                    severity=rule["severity_if_missing"],
                    security_impact=rule["impact"],
                    remediation_guidance=rule["remediation"]
                ))

        # Check Set-Cookie flags if present
        cookie_header = norm_headers.get("set-cookie", "")
        cookie_hygiene = {
            "has_secure": "secure" in cookie_header.lower() if cookie_header else True,
            "has_httponly": "httponly" in cookie_header.lower() if cookie_header else True,
            "has_samesite": "samesite" in cookie_header.lower() if cookie_header else True,
        }

        # Calculate Grade
        score = min(100, max(0, enforced_score))
        if score >= 90:
            grade = "A+"
        elif score >= 80:
            grade = "A"
        elif score >= 65:
            grade = "B"
        elif score >= 50:
            grade = "C"
        elif score >= 35:
            grade = "D"
        else:
            grade = "F"

        summary = (
            f"Website Security Posture Grade: {grade} ({score}/100). "
            f"{enforced_count} of 6 recommended defensive headers are enforced. "
            + ("Excellent defense-in-depth configuration." if score >= 80 else "Remediation recommended to prevent XSS, clickjacking, and MIME confusion.")
        )

        return SecurityPostureAssessment(
            target_url=target_url,
            posture_score=score,
            posture_grade=grade,
            enforced_controls_count=enforced_count,
            missing_controls_count=missing_count,
            findings=findings,
            cookie_hygiene=cookie_hygiene,
            summary=summary
        )
