"""CyberShield Nexus — Automated Test Suite for Nexus Innovations

Comprehensive verification covering:
1. Evidence Relationship Intelligence Graph (Core Innovation 1)
2. Golden Hour Incident Response Center (Core Innovation 2)
3. QR Code & UPI Scam Forensics (Core Innovation 3)
4. Email Authentication & Sender Trust (Core Innovation 4)
5. Domain & Brand Trust Intelligence (Core Innovation 5)
6. Website Security Posture Assessment (Core Innovation 6)
7. AI Privacy & PII Redaction Layer (Core Innovation 7)
8. Transparent Analysis Coverage Matrix (Core Innovation 8)
9. Privacy-Preserving Community Threat Feed (Core Innovation 9)
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.models import Base
from app.services.nexus.pii_redactor import PIIRedactor
from app.services.nexus.qr_upi_analyzer import QRUPIAnalyzer
from app.services.nexus.golden_hour import GoldenHourService, IncidentQuestionnaire
from app.services.nexus.graph_service import ThreatGraphService
from app.services.nexus.coverage_matrix import AnalysisCoverageEngine
from app.services.nexus.email_auth import EmailAuthenticationService
from app.services.nexus.domain_intelligence import DomainIntelligenceService
from app.services.nexus.security_posture import WebsiteSecurityPostureService
from app.services.nexus.community_repo import CommunityThreatService, CommunitySubmissionRequest


@pytest.fixture
def in_memory_db():
    """Provides an isolated in-memory SQLite database for test execution."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


# =============================================================================
# 1. AI Privacy & PII Redaction Tests (Core Innovation 7)
# =============================================================================

def test_pii_redaction_phone_email_otp_upi():
    """Verifies that personal identifiers and credentials are masked while preserving local mapping."""
    raw_message = (
        "Dear Customer, your electricity bill of Rs 4500 is unpaid. Call Officer Sharma at +91 98765 43210 "
        "or email billing.support@gmail.com. Transfer immediately to upi_officer@okhdfcbank. Your verification OTP is 849201."
    )

    result = PIIRedactor.redact(raw_message)

    assert result.redaction_applied is True
    assert result.redaction_count >= 4
    assert "+91 98765 43210" not in result.redacted_text
    assert "billing.support@gmail.com" not in result.redacted_text
    assert "849201" not in result.redacted_text
    assert "[REDACTED_PHONE_" in result.redacted_text
    assert "[REDACTED_EMAIL_" in result.redacted_text
    assert "[REDACTED_SECRET_" in result.redacted_text

    # Verify local reversible mapping
    restored = PIIRedactor.restore_evidence(result.redacted_text, result.local_mapping)
    assert "+91 98765 43210" in restored
    assert "billing.support@gmail.com" in restored
    assert "849201" in restored


def test_pii_redaction_benign_text():
    """Verifies that ordinary security indicators and domains are not mistakenly redacted."""
    benign_text = "Checking domain https://example-bank-security.com for malicious redirect chains."
    result = PIIRedactor.redact(benign_text)
    assert result.redaction_count == 0
    assert result.redacted_text == benign_text


# =============================================================================
# 2. QR Code & UPI Scam Forensics Tests (Core Innovation 3)
# =============================================================================

def test_qr_upi_scan_to_receive_fraud():
    """Verifies detection of scan-to-receive predatory lures where victim is tricked into scanning to receive funds."""
    predatory_qr = "upi://pay?pa=fraudster@upi&pn=Receive+Cashback+Rs5000&am=5000&cu=INR&tn=Scan+to+receive+cashback+reward"

    analysis = QRUPIAnalyzer.analyze_payload(predatory_qr)

    assert analysis.payload_type == "upi"
    assert analysis.risk_level in ("Critical", "High")
    assert analysis.risk_score >= 70
    assert any("Scan-to-Receive" in w for w in analysis.warning_signals)
    assert analysis.safe_to_proceed is False


def test_qr_upi_brand_impersonation_vpa():
    """Verifies detection of brand impersonation in the Payee VPA or name."""
    impersonation_qr = "upi://pay?pa=paytm.refund.desk@okhdfcbank&pn=Paytm+Support&am=1200&cu=INR"

    analysis = QRUPIAnalyzer.analyze_payload(impersonation_qr)

    assert analysis.payload_type == "upi"
    assert analysis.risk_score >= 45
    assert any("Brand Impersonation" in w for w in analysis.warning_signals)


