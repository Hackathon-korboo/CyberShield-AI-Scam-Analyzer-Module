"""CyberShield AI — Unified API v1 Router

Consolidates all endpoints for:
- Member 1: Technical website investigation (DNS, Redirects, TLS, Headers, SSRF Preflight), Unified Threat Report persistence, and forensic history.
- Member 2: Resilient AI scam message analyzer with 3-tier LLM failover (Groq -> Gemini -> OpenAI) and evidence grounding.
- Member 3: Cryptographic canonical hashing, blockchain registry commitment, and on-chain tamper verification.
- Member 4: Master frontend REST API (/scans/url, /scans/message, /scans, /reports/{id}, /reports/{id}/verify, /system/status, /stats).
"""

from datetime import datetime, timezone
import json
import time
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc

from app.schemas.url_scan import (
    URLScanRequest as M1URLScanRequest,
    URLPreFlightResult,
    DNSInvestigationResult,
    RedirectAnalysisResult,
    TLSAnalysisResult,
    SecurityHeaderAnalysisResult,
    TechnicalInvestigationResult,
)
from app.schemas.scan import (
    URLScanRequest,
    MessageScanRequest,
    QRScanMasterRequest,
    EmailScanMasterRequest,
    ScanDetailResponse,
    ScanListResponse,
    ScanListItem,
    RiskReportSchema,
    ScanEventSchema,
    ProviderResultSchema,
    MessageIndicator,
    VerifyReportResponse,
    SystemStatusResponse,
    ProviderStatusItem,
    StatsOverviewResponse,
)
from app.schemas.ai_analysis import MessageAnalysisRequest, MessageAnalysisResponse
from app.schemas.blockchain import (
    ReportRegistrationRequest,
    ReportRegistrationResponse,
    ReportVerificationRequest,
    ReportVerificationResponse,
)
from app.schemas.threat_report import UnifiedThreatReport
from app.schemas.common import AnalysisStatus, ScanType, RiskClassification, VerificationStatus
from app.services.url_investigation.service import investigate_url_preflight
from app.services.dns import investigate_dns
from app.services.redirects import trace_redirects
from app.services.tls_analysis import inspect_tls_certificate
from app.services.security_headers import fetch_and_analyze_security_headers
from app.services.technical_investigation import investigate_technical_website
from app.services.ai_analysis import analyze_scam_message as m1_analyze_scam_message
from app.services.threat_intelligence import lookup_threat_intelligence
from app.services.report_generator import assemble_unified_threat_report
from app.services.blockchain import (
    compute_canonical_report_hash,
    register_threat_report_on_chain,
    verify_threat_report_integrity,
)
from app.services.blockchain.service import is_real_blockchain_configured
from app.services.scanner import ScannerService
from app.services.message_analyzer import MessageAnalyzerService
from app.services.blockchain_verifier import ReportVerifier
from app.database import (
    get_db,
    save_threat_report,
    get_threat_report_by_id,
    list_threat_reports,
    get_total_report_count,
)
from app.database.models import Scan, IntelligenceResult, RiskReport, ScanEvent, ThreatReportModel
from app.core.security import require_api_auth
from app.core.config import settings

router = APIRouter()


class HealthCheckResponse(BaseModel):
    """Health check response schema."""
    status: str = Field(default="healthy", description="Service health status")
    app_name: str = Field(default="CyberShield AI API", description="Application name")
    version: str = Field(default="1.0.0", description="API version")
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="Current UTC timestamp"
    )


class HistoryResponse(BaseModel):
    """Paginated report history response."""
    total: int = Field(..., description="Total persisted reports matching query")
    limit: int = Field(..., description="Page limit applied")
    offset: int = Field(..., description="Page offset applied")
    items: List[UnifiedThreatReport] = Field(default_factory=list, description="Report items")


class VerifyReportRequest(BaseModel):
    simulated_tampered_summary: Optional[str] = None


# =============================================================================
# System & Health Endpoints
# =============================================================================

@router.get(
    "/health",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="API v1 Health Check",
    tags=["System"]
)
def api_v1_health() -> HealthCheckResponse:
    """Lightweight API v1 health check verifying service responsiveness."""
    return HealthCheckResponse()


@router.get(
    "/system/status",
    response_model=SystemStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="System and Threat Provider Health Status (Member 4)",
    tags=["System"]
)
def system_status_endpoint(db: Session = Depends(get_db)) -> SystemStatusResponse:
    """Comprehensive system diagnostic: database connection, AI providers, Threat Intel feeds, and Web3 RPC."""
    db_ok = True
    try:
        db.execute(select(func.count(ThreatReportModel.scan_id))).scalar()
    except Exception:
        db_ok = False

    has_web3 = is_real_blockchain_configured(settings)

    providers = [
        ProviderStatusItem(
            provider_name="SQLite Database (Local Persistence)",
            category="Database",
            configured=True,
            status="operational" if db_ok else "error",
            details="Zero-setup local SQLite persistence store active." if db_ok else "Database connection error.",
            env_variable="DATABASE_URL"
        ),
        ProviderStatusItem(
            provider_name="Groq Cloud Llama-3.3 (Primary AI)",
            category="AI Scam Engine",
            configured=bool(settings.groq_api_key),
            status="operational" if settings.groq_api_key else "standby",
            details="Primary ultra-low latency reasoning provider configured." if settings.groq_api_key else "No API key configured (using local heuristic failover).",
            env_variable="GROQ_API_KEY"
        ),
        ProviderStatusItem(
            provider_name="Google Gemini 1.5 Flash (Backup AI 1)",
            category="AI Scam Engine",
            configured=bool(settings.gemini_api_key),
            status="operational" if settings.gemini_api_key else "standby",
            details="Backup multimodal threat reasoning engine active." if settings.gemini_api_key else "Standby backup provider.",
            env_variable="GEMINI_API_KEY"
        ),
        ProviderStatusItem(
            provider_name="OpenAI GPT-4o-mini (Backup AI 2)",
            category="AI Scam Engine",
            configured=bool(settings.openai_api_key),
            status="operational" if settings.openai_api_key else "standby",
            details="Secondary fallback reasoning engine." if settings.openai_api_key else "Standby backup provider.",
            env_variable="OPENAI_API_KEY"
        ),
        ProviderStatusItem(
            provider_name="URLhaus Malware Blacklist Feed",
            category="Threat Intelligence",
            configured=True,
            status="operational",
            details="Live and local threat corpus queries active.",
            env_variable="URLHAUS_AUTH_KEY"
        ),
        ProviderStatusItem(
            provider_name="PhishTank Community Feed",
            category="Threat Intelligence",
            configured=True,
            status="operational",
            details="Live checkurl queries active.",
            env_variable="PHISHTANK_APP_KEY"
        ),
        ProviderStatusItem(
            provider_name="ThreatReportRegistry (Smart Contract)",
            category="Blockchain",
            configured=has_web3,
            status="operational" if has_web3 else "simulation_mode",
            details=f"Connected to {settings.blockchain_network} at {settings.registry_contract_address[:10]}..." if has_web3 else "Operating in transparent local cryptographic hashing mode (SHA-256 / Keccak-256).",
            env_variable="REGISTRY_CONTRACT_ADDRESS"
        ),
    ]

    return SystemStatusResponse(
        status="healthy" if db_ok else "degraded",
        database_connected=db_ok,
        database_type="sqlite",
        providers=providers,
        app_version=settings.app_version,
        environment=settings.environment
    )


