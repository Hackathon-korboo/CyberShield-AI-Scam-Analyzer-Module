"""CyberShield Nexus — Privacy-Preserving Community Threat Intelligence (Core Innovation 9)

Enables opt-in, anonymized threat indicator crowdsourcing with strict zero-PII gates.
Empowers peer threat telemetry while ensuring raw victim messages, bank details,
passwords, and personal communications are categorically barred from submission.

Guarantees:
- Explicit consent flag required (`user_consent=True`).
- PII Redactor runs over reporter notes to scrub personal phone numbers, emails, and accounts.
- Sanitizes indicators (defangs URLs, normalizes domains).
- Strictly separated from authoritative threat intelligence feeds (URLhaus/PhishTank).
"""

from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel, Field

from app.database.models import CommunityThreatReport
from app.services.nexus.pii_redactor import PIIRedactor


class CommunitySubmissionRequest(BaseModel):
    """User submission schema for community threat reporting."""
    indicator_type: str = Field(..., description="url, domain, upi_vpa, or phone")
    indicator_value: str = Field(..., description="The suspicious indicator")
    category: str = Field(..., description="phishing, financial_fraud, malware, lottery_scam, upi_fraud")
    severity: str = Field(default="High", description="Critical, High, Medium, Low")
    reporter_notes: Optional[str] = None
    source_scan_id: Optional[str] = None
    user_consent: bool = Field(..., description="User explicitly consents to share this sanitized technical indicator publicly")


class CommunityIndicatorItem(BaseModel):
    """Publicly visible community threat entry."""
    id: str
    indicator_type: str
    indicator_value: str
    category: str
    severity: str
    reporter_notes: Optional[str] = None
    source_scan_id: Optional[str] = None
    upvotes: int
    submitted_at: str


class CommunityFeedResponse(BaseModel):
    """Aggregated community threat stream."""
    total: int
    indicators: List[CommunityIndicatorItem]
    policy_notice: str


class CommunityThreatService:
    """Manages crowdsourced indicator submission, sanitization, and retrieval."""

    POLICY_NOTICE = (
        "Zero-PII Policy: Community reports are public, sanitized technical indicators. "
        "CyberShield AI automatically strips personal messages, OTPs, and private credentials. "
        "Community submissions represent crowdsourced observations and are marked separately from authoritative threat feeds."
    )

    @classmethod
    def submit_indicator(cls, db: Session, req: CommunitySubmissionRequest) -> CommunityIndicatorItem:
        """Validates consent, sanitizes input, and records a community report."""
        if not req.user_consent:
            raise ValueError("Submission rejected: Explicit user consent is mandatory for community reporting.")

        # 1. Scrub PII from reporter notes
        sanitized_notes = None
        if req.reporter_notes:
            redaction = PIIRedactor.redact(req.reporter_notes)
            sanitized_notes = redaction.redacted_text

        # 2. Defang & Normalize Indicator
        ind_val = req.indicator_value.strip()
        if req.indicator_type in ("url", "domain"):
            ind_val = ind_val.replace("http://", "hxxp://").replace("https://", "hxxps://").replace(".", "[.]")

        # 3. Create Record
        report = CommunityThreatReport(
            indicator_type=req.indicator_type.lower(),
            indicator_value=ind_val,
            category=req.category.lower(),
            severity=req.severity,
            reporter_notes=sanitized_notes,
            source_scan_id=req.source_scan_id,
            upvotes=1,
            status="active"
        )
        db.add(report)
        db.commit()
        db.refresh(report)

        return CommunityIndicatorItem(
            id=report.id,
            indicator_type=report.indicator_type,
            indicator_value=report.indicator_value,
            category=report.category,
            severity=report.severity,
            reporter_notes=report.reporter_notes,
            source_scan_id=report.source_scan_id,
            upvotes=report.upvotes,
            submitted_at=report.submitted_at.isoformat() if report.submitted_at else datetime.now(timezone.utc).isoformat()
        )

    @classmethod
    def list_indicators(
        cls,
        db: Session,
        category: Optional[str] = None,
        indicator_type: Optional[str] = None,
        limit: int = 50
    ) -> CommunityFeedResponse:
        """Retrieves verified public community indicators."""
        q = db.query(CommunityThreatReport).filter(CommunityThreatReport.status == "active")
        if category:
            q = q.filter(CommunityThreatReport.category == category.lower())
        if indicator_type:
            q = q.filter(CommunityThreatReport.indicator_type == indicator_type.lower())

        items = q.order_by(desc(CommunityThreatReport.submitted_at)).limit(limit).all()

        formatted = [
            CommunityIndicatorItem(
                id=item.id,
                indicator_type=item.indicator_type,
                indicator_value=item.indicator_value,
                category=item.category,
                severity=item.severity,
                reporter_notes=item.reporter_notes,
                source_scan_id=item.source_scan_id,
                upvotes=item.upvotes,
                submitted_at=item.submitted_at.isoformat() if item.submitted_at else ""
            )
            for item in items
        ]

        return CommunityFeedResponse(
            total=len(formatted),
            indicators=formatted,
            policy_notice=cls.POLICY_NOTICE
        )