def test_qr_upi_benign_merchant():
    """Verifies that standard, legitimate merchant UPI payment QRs are not falsely flagged."""
    normal_qr = "upi://pay?pa=grocerystore@icici&pn=Green+Grocers&am=120&cu=INR&tn=Invoice+104"

    analysis = QRUPIAnalyzer.analyze_payload(normal_qr)

    assert analysis.payload_type == "upi"
    assert analysis.risk_level == "Low"
    assert analysis.risk_score < 25
    assert analysis.safe_to_proceed is True


def test_qr_url_and_wifi_parsing():
    """Verifies classification of web links and zero credential leakage for Wi-Fi profiles."""
    url_qr = "https://secure-login-account-update.xyz/verify"
    url_analysis = QRUPIAnalyzer.analyze_payload(url_qr)
    assert url_analysis.payload_type == "url"
    assert url_analysis.safe_to_proceed is False

    wifi_qr = "WIFI:S:MyCorporateCafe;T:WPA;P:SuperSecretPassword123;;"
    wifi_analysis = QRUPIAnalyzer.analyze_payload(wifi_qr)
    assert wifi_analysis.payload_type == "wifi"
    assert "SuperSecretPassword123" not in wifi_analysis.raw_payload  # Password redacted in summary


# =============================================================================
# 3. Golden Hour Incident Response Center Tests (Core Innovation 2)
# =============================================================================

def test_golden_hour_financial_emergency():
    """Verifies activation of Golden Hour protocol, 1930 helpline, and bank contact guidance."""
    q = IncidentQuestionnaire(
        scenario_type="scenario_d",
        time_elapsed="< 1 hour",
        money_transferred=True,
        amount_transferred="25000",
        transaction_id_or_utr="409182736451",
        bank_or_app_name="State Bank of India"
    )

    plan = GoldenHourService.generate_response_plan(q)

    assert plan.golden_hour_active is True
    assert "CRITICAL GOLDEN HOUR" in plan.golden_hour_warning
    assert len(plan.immediate_checklist) >= 3
    # Step 1 must be calling 1930
    assert plan.immediate_checklist[0].action_target == "tel:1930"
    # Step 2 must be bank fraud desk
    assert "Bank" in plan.immediate_checklist[1].title
    assert any("1930" in h["contact"] for h in plan.official_helplines)
    assert "Never promises or guarantees fund recovery" in plan.disclaimer or "do not promise or guarantee fund recovery" in plan.disclaimer.lower()


def test_golden_hour_apk_compromise():
    """Verifies device isolation guidance (Airplane Mode) when suspicious APK is installed."""
    q = IncidentQuestionnaire(
        scenario_type="scenario_e",
        time_elapsed="1-3 hours",
        app_installed=True,
        installed_app_name="AnyDesk Support App"
    )

    plan = GoldenHourService.generate_response_plan(q)

    assert "Airplane Mode" in plan.immediate_checklist[0].title
    assert plan.immediate_checklist[0].action_type == "DEVICE_SETTING"


# =============================================================================
# 4. Evidence Relationship Intelligence Graph Tests (Core Innovation 1)
# =============================================================================

def test_threat_graph_ingestion_and_subgraph(in_memory_db):
    """Verifies entity extraction, edge distinction (verified vs inferred), and multi-hop queries."""
    scan_id = "test-scan-uuid-1"
    extracted = {
        "urls": ["https://phish-login.net/auth"],
        "domains": ["phish-login.net"],
        "emails": ["attacker@phish-login.net"],
        "phone_numbers": ["+919876543210"]
    }

    # Ingest Scan
    entities = ThreatGraphService.ingest_scan(
        db=in_memory_db,
        scan_id=scan_id,
        scan_type="url",
        target="https://phish-login.net/auth",
        risk_level="Critical",
        extracted_indicators=extracted,
        technical_data={"resolved_ips": ["198.51.100.42"]},
        brand_detected="SBI"
    )

    assert len(entities) >= 5

    # Query Subgraph
    graph = ThreatGraphService.get_subgraph(db=in_memory_db, scan_id=scan_id, hops=2)

    assert graph["stats"]["total_nodes"] >= 5
    assert graph["stats"]["total_edges"] >= 4
    assert graph["stats"]["verified_edges"] >= 3
    assert graph["stats"]["inferred_edges"] >= 1  # Brand impersonation is inferred (dashed)

    # Verify solid vs dashed edge distinction
    for edge in graph["edges"]:
        if edge["relationship"] == "SAME_BRAND_IMPERSONATION":
            assert edge["is_verified"] is False
        elif edge["relationship"] in ("EXACT_DOMAIN_MATCH", "SAME_IP", "SAME_PHONE"):
            assert edge["is_verified"] is True