@router.get(
    "/stats",
    response_model=StatsOverviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Threat Intelligence Statistics Overview (Member 4)",
    tags=["Analytics"]
)
def stats_endpoint(db: Session = Depends(get_db)) -> StatsOverviewResponse:
    """Aggregates real-time scan statistics, risk distributions, and recent investigation activity."""
    scans = db.query(Scan).order_by(desc(Scan.created_at)).all()
    total = len(scans)
    malicious = sum(1 for s in scans if s.risk_level in ("Critical", "High"))
    suspicious = sum(1 for s in scans if s.risk_level == "Medium")
    benign = sum(1 for s in scans if s.risk_level in ("Low", "Unknown"))

    dist = {
        "Critical": sum(1 for s in scans if s.risk_level == "Critical"),
        "High": sum(1 for s in scans if s.risk_level == "High"),
        "Medium": sum(1 for s in scans if s.risk_level == "Medium"),
        "Low": sum(1 for s in scans if s.risk_level == "Low"),
    }

    recent_items = []
    for s in scans[:10]:
        rep = s.report
        recent_items.append(
            ScanListItem(
                id=s.id,
                scan_type=s.scan_type,
                target=s.target,
                status=s.status,
                risk_level=s.risk_level,
                risk_score=s.risk_score,
                created_at=s.created_at,
                report_hash=rep.report_hash if rep else None,
                verification_status=rep.verification_status if rep else None
            )
        )

    return StatsOverviewResponse(
        total_scans=total,
        malicious_count=malicious,
        suspicious_count=suspicious,
        benign_count=benign,
        risk_distribution=dist,
        recent_scans=recent_items
    )


# =============================================================================
# Member 4 Master Frontend Investigation Endpoints
# =============================================================================

@router.post(
    "/scans/url",
    response_model=ScanDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Investigate URL via Master Scanner (Member 1 + Member 4)",
    tags=["Investigation"]
)
async def scan_url_master(
    payload: URLScanRequest,
    db: Session = Depends(get_db)
) -> ScanDetailResponse:
    """
    Submits a target URL or domain for:
    - Member 1 SSRF Security Guard & normalization preflight
    - Member 1 Stage 3 Technical forensics (DNS, multi-hop redirects, TLS, defensive headers)
    - Member 4 Threat Intelligence queries (URLhaus, PhishTank)
    - Deterministic risk scoring and unified report assembly
    - Relational database persistence and optional Web3 blockchain anchoring
    """
    try:
        return await ScannerService.scan_url(payload.url, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scan execution failed: {str(e)}"
        )


@router.post(
    "/scans/message",
    response_model=ScanDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Suspicious Message via AI Scam Engine (Member 2 + Member 4)",
    tags=["AI Analysis"]
)
async def scan_message_master(
    payload: MessageScanRequest,
    db: Session = Depends(get_db)
) -> ScanDetailResponse:
    """
    Submits an email body, SMS, or social engineering message text for:
    - Member 2 Multi-provider AI reasoning (Groq -> Gemini -> OpenAI -> Heuristics)
    - Prompt injection defense & passive indicator extraction (URLs, phone numbers, emails)
    - EvidenceValidator verbatim grounding to eliminate hallucinations
    - Threat intelligence correlation of extracted URLs against blacklists
    - Cryptographic report hashing and relational persistence
    """
    try:
        analysis = await MessageAnalyzerService.analyze_message(payload.content)

        # Create Scan record
        preview_target = payload.content[:100] + ("..." if len(payload.content) > 100 else "")
        scan = Scan(
            scan_type="message",
            target=preview_target,
            status="completed",
            risk_level=analysis["risk_level"],
            risk_score=analysis["risk_score"]
        )
        db.add(scan)
        db.flush()

        # Add text analysis event
        db.add(ScanEvent(
            scan_id=scan.id,
            event_type="text_analysis",
            description=f"Message processed using engine '{analysis['engine']}' with {len(analysis['message_indicators'])} threat indicators."
        ))

        # Build canonical payload and hash
        canonical_dict = ReportVerifier.build_canonical_payload(
            scan_id=scan.id,
            target=preview_target,
            risk_level=analysis["risk_level"],
            risk_score=analysis["risk_score"],
            summary=analysis["summary"],
            evidence=analysis["evidence"],
            recommendations=analysis["recommendations"]
        )
        report_hash = ReportVerifier.calculate_hash(canonical_dict)

        # Store Risk Report
        report = RiskReport(
            scan_id=scan.id,
            summary=analysis["summary"],
            evidence=json.dumps(analysis["evidence"]),
            recommendations=json.dumps(analysis["recommendations"]),
            report_hash=report_hash,
            verification_status="locally_hashed",
            blockchain_tx=None
        )
        db.add(report)

        db.add(ScanEvent(
            scan_id=scan.id,
            event_type="report_generation",
            description=f"Generated report with SHA-256 cryptographic proof: {report_hash[:16]}..."
        ))
        db.commit()
        db.refresh(scan)
        db.refresh(report)

        # Core Innovation 1: Ingest into Evidence Relationship Graph
        try:
            from app.services.nexus.graph_service import ThreatGraphService
            ThreatGraphService.ingest_scan(
                db=db,
                scan_id=scan.id,
                scan_type="message",
                target=payload.content,
                risk_level=analysis["risk_level"],
                extracted_indicators=analysis.get("extracted_indicators")
            )
        except Exception:
            pass

        return ScanDetailResponse(
            scan_id=scan.id,
            scan_type=scan.scan_type,
            target=scan.target,
            normalized_target=None,
            domain=None,
            hostname=None,
            status=scan.status,
            risk_level=scan.risk_level,
            risk_score=scan.risk_score,
            created_at=scan.created_at,
            providers_checked=[],
            report=RiskReportSchema(
                report_id=report.id,
                summary=report.summary,
                evidence=analysis["evidence"],
                recommendations=analysis["recommendations"],
                report_hash=report.report_hash,
                verification_status=report.verification_status,
                blockchain_tx=report.blockchain_tx,
                created_at=report.created_at
            ),
            events=[
                ScanEventSchema(
                    event_type=e.event_type,
                    description=e.description,
                    created_at=e.created_at
                ) for e in scan.events
            ],
            message_indicators=analysis["message_indicators"],
            analysis_engine=analysis["engine"]
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Message analysis failed: {str(e)}"
        )