# =============================================================================
# 5. Email Authentication & Sender Trust Tests (Core Innovation 4)
# =============================================================================

def test_email_auth_display_name_spoofing():
    """Verifies detection of free webmail domain with corporate brand display name."""
    raw_email = (
        "From: \"PayPal Security Alert\" <security-alert@gmail.com>\n"
        "Reply-To: refund-collector@yahoo.com\n"
        "Subject: Your account has been limited\n"
        "Received-SPF: softfail\n\n"
        "Dear customer, please click the link below to verify your account."
    )

    res = EmailAuthenticationService.authenticate_email(raw_email)

    assert res.has_headers is True
    assert res.alignment_verified is False  # gmail vs yahoo mismatch
    assert any("Display Name Spoofing" in w for w in res.warning_signals)
    assert any("Domain Alignment Mismatch" in w for w in res.warning_signals)
    assert res.risk_level in ("Critical", "High")


def test_email_auth_plain_text_honest_unavailability():
    """Verifies that plain text messages without RFC headers are honestly marked NOT_AVAILABLE."""
    plain_text = "Hey, you won 10,000 rupees. Call +91 9876543210 to claim."
    res = EmailAuthenticationService.authenticate_email(plain_text)

    assert res.has_headers is False
    assert res.spf_status == "NOT_AVAILABLE"
    assert res.dkim_status == "NOT_AVAILABLE"
    assert res.dmarc_status == "NOT_AVAILABLE"


# =============================================================================
# 6. Domain & Brand Trust Intelligence Tests (Core Innovation 5)
# =============================================================================

@pytest.mark.asyncio
async def test_brand_impersonation_detection():
    """Verifies detection of typosquatting, subdomain deception, and homoglyphs."""
    # Subdomain trick
    res_subdomain = await DomainIntelligenceService.investigate_domain("sbi.co.in.scam-portal.xyz")
    assert len(res_subdomain.brand_findings) >= 1
    assert any(b.brand_name == "sbi" for b in res_subdomain.brand_findings)

    # Keyword typosquatting
    res_keyword = await DomainIntelligenceService.investigate_domain("paytm-kyc-verify.com")
    assert len(res_keyword.brand_findings) >= 1
    assert any(b.brand_name == "paytm" for b in res_keyword.brand_findings)

    # IDN / Punycode
    res_punycode = await DomainIntelligenceService.investigate_domain("xn--app-9ka.com")
    assert len(res_punycode.brand_findings) >= 1


# =============================================================================
# 7. Website Security Posture Assessment Tests (Core Innovation 6)
# =============================================================================

def test_security_posture_hygiene_grading():
    """Verifies independent evaluation of defensive headers and posture grading."""
    # Fortified configuration
    hardened_headers = {
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
        "Content-Security-Policy": "default-src 'self'",
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=()"
    }
    assessment_strong = WebsiteSecurityPostureService.evaluate_headers("https://trusted-bank.com", hardened_headers)
    assert assessment_strong.posture_grade in ("A+", "A")
    assert assessment_strong.enforced_controls_count == 6

    # Missing critical headers
    bare_headers = {"Server": "Apache"}
    assessment_weak = WebsiteSecurityPostureService.evaluate_headers("https://legacy-site.org", bare_headers)
    assert assessment_weak.posture_grade in ("D", "F")
    assert assessment_weak.missing_controls_count == 6


# =============================================================================
# 8. Transparent Analysis Coverage Matrix Tests (Core Innovation 8)
# =============================================================================

def test_coverage_matrix_honesty():
    """Verifies that missing providers are labeled as UNAVAILABLE or WARNING, never silently clean."""
    matrix = AnalysisCoverageEngine.build_url_coverage(
        preflight=None,
        technical=None,
        threat_providers=None,
        rdap_status="UNAVAILABLE",
        ct_status="UNAVAILABLE"
    )

    assert matrix.checks_unavailable >= 3
    assert matrix.verdict_conclusive is False
    assert any("INCONCLUSIVE" in lim for lim in matrix.limitations)


# =============================================================================
# 9. Privacy-Preserving Community Threat Intelligence Tests (Core Innovation 9)
# =============================================================================

def test_community_submission_consent_and_sanitization(in_memory_db):
    """Verifies that user consent is enforced and indicators/notes are defanged and scrubbed."""
    # Test 1: Consent missing -> rejected
    with pytest.raises(ValueError, match="Explicit user consent is mandatory"):
        CommunityThreatService.submit_indicator(
            in_memory_db,
            CommunitySubmissionRequest(
                indicator_type="url",
                indicator_value="http://malicious-login.com",
                category="phishing",
                user_consent=False
            )
        )

    # Test 2: Valid submission -> URL defanged and PII in notes scrubbed
    sub = CommunityThreatService.submit_indicator(
        in_memory_db,
        CommunitySubmissionRequest(
            indicator_type="url",
            indicator_value="http://evil-tracker.com",
            category="malware",
            reporter_notes="The scammer called me from +91 9988776655 claiming my power was out.",
            user_consent=True
        )
    )

    assert "[.]" in sub.indicator_value or "hxxp" in sub.indicator_value
    assert "+91 9988776655" not in sub.reporter_notes
    assert "[REDACTED_PHONE_" in sub.reporter_notes

    feed = CommunityThreatService.list_indicators(in_memory_db)
    assert feed.total >= 1
    assert "Zero-PII Policy" in feed.policy_notice


# =============================================================================
# 10. Master Investigation Endpoints for QR and Email Tests
# =============================================================================

@pytest.mark.asyncio
async def test_scan_qr_master_endpoint(in_memory_db):
    """Verifies that POST /scans/qr creates a canonical Scan, RiskReport, and SHA-256 hash."""
    from app.api.v1.router import scan_qr_master
    from app.schemas.scan import QRScanMasterRequest
    from app.database.models import Scan, RiskReport

    req = QRScanMasterRequest(
        payload="upi://pay?pa=refund-support@okhdfcbank&pn=Paytm+Helpdesk&am=4500&cu=INR&tn=Scan+to+receive+cashback"
    )

    resp = await scan_qr_master(req, in_memory_db)

    assert resp.scan_id is not None
    assert resp.scan_type == "qr"
    assert resp.risk_level == "Critical"
    assert resp.risk_score >= 45
    assert len(resp.report.report_hash) == 64
    assert any("Scan-to-Receive Fraud" in ev for ev in resp.report.evidence)

    # Verify DB persistence
    saved_scan = in_memory_db.query(Scan).filter_by(id=resp.scan_id).first()
    assert saved_scan is not None
    assert saved_scan.status == "completed"

    saved_report = in_memory_db.query(RiskReport).filter_by(scan_id=resp.scan_id).first()
    assert saved_report is not None
    assert saved_report.report_hash == resp.report.report_hash


@pytest.mark.asyncio
async def test_scan_email_master_endpoint(in_memory_db):
    """Verifies that POST /scans/email creates a canonical Scan, RiskReport, and SHA-256 hash."""
    from app.api.v1.router import scan_email_master
    from app.schemas.scan import EmailScanMasterRequest
    from app.database.models import Scan, RiskReport

    email_text = (
        "From: \"PayPal Verification\" <spoof@paypal-security-alert.xyz>\n"
        "Reply-To: phisher-collect@scam-destination.com\n"
        "Subject: Urgent: Verify Account Before Suspension\n"
        "To: user@example.com\n\n"
        "Please confirm your account immediately."
    )

    req = EmailScanMasterRequest(content=email_text)
    resp = await scan_email_master(req, in_memory_db)

    assert resp.scan_id is not None
    assert resp.scan_type == "email"
    assert resp.risk_level in ["High", "Critical"]
    assert len(resp.report.report_hash) == 64
    assert any("Reply-To" in ev or "SPF" in ev or "domain" in ev for ev in resp.report.evidence)

    # Verify DB persistence
    saved_scan = in_memory_db.query(Scan).filter_by(id=resp.scan_id).first()
    assert saved_scan is not None
    assert saved_scan.status == "completed"

    saved_report = in_memory_db.query(RiskReport).filter_by(scan_id=resp.scan_id).first()
    assert saved_report is not None
    assert saved_report.report_hash == resp.report.report_hash