@router.post(
    "/scans/qr",
    response_model=ScanDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Investigate QR / UPI Payload via Master Scanner (Nexus Innovation)",
    tags=["Investigation"]
)
async def scan_qr_master(
    payload: QRScanMasterRequest,
    db: Session = Depends(get_db)
) -> ScanDetailResponse:
    """
    Submits a decoded QR payload or UPI payment URI for:
    - NPCI UPI parameter parsing and risk scoring
    - Scan-to-receive fraud alert detection
    - Deterministic risk assessment and unified report assembly
    - Relational database persistence and SHA-256 cryptographic proof
    - Threat Relationship Graph ingestion
    """
    raw_payload = payload.payload.strip()
    if not raw_payload:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Payload cannot be empty.")

    try:
        from app.services.nexus.qr_upi_analyzer import QRUPIAnalyzer
        preview_target = (raw_payload[:120] + "...") if len(raw_payload) > 120 else raw_payload

        scan = Scan(
            target=preview_target,
            scan_type="qr",
            status="scanning"
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

        db.add(ScanEvent(
            scan_id=scan.id,
            event_type="qr_analysis_initiated",
            description="Decoded QR payload submitted for UPI parameter parsing and scam analysis."
        ))

        analysis = QRUPIAnalyzer.analyze_payload(raw_payload)

        risk_level = analysis.risk_level
        if risk_level == "Benign":
            risk_level = "Low"
        risk_score = analysis.risk_score

        evidence_list = list(analysis.evidence)
        for warn in analysis.warning_signals:
            if warn not in evidence_list:
                evidence_list.append(warn)
        if analysis.upi_details and analysis.upi_details.payee_vpa:
            evidence_list.append(f"Target Payee VPA: {analysis.upi_details.payee_vpa}")
        if not evidence_list:
            evidence_list = ["No malicious QR or deceptive payment patterns detected."]

        recommendations = list(analysis.recommendations) if analysis.recommendations else [
            "Verify the merchant or recipient before scanning any payment QR code.",
            "Remember: Receiving money never requires scanning a QR code or entering a UPI PIN."
        ]

        canonical_dict = ReportVerifier.build_canonical_payload(
            scan_id=scan.id,
            target=preview_target,
            risk_level=risk_level,
            risk_score=risk_score,
            summary=analysis.decoded_summary,
            evidence=evidence_list,
            recommendations=recommendations
        )
        report_hash = ReportVerifier.calculate_hash(canonical_dict)

        report = RiskReport(
            scan_id=scan.id,
            summary=analysis.decoded_summary,
            evidence=json.dumps(evidence_list),
            recommendations=json.dumps(recommendations),
            report_hash=report_hash,
            verification_status="locally_hashed",
            blockchain_tx=None
        )
        db.add(report)

        scan.status = "completed"
        scan.risk_level = risk_level
        scan.risk_score = risk_score

        db.add(ScanEvent(
            scan_id=scan.id,
            event_type="report_generation",
            description=f"Generated report with SHA-256 cryptographic proof: {report_hash[:16]}..."
        ))
        db.commit()
        db.refresh(scan)
        db.refresh(report)

        # Ingest into Evidence Relationship Graph
        try:
            from app.services.nexus.graph_service import ThreatGraphService
            extra_data = {}
            if analysis.upi_details and analysis.upi_details.payee_vpa:
                extra_data["payee_vpa"] = analysis.upi_details.payee_vpa
            ThreatGraphService.ingest_scan(
                db=db,
                scan_id=scan.id,
                scan_type="qr",
                target=raw_payload,
                risk_level=risk_level,
                technical_data=extra_data
            )
        except Exception as g_err:
            logger.warning(f"Non-fatal threat graph ingestion: {g_err}")

        return ScanDetailResponse(
            scan_id=scan.id,
            scan_type=scan.scan_type,
            target=scan.target,
            normalized_target=None,
            domain=None,
            hostname=None,
            status=scan.status,
            risk_level=scan.risk_level,
            risk_score=scan.risk_score,
            created_at=scan.created_at,
            providers_checked=[],
            report=RiskReportSchema(
                report_id=report.id,
                summary=report.summary,
                evidence=evidence_list,
                recommendations=recommendations,
                report_hash=report.report_hash,
                verification_status=report.verification_status,
                blockchain_tx=report.blockchain_tx,
                created_at=report.created_at
            ),
            events=[
                ScanEventSchema(
                    event_type=e.event_type,
                    description=e.description,
                    created_at=e.created_at
                ) for e in scan.events
            ],
            message_indicators=[],
            analysis_engine="CyberShield QR & UPI Forensics"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"QR analysis failed: {str(e)}"
        )


@router.post(
    "/scans/email",
    response_model=ScanDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate Email Headers & Provenance via Master Scanner (Nexus Innovation)",
    tags=["Investigation"]
)
async def scan_email_master(
    payload: EmailScanMasterRequest,
    db: Session = Depends(get_db)
) -> ScanDetailResponse:
    """
    Submits raw email text or RFC 5322 headers for:
    - SPF, DKIM, DMARC DNS record verification and alignment
    - From vs. Reply-To domain mismatch & display name spoofing detection
    - Deterministic risk assessment and unified report assembly
    - Relational database persistence and SHA-256 cryptographic proof
    - Threat Relationship Graph ingestion
    """
    raw_content = payload.content.strip()
    if not raw_content:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Email content cannot be empty.")

    try:
        from app.services.nexus.email_auth import EmailAuthenticationService
        auth_res = EmailAuthenticationService.authenticate_email(raw_content)

        target_label = auth_res.headers.subject or auth_res.headers.from_email or (raw_content[:80] + "...")
        preview_target = (target_label[:120] + "...") if len(target_label) > 120 else target_label

        scan = Scan(
            target=preview_target,
            scan_type="email",
            status="scanning"
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

        db.add(ScanEvent(
            scan_id=scan.id,
            event_type="email_auth_initiated",
            description=f"Email authenticated from sender '{auth_res.headers.from_email or 'unknown'}'. SPF: {auth_res.spf_status}, DMARC: {auth_res.dmarc_status}."
        ))

        risk_level = auth_res.risk_level
        if risk_level == "Benign":
            risk_level = "Low"
        risk_score = auth_res.risk_score

        evidence_list = list(auth_res.evidence)
        for warn in auth_res.warning_signals:
            if warn not in evidence_list:
                evidence_list.append(warn)
        if not evidence_list:
            evidence_list = ["No email spoofing, header tampering, or authentication failures detected."]

        recommendations = list(auth_res.recommendations) if auth_res.recommendations else [
            "Always inspect sender email address, not just display name.",
            "Verify any sensitive or financial request through out-of-band channels."
        ]

        canonical_dict = ReportVerifier.build_canonical_payload(
            scan_id=scan.id,
            target=preview_target,
            risk_level=risk_level,
            risk_score=risk_score,
            summary=auth_res.plain_english_explanation,
            evidence=evidence_list,
            recommendations=recommendations
        )
        report_hash = ReportVerifier.calculate_hash(canonical_dict)

        report = RiskReport(
            scan_id=scan.id,
            summary=auth_res.plain_english_explanation,
            evidence=json.dumps(evidence_list),
            recommendations=json.dumps(recommendations),
            report_hash=report_hash,
            verification_status="locally_hashed",
            blockchain_tx=None
        )
        db.add(report)

        scan.status = "completed"
        scan.risk_level = risk_level
        scan.risk_score = risk_score

        db.add(ScanEvent(
            scan_id=scan.id,
            event_type="report_generation",
            description=f"Generated report with SHA-256 cryptographic proof: {report_hash[:16]}..."
        ))
        db.commit()
        db.refresh(scan)
        db.refresh(report)

        # Ingest into Evidence Relationship Graph
        try:
            from app.services.nexus.graph_service import ThreatGraphService
            extra_data = {
                "from_domain": auth_res.headers.from_domain,
                "reply_to_domain": auth_res.headers.reply_to_domain,
                "spf": auth_res.spf_status,
                "dmarc": auth_res.dmarc_status
            }
            ThreatGraphService.ingest_scan(
                db=db,
                scan_id=scan.id,
                scan_type="email",
                target=preview_target,
                risk_level=risk_level,
                technical_data=extra_data
            )
        except Exception as g_err:
            logger.warning(f"Non-fatal threat graph ingestion: {g_err}")

        return ScanDetailResponse(
            scan_id=scan.id,
            scan_type=scan.scan_type,
            target=scan.target,
            normalized_target=None,
            domain=auth_res.headers.from_domain,
            hostname=None,
            status=scan.status,
            risk_level=scan.risk_level,
            risk_score=scan.risk_score,
            created_at=scan.created_at,
            providers_checked=[],
            report=RiskReportSchema(
                report_id=report.id,
                summary=report.summary,
                evidence=evidence_list,
                recommendations=recommendations,
                report_hash=report.report_hash,
                verification_status=report.verification_status,
                blockchain_tx=report.blockchain_tx,
                created_at=report.created_at
            ),
            events=[
                ScanEventSchema(
                    event_type=e.event_type,
                    description=e.description,
                    created_at=e.created_at
                ) for e in scan.events
            ],
            message_indicators=[],
            analysis_engine="CyberShield Email Provenance & DMARC"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Email analysis failed: {str(e)}"
        )


@router.get(
    "/scans",
    response_model=ScanListResponse,
    status_code=status.HTTP_200_OK,
    summary="List Scans for Dashboard & History (Member 4)",
    tags=["Investigation"]
)
def list_scans_endpoint(
    query: Optional[str] = Query(default=None),
    risk_level: Optional[str] = Query(default=None),
    scan_type: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db)
) -> ScanListResponse:
    """Retrieve paginated scan records with multi-factor filtering for the frontend."""
    q = db.query(Scan)
    if risk_level:
        q = q.filter(Scan.risk_level.ilike(risk_level))
    if scan_type:
        q = q.filter(Scan.scan_type.ilike(scan_type))
    if query:
        q = q.filter(Scan.target.ilike(f"%{query}%"))

    total = q.count()
    items = q.order_by(desc(Scan.created_at)).offset(offset).limit(limit).all()

    list_items = []
    for s in items:
        rep = s.report
        list_items.append(
            ScanListItem(
                id=s.id,
                scan_type=s.scan_type,
                target=s.target,
                status=s.status,
                risk_level=s.risk_level,
                risk_score=s.risk_score,
                created_at=s.created_at,
                report_hash=rep.report_hash if rep else None,
                verification_status=rep.verification_status if rep else None
            )
        )

    return ScanListResponse(total=total, items=list_items)


@router.get(
    "/scans/{scan_id}",
    status_code=status.HTTP_200_OK,
    summary="Retrieve Scan Detail by ID",
    tags=["Investigation"]
)
def get_scan_by_id_endpoint(
    scan_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Retrieves full scan investigation by scan_id.
    - If request has API Auth headers and requests UnifiedThreatReport, returns UnifiedThreatReport.
    - If accessed by Frontend or public user, returns ScanDetailResponse.
    - If unauthenticated and ID does not exist, enforces security check.
    """
    # 1. Check relational Scan table first
    scan = db.query(Scan).filter_by(id=scan_id).first()
    if scan:
        rep = scan.report
        ev_list = json.loads(rep.evidence) if rep and rep.evidence else []
        rec_list = json.loads(rep.recommendations) if rep and rep.recommendations else []

        prov_schemas = []
        for ind in scan.intelligence_results:
            details_dict = json.loads(ind.details) if ind.details else None
            prov_schemas.append(
                ProviderResultSchema(
                    provider=ind.provider,
                    indicator_type=ind.indicator_type,
                    indicator_value=ind.indicator_value,
                    status=ind.status,
                    matched=ind.matched,
                    verified=ind.verified,
                    reference=ind.reference,
                    details=details_dict,
                    first_seen=ind.first_seen,
                    last_seen=ind.last_seen
                )
            )

        return ScanDetailResponse(
            scan_id=scan.id,
            scan_type=scan.scan_type,
            target=scan.target,
            status=scan.status,
            risk_level=scan.risk_level,
            risk_score=scan.risk_score,
            created_at=scan.created_at,
            providers_checked=prov_schemas,
            report=RiskReportSchema(
                report_id=rep.id if rep else scan.id,
                summary=rep.summary if rep else "",
                evidence=ev_list,
                recommendations=rec_list,
                report_hash=rep.report_hash if rep else "",
                verification_status=rep.verification_status if rep else "locally_hashed",
                blockchain_tx=rep.blockchain_tx if rep else None,
                created_at=rep.created_at if rep else scan.created_at
            ) if rep else None,
            events=[
                ScanEventSchema(
                    event_type=e.event_type,
                    description=e.description,
                    created_at=e.created_at
                ) for e in scan.events
            ]
        )

    # 2. Check Member 1 ThreatReportModel table
    report = get_threat_report_by_id(db, scan_id)
    if report:
        return report

    # 3. Not found: Enforce authentication check if unauthenticated
    auth_header = request.headers.get("Authorization") or request.headers.get("X-API-Key")
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to inspect scan resources.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Threat report with scan_id '{scan_id}' not found in database."
    )


@router.get(
    "/reports/{report_id}",
    response_model=RiskReportSchema,
    status_code=status.HTTP_200_OK,
    summary="Retrieve Risk Report by Report ID (Member 4)",
    tags=["Reports"]
)
def get_report_by_id_endpoint(report_id: str, db: Session = Depends(get_db)) -> RiskReportSchema:
    """Retrieve risk report by its unique report ID."""
    rep = db.query(RiskReport).filter_by(id=report_id).first()
    if not rep:
        # Check by scan_id
        rep = db.query(RiskReport).filter_by(scan_id=report_id).first()

    if not rep:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with id '{report_id}' not found."
        )

    ev_list = json.loads(rep.evidence) if rep.evidence else []
    rec_list = json.loads(rep.recommendations) if rep.recommendations else []

    return RiskReportSchema(
        report_id=rep.id,
        summary=rep.summary,
        evidence=ev_list,
        recommendations=rec_list,
        report_hash=rep.report_hash,
        verification_status=rep.verification_status,
        blockchain_tx=rep.blockchain_tx,
        created_at=rep.created_at
    )


@router.post(
    "/reports/{report_id}/verify",
    response_model=VerifyReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Cryptographically Verify Report Integrity (Member 4)",
    tags=["Reports"]
)
def verify_report_frontend(
    report_id: str,
    payload: Optional[VerifyReportRequest] = None,
    db: Session = Depends(get_db)
) -> VerifyReportResponse:
    """
    Cryptographically recalculates the SHA-256 canonical hash of the report
    and compares it to the original stored hash. Supports simulated tamper detection.
    """
    rep = db.query(RiskReport).filter_by(id=report_id).first()
    if not rep:
        rep = db.query(RiskReport).filter_by(scan_id=report_id).first()

    if not rep:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with id '{report_id}' not found."
        )

    scan = rep.scan
    target_str = scan.target if scan else "target"
    risk_level_str = scan.risk_level if scan else "Unknown"
    risk_score_int = scan.risk_score if scan else 0

    canonical_dict = ReportVerifier.build_canonical_payload(
        scan_id=rep.scan_id,
        target=target_str,
        risk_level=risk_level_str,
        risk_score=risk_score_int,
        summary=rep.summary,
        evidence=json.loads(rep.evidence) if rep.evidence else [],
        recommendations=json.loads(rep.recommendations) if rep.recommendations else []
    )

    tampered_text = payload.simulated_tampered_summary if payload else None
    is_valid, recalc_hash, notes = ReportVerifier.verify_report_integrity(
        stored_hash=rep.report_hash,
        report_data=canonical_dict,
        simulated_tampered_summary=tampered_text
    )

    return VerifyReportResponse(
        report_id=rep.id,
        stored_hash=rep.report_hash,
        recalculated_hash=recalc_hash,
        is_valid=is_valid,
        verification_status="locally_hashed" if is_valid else "verification_failed",
        audit_notes=notes,
        blockchain_verified=bool(rep.blockchain_tx),
        blockchain_tx=rep.blockchain_tx
    )


# =============================================================================
# Member 1 Investigation & Security Gate Endpoints
# =============================================================================

@router.post(
    "/scan-url",
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    summary="Investigate URL / Domain (Early Security Gate Protected)",
    tags=["Investigation"]
)
def scan_url_gated(request: M1URLScanRequest) -> Dict[str, Any]:
    """Endpoint stub for full live URL investigation under early Security Gate rules."""
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=(
            "Outbound live URL scanning is intentionally gated and disabled under Security Gate rules. "
            "Safe offline URL intake and SSRF preflight validation is available at /api/v1/url/preflight, "
            "and full safe multi-stage technical forensics is available at POST /api/v1/scans/url or POST /api/v1/reports/investigate."
        )
    )


@router.post(
    "/url/preflight",
    response_model=URLPreFlightResult,
    status_code=status.HTTP_200_OK,
    summary="URL Intake Preflight Investigation (Safe Local Validation)",
    tags=["Investigation"]
)
def url_preflight(request: M1URLScanRequest) -> URLPreFlightResult:
    """Execute safe pre-flight URL investigation strictly locally without outbound HTTP requests."""
    return investigate_url_preflight(request.url)


@router.post(
    "/investigate/dns",
    response_model=DNSInvestigationResult,
    status_code=status.HTTP_200_OK,
    summary="Investigate DNS Resolution and Security Records",
    tags=["Technical Investigation"]
)
def investigate_dns_endpoint(request: M1URLScanRequest) -> DNSInvestigationResult:
    """Resolve DNS records (A, AAAA, MX, TXT, NS) and check for DNS anomalies."""
    return investigate_dns(request.url)


@router.post(
    "/investigate/redirects",
    response_model=RedirectAnalysisResult,
    status_code=status.HTTP_200_OK,
    summary="Trace Safe HTTP Redirect Chains",
    tags=["Technical Investigation"]
)
def investigate_redirects_endpoint(request: M1URLScanRequest) -> RedirectAnalysisResult:
    """Trace HTTP redirect chains with multi-hop SSRF validation."""
    return trace_redirects(request.url)


@router.post(
    "/investigate/tls",
    response_model=TLSAnalysisResult,
    status_code=status.HTTP_200_OK,
    summary="Analyze TLS/SSL Certificate",
    tags=["Technical Investigation"]
)
def investigate_tls_endpoint(request: M1URLScanRequest) -> TLSAnalysisResult:
    """Inspect server TLS/SSL certificate, issuer hierarchy, and validity dates."""
    return inspect_tls_certificate(request.url)


@router.post(
    "/investigate/headers",
    response_model=SecurityHeaderAnalysisResult,
    status_code=status.HTTP_200_OK,
    summary="Analyze HTTP Defensive Security Headers",
    tags=["Technical Investigation"]
)
def investigate_headers_endpoint(request: M1URLScanRequest) -> SecurityHeaderAnalysisResult:
    """Passively evaluate defensive HTTP security headers."""
    return fetch_and_analyze_security_headers(request.url)


@router.post(
    "/investigate/technical",
    response_model=TechnicalInvestigationResult,
    status_code=status.HTTP_200_OK,
    summary="Comprehensive Technical Website Investigation (Parts 09–12)",
    tags=["Technical Investigation"]
)
def investigate_technical_endpoint(request: M1URLScanRequest) -> TechnicalInvestigationResult:
    """Execute full Stage 3 technical pipeline coordinating DNS, redirects, TLS, and headers."""
    return investigate_technical_website(request.url)


# =============================================================================
# Member 2 AI Analysis Endpoints
# =============================================================================

@router.post(
    "/analyze-message",
    status_code=status.HTTP_200_OK,
    summary="Analyze Scam Message (Member 1 & Member 2 Multi-Provider Failover)",
    tags=["AI Analysis"]
)
async def analyze_message_endpoint(request: MessageAnalysisRequest):
    """
    Analyze untrusted email, SMS, or notification text for social engineering cues.
    Seamlessly adapts to both Member 1 (`message_text`) and Member 2 (`message`) contracts.
    """
    text = request.get_text()

    # If the caller used Member 2's direct contract (`message` parameter)
    if request.message is not None and request.message_text is None:
        from app.services.ai_engine.schemas import AnalyzeMessageRequest as M2Req, MessageTypeEnum
        m_type = MessageTypeEnum.OTHER
        if request.message_type:
            try:
                m_type = MessageTypeEnum(request.message_type.lower())
            except Exception:
                m_type = MessageTypeEnum.OTHER
        m2_req = M2Req(message=text, message_type=m_type)
        analyzer = MessageAnalyzerService.get_analyzer()
        m2_resp, _ = await analyzer.analyze(m2_req)
        return m2_resp.model_dump()

    # Otherwise return Member 1's MessageAnalysisResponse contract
    return m1_analyze_scam_message(request)


# =============================================================================
# Persistence & Coordinated Threat Reports
# =============================================================================

@router.get(
    "/history",
    response_model=HistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve Paginated Scan History (Part 17 / 19)",
    tags=["Persistence"],
    dependencies=[Depends(require_api_auth)],
)
def get_history(
    limit: int = Query(default=20, ge=1, le=100, description="Page size limit"),
    offset: int = Query(default=0, ge=0, description="Page offset"),
    classification: Optional[str] = Query(default=None, description="Filter by risk classification"),
    db: Session = Depends(get_db),
) -> HistoryResponse:
    """Retrieve paginated list of historically investigated threat reports."""
    reports = list_threat_reports(db, limit=limit, offset=offset, classification=classification)
    total = get_total_report_count(db, classification=classification)
    return HistoryResponse(
        total=total,
        limit=limit,
        offset=offset,
        items=reports,
    )


@router.post(
    "/reports",
    response_model=UnifiedThreatReport,
    status_code=status.HTTP_200_OK,
    summary="Persist Threat Report Off-Chain (Part 17 / 19)",
    tags=["Persistence"],
    dependencies=[Depends(require_api_auth)],
)
def persist_report_endpoint(
    report: UnifiedThreatReport,
    db: Session = Depends(get_db),
) -> UnifiedThreatReport:
    """Persist a complete UnifiedThreatReport off-chain in the relational database."""
    try:
        canonical_hash = compute_canonical_report_hash(report)
        save_threat_report(db, report, canonical_hash=canonical_hash)
        persisted = get_threat_report_by_id(db, report.scan_id)
        return persisted or report
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database persistence failure: {exc}",
        )


@router.post(
    "/reports/investigate",
    response_model=UnifiedThreatReport,
    status_code=status.HTTP_200_OK,
    summary="Execute Full Coordinated Threat Investigation (Part 17 / 18 / 19)",
    tags=["Investigation"],
    dependencies=[Depends(require_api_auth)],
)
def investigate_and_generate_report(
    request: M1URLScanRequest,
    db: Session = Depends(get_db),
) -> UnifiedThreatReport:
    """Execute full safe coordinated investigation: preflight, technical, threat intel, and persist report."""
    preflight = investigate_url_preflight(request.url)

    if not preflight.is_eligible_for_scan or not preflight.validation.is_valid:
        report = assemble_unified_threat_report(
            target=request.url,
            target_type=ScanType.URL,
            preflight=preflight,
            custom_limitations=["Outbound technical investigation omitted due to SSRF safety block or invalid syntax."],
        )
        try:
            canonical_hash = compute_canonical_report_hash(report)
            save_threat_report(db, report, canonical_hash=canonical_hash)
        except Exception as exc:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database persistence failure: {exc}",
            )
        return report

    technical = investigate_technical_website(request.url)
    threat_intel = lookup_threat_intelligence(request.url)

    report = assemble_unified_threat_report(
        target=request.url,
        target_type=ScanType.URL,
        preflight=preflight,
        technical_investigation=technical,
        threat_intel=threat_intel,
    )

    try:
        canonical_hash = compute_canonical_report_hash(report)
        save_threat_report(db, report, canonical_hash=canonical_hash)
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database persistence failure: {exc}",
        )

    return report


# =============================================================================
# Member 3 Blockchain Registration & Verification Endpoints
# =============================================================================

@router.post(
    "/reports/register",
    response_model=ReportRegistrationResponse,
    status_code=status.HTTP_200_OK,
    summary="Register Report Hash On-Chain (Part 19)",
    tags=["Blockchain"],
    dependencies=[Depends(require_api_auth)],
)
def register_report_endpoint(
    request: ReportRegistrationRequest,
    db: Session = Depends(get_db),
) -> ReportRegistrationResponse:
    """Commit canonical threat report hash to decentralized registry ledger."""
    try:
        return register_threat_report_on_chain(request, db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.post(
    "/reports/verify",
    response_model=ReportVerificationResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify Report Integrity Against Blockchain (Part 19)",
    tags=["Blockchain"]
)
def verify_report_endpoint(
    request: ReportVerificationRequest,
    db: Session = Depends(get_db),
) -> ReportVerificationResponse:
    """Verify cryptographic integrity and tamper status of a report against the blockchain."""
    return verify_threat_report_integrity(request, db)


# =============================================================================
# CyberShield Nexus Innovation Endpoints (P0 / P1 / P2)
# =============================================================================

from app.services.nexus.graph_service import ThreatGraphService
from app.services.nexus.golden_hour import GoldenHourService, IncidentQuestionnaire, GoldenHourResponse
from app.services.nexus.qr_upi_analyzer import QRUPIAnalyzer, QRAnalysisResult
from app.services.nexus.email_auth import EmailAuthenticationService, EmailAuthenticationResult
from app.services.nexus.domain_intelligence import DomainIntelligenceService, DomainIntelligenceResult
from app.services.nexus.security_posture import WebsiteSecurityPostureService, SecurityPostureAssessment
from app.services.nexus.community_repo import CommunityThreatService, CommunitySubmissionRequest, CommunityFeedResponse, CommunityIndicatorItem
from app.services.nexus.pii_redactor import PIIRedactor, RedactionResult


class QRScanRequest(BaseModel):
    payload: str = Field(..., description="Decoded QR payload string or UPI URI")


class EmailAuthRequest(BaseModel):
    content: str = Field(..., description="Raw email text, RFC 5322 headers, or message body")


class DomainIntelRequest(BaseModel):
    domain: str = Field(..., description="Target domain or hostname")


class SecurityPostureRequest(BaseModel):
    url: str = Field(..., description="Target website URL")
    headers: Optional[Dict[str, str]] = Field(default=None, description="Optional observed response headers")


class PrivacyRedactionRequest(BaseModel):
    text: str = Field(..., description="Input text containing potentially sensitive credentials or personal data")


@router.get(
    "/nexus/graph",
    summary="Evidence Relationship Intelligence Graph (Core Innovation 1)",
    tags=["Nexus Innovation"]
)
def get_threat_graph_endpoint(
    entity_id: Optional[str] = Query(default=None),
    scan_id: Optional[str] = Query(default=None),
    hops: int = Query(default=2, ge=1, le=3),
    entity_type: Optional[List[str]] = Query(default=None),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Multi-hop threat entity relationship graph distinguishing verified (solid) and inferred (dashed) edges."""
    return ThreatGraphService.get_subgraph(
        db=db,
        entity_id=entity_id,
        scan_id=scan_id,
        hops=hops,
        entity_types=entity_type
    )


@router.get(
    "/nexus/golden-hour/scenarios",
    summary="Retrieve Supported Scenarios for Golden Hour (Core Innovation 2)",
    tags=["Nexus Innovation"]
)
def get_golden_hour_scenarios_endpoint() -> Dict[str, Any]:
    """Returns supported victim scenarios, timeline brackets, and official Indian cybercrime resources."""
    return GoldenHourService.get_supported_scenarios()


@router.post(
    "/nexus/golden-hour/generate",
    response_model=GoldenHourResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Contextual Golden Hour Response Plan (Core Innovation 2)",
    tags=["Nexus Innovation"]
)
def generate_golden_hour_plan_endpoint(payload: IncidentQuestionnaire) -> GoldenHourResponse:
    """Generates an immediate, evidence-preserving, prioritized action checklist for scam victims."""
    return GoldenHourService.generate_response_plan(payload)


@router.post(
    "/nexus/qr/analyze",
    response_model=QRAnalysisResult,
    status_code=status.HTTP_200_OK,
    summary="Audit Decoded QR Code or UPI Payment URI (Core Innovation 3)",
    tags=["Nexus Innovation"]
)
def analyze_qr_payload_endpoint(payload: QRScanRequest) -> QRAnalysisResult:
    """Parses QR code payloads, decodes NPCI UPI parameters, and audits against scan-to-receive scams."""
    return QRUPIAnalyzer.analyze_payload(payload.payload)


@router.post(
    "/nexus/email/authenticate",
    response_model=EmailAuthenticationResult,
    status_code=status.HTTP_200_OK,
    summary="Email Provenance and SPF/DKIM/DMARC Authentication (Core Innovation 4)",
    tags=["Nexus Innovation"]
)
def authenticate_email_endpoint(payload: EmailAuthRequest) -> EmailAuthenticationResult:
    """Inspects email headers, verifies From/Reply-To alignment, and checks DNS SPF and DMARC policies."""
    return EmailAuthenticationService.authenticate_email(payload.content)


@router.post(
    "/nexus/domain/intel",
    response_model=DomainIntelligenceResult,
    status_code=status.HTTP_200_OK,
    summary="Domain RDAP, Certificate Transparency & Brand Intelligence (Core Innovation 5)",
    tags=["Nexus Innovation"]
)
async def investigate_domain_endpoint(payload: DomainIntelRequest) -> DomainIntelligenceResult:
    """Performs parallel RDAP domain registration, CT logs auditing, and homoglyph brand impersonation checks."""
    return await DomainIntelligenceService.investigate_domain(payload.domain)


@router.post(
    "/nexus/security-posture/assess",
    response_model=SecurityPostureAssessment,
    status_code=status.HTTP_200_OK,
    summary="Passive Website Security Posture Assessment (Core Innovation 6)",
    tags=["Nexus Innovation"]
)
def assess_security_posture_endpoint(payload: SecurityPostureRequest) -> SecurityPostureAssessment:
    """Evaluates defensive HTTP response headers and issues an independent Security Posture Grade."""
    return WebsiteSecurityPostureService.evaluate_headers(payload.url, payload.headers or {})


@router.post(
    "/nexus/privacy/redact",
    response_model=RedactionResult,
    status_code=status.HTTP_200_OK,
    summary="AI Privacy & PII Redaction Audit (Core Innovation 7)",
    tags=["Nexus Innovation"]
)
def redact_pii_endpoint(payload: PrivacyRedactionRequest) -> RedactionResult:
    """Scrubs personal credentials, phone numbers, and payment VPAs, generating local reversible mappings."""
    return PIIRedactor.redact(payload.text)


@router.post(
    "/nexus/community/submit",
    response_model=CommunityIndicatorItem,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Opt-in Sanitized Community Threat Indicator (Core Innovation 9)",
    tags=["Nexus Innovation"]
)
def submit_community_indicator_endpoint(
    payload: CommunitySubmissionRequest,
    db: Session = Depends(get_db)
) -> CommunityIndicatorItem:
    """Receives user-consented, sanitized threat indicators with automatic PII stripping."""
    try:
        return CommunityThreatService.submit_indicator(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/nexus/community/feed",
    response_model=CommunityFeedResponse,
    status_code=status.HTTP_200_OK,
    summary="List Sanitized Community Threat Telemetry (Core Innovation 9)",
    tags=["Nexus Innovation"]
)
def list_community_indicators_endpoint(
    category: Optional[str] = Query(default=None),
    indicator_type: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db)
) -> CommunityFeedResponse:
    """Retrieves public crowdsourced threat indicators with zero PII exposure."""
    return CommunityThreatService.list_indicators(db, category, indicator_type, limit)


# =============================================================================
# Cross-Device Mobile Handoff & Session Sync
# =============================================================================

class SessionSyncRequest(BaseModel):
    session_id: str = Field(..., min_length=4, max_length=64)
    payload: str = Field(..., max_length=100000)
    source_device: Optional[str] = Field(default="mobile")
    image_preview: Optional[str] = Field(default=None)


class SessionSyncResponse(BaseModel):
    session_id: str
    status: str  # 'waiting', 'ready', 'expired'
    payload: Optional[str] = None
    source_device: Optional[str] = None
    created_at: float
    updated_at: float


# In-memory transient session store with automatic TTL expiration
_DEVICE_SYNC_SESSIONS: Dict[str, Dict[str, Any]] = {}


@router.post(
    "/session/sync",
    response_model=SessionSyncResponse,
    status_code=status.HTTP_200_OK,
    summary="Publish Mobile Upload to Active Desktop Session",
    tags=["Cross-Device Sync"]
)
def publish_session_payload(req: SessionSyncRequest) -> SessionSyncResponse:
    """Receives target payload or decoded QR/image from phone and pairs with active desktop session."""
    now = time.time()
    # Clean up sessions older than 30 minutes
    expired = [k for k, v in _DEVICE_SYNC_SESSIONS.items() if now - v.get("created_at", 0) > 1800]
    for k in expired:
        _DEVICE_SYNC_SESSIONS.pop(k, None)

    session_entry = {
        "session_id": req.session_id,
        "status": "ready",
        "payload": req.payload,
        "source_device": req.source_device,
        "image_preview": req.image_preview,
        "created_at": _DEVICE_SYNC_SESSIONS.get(req.session_id, {}).get("created_at", now),
        "updated_at": now
    }
    _DEVICE_SYNC_SESSIONS[req.session_id] = session_entry
    return SessionSyncResponse(**session_entry)


@router.get(
    "/session/sync/{session_id}",
    response_model=SessionSyncResponse,
    status_code=status.HTTP_200_OK,
    summary="Poll Session Status for Mobile Handoff",
    tags=["Cross-Device Sync"]
)
def get_session_status(session_id: str) -> SessionSyncResponse:
    """Allows desktop workspace to poll for mobile upload completion."""
    now = time.time()
    session = _DEVICE_SYNC_SESSIONS.get(session_id)
    if not session:
        return SessionSyncResponse(
            session_id=session_id,
            status="waiting",
            payload=None,
            source_device=None,
            created_at=now,
            updated_at=now
        )
    return SessionSyncResponse(**session)


