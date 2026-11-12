"""CyberShield Nexus — QR Code & UPI Scam Analyzer (Core Innovation 3)

Parses, classifies, and audits decoded QR payloads and UPI payment URIs
for deceptive social engineering, scan-to-receive payment fraud, brand impersonation,
and fraudulent refund lures.

Strictly adheres to:
- No outbound payment initiation.
- No automatic URL dereferencing.
- Zero credential exposure (Wi-Fi passwords/PINs never dispatched to AI).
- Explicit distinction between benign merchant requests and confirmed scam lures.
"""

import re
import urllib.parse
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class UPIPayloadDetails(BaseModel):
    """Parsed NPCI UPI payment URI metadata."""
    payee_vpa: Optional[str] = None
    payee_name: Optional[str] = None
    amount: Optional[str] = None
    currency: Optional[str] = "INR"
    transaction_note: Optional[str] = None
    transaction_ref: Optional[str] = None
    merchant_code: Optional[str] = None
    raw_query: Dict[str, str] = Field(default_factory=dict)


class QRAnalysisResult(BaseModel):
    """Unified QR investigation finding."""
    payload_type: str  # 'upi', 'url', 'wifi', 'vcard', 'text', 'unknown'
    raw_payload: str
    decoded_summary: str
    risk_level: str  # 'Critical', 'High', 'Medium', 'Low', 'Benign'
    risk_score: int  # 0 - 100
    upi_details: Optional[UPIPayloadDetails] = None
    warning_signals: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    evidence: List[str] = Field(default_factory=list)
    safe_to_proceed: bool = False
    requires_precaution: bool = True


class QRUPIAnalyzer:
    """Investigates decoded QR payloads and flags predatory UPI schemes."""

    SUSPICIOUS_LURE_PATTERNS = [
        (re.compile(r"""(?i)\b(?:scan\s+to\s+receive|receive\s+money|receive\s+cash|get\s+paid|accept\s+payment)\b"""),
         "Critical Scan-to-Receive Fraud: Scanning a UPI QR code ALWAYS deducts money from your account. You NEVER need to scan a QR code or enter your UPI PIN to receive money.", 45),
        (re.compile(r"""(?i)\b(?:refund|cashback|reward|lottery|prize|bonus|kbc|lucky\s+draw)\b"""),
         "Deceptive Financial Lure: Payment payload is framed as a 'refund', 'cashback', or 'prize reward'.", 35),
        (re.compile(r"""(?i)\b(?:electricity|bill\s+update|kyc|pan\s+update|account\s+block|sim\s+block)\b"""),
         "Urgent Utility/KYC Coercion Lure: Common pretext used by cybercriminals to coerce immediate payment.", 30),
        (re.compile(r"""(?i)\b(?:customer\s*care|support\s*helpline|helpdesk|service\s*desk)\b"""),
         "Customer Support Impersonation: Fraudulent support desk pretending to provide assistance.", 25),
    ]

    BRAND_IMPERSONATION_VPA = [
        ("paytm", re.compile(r"""(?i)\b(?:paytm.*support|paytm.*refund|paytm.*kyc|paytm.*help)\b""")),
        ("phonepe", re.compile(r"""(?i)\b(?:phonepe.*support|phonepe.*reward|phonepe.*cashback|phonepe.*help)\b""")),
        ("googlepay", re.compile(r"""(?i)\b(?:gpay.*support|googlepay.*reward|gpay.*refund)\b""")),
        ("sbi", re.compile(r"""(?i)\b(?:sbi.*reward|sbi.*kyc|sbi.*yono|sbi.*helpline)\b""")),
        ("hdfc", re.compile(r"""(?i)\b(?:hdfc.*netbanking|hdfc.*kyc|hdfc.*reward)\b""")),
        ("amazon", re.compile(r"""(?i)\b(?:amazon.*pay.*refund|amazon.*reward|amazon.*lucky)\b""")),
    ]

    @classmethod
    def analyze_payload(cls, payload: str) -> QRAnalysisResult:
        """Audits any decoded string payload from a QR code."""
        cleaned = (payload or "").strip()
        if not cleaned:
            return QRAnalysisResult(
                payload_type="unknown",
                raw_payload="",
                decoded_summary="Empty QR payload",
                risk_level="Low",
                risk_score=0,
                warning_signals=["QR code contains no readable data."],
                recommendations=["Verify camera alignment or image resolution."],
                evidence=["Empty payload received."],
                safe_to_proceed=False,
                requires_precaution=False
            )

        # 1. UPI Payment URI (upi://pay?...)
        if cleaned.lower().startswith("upi://pay"):
            return cls._analyze_upi(cleaned)

        # 2. HTTP / HTTPS URL
        if cleaned.lower().startswith(("http://", "https://", "hxxp://", "hxxps://")):
            return cls._analyze_url(cleaned)

        # 3. Wi-Fi Configuration (WIFI:S:NetworkName;T:WPA;P:Password;;)
        if cleaned.upper().startswith("WIFI:"):
            return cls._analyze_wifi(cleaned)

        # 4. vCard / Contact
        if "BEGIN:VCARD" in cleaned.upper():
            return cls._analyze_vcard(cleaned)

        # 5. Generic Text
        return cls._analyze_generic_text(cleaned)

    @classmethod
    def _analyze_upi(cls, upi_uri: str) -> QRAnalysisResult:
        """Detailed parsing and audit of NPCI UPI payment URIs."""
        parsed = urllib.parse.urlparse(upi_uri)
        query_params = urllib.parse.parse_qs(parsed.query)
        flat_query = {k: v[0] for k, v in query_params.items() if v}

        pa = flat_query.get("pa", "").strip()  # Payee VPA
        pn = flat_query.get("pn", "").strip()  # Payee Name
        am = flat_query.get("am", "").strip()  # Amount
        cu = flat_query.get("cu", "INR").strip()  # Currency
        tn = flat_query.get("tn", "").strip()  # Transaction Note
        tr = flat_query.get("tr", "").strip()  # Transaction Reference
        mc = flat_query.get("mc", "").strip()  # Merchant Code

        upi_details = UPIPayloadDetails(
            payee_vpa=pa,
            payee_name=pn,
            amount=am,
            currency=cu,
            transaction_note=tn,
            transaction_ref=tr,
            merchant_code=mc,
            raw_query=flat_query
        )

        warning_signals: List[str] = []
        evidence: List[str] = [
            f"Decoded UPI Payee VPA: {pa if pa else 'UNSPECIFIED'}",
            f"Decoded Payee Display Name: {pn if pn else 'UNSPECIFIED'}",
        ]
        if am:
            evidence.append(f"Hardcoded Payment Amount: {cu} {am}")
        if tn:
            evidence.append(f"Embedded Transaction Note: '{tn}'")

        risk_score = 0

        # Check 1: Mandatory VPA check
        if not pa:
            warning_signals.append("Malformed UPI URI: Missing payee address ('pa').")
            risk_score += 25

        # Check 2: Scan-to-Receive Fraud & Deceptive Lures in Note or Payee Name
        text_corpus = f"{pn} {tn} {pa}"
        for pattern, warning_msg, penalty in cls.SUSPICIOUS_LURE_PATTERNS:
            if pattern.search(text_corpus):
                warning_signals.append(warning_msg)
                evidence.append(f"Indicator detected: {warning_msg}")
                risk_score += penalty

        # Check 3: Brand Impersonation in VPA or Name
        for brand, regex in cls.BRAND_IMPERSONATION_VPA:
            if regex.search(text_corpus):
                warning_msg = f"Suspected Brand Impersonation: Payee identity mimics trusted entity '{brand.upper()}'."
                warning_signals.append(warning_msg)
                evidence.append(warning_msg)
                risk_score += 35

        # Check 4: Pre-filled high amount
        if am:
            try:
                amt_val = float(am)
                if amt_val >= 5000:
                    warning_signals.append(f"High Pre-filled Amount: QR directly requests {cu} {amt_val:,.2f}.")
                    risk_score += 15
            except ValueError:
                pass

        # Risk level categorization
        risk_score = min(100, risk_score)
        if risk_score >= 70:
            risk_level = "Critical"
        elif risk_score >= 45:
            risk_level = "High"
        elif risk_score >= 25:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # Contextual recommendations
        recommendations = [
            "REMEMBER: You NEVER need to enter your UPI PIN or scan a QR code to receive money.",
            "Verify the payee's actual registered bank name displayed in your UPI app before authorising any transaction.",
            "Never approve collect requests or scan QR codes sent by unknown buyers on marketplaces (e.g. OLX, Quikr).",
            "If suspicious, report the VPA immediately to the National Cyber Crime Portal (1930 / cybercrime.gov.in)."
        ]

        summary = (
            f"UPI Payment QR targeting {pa} ({pn or 'Unknown'}). "
            + (f"Warning: {len(warning_signals)} fraud indicators identified." if warning_signals else "Valid standard UPI payment format.")
        )

        return QRAnalysisResult(
            payload_type="upi",
            raw_payload=upi_uri,
            decoded_summary=summary,
            risk_level=risk_level,
            risk_score=risk_score,
            upi_details=upi_details,
            warning_signals=warning_signals,
            recommendations=recommendations,
            evidence=evidence,
            safe_to_proceed=risk_score < 25,
            requires_precaution=risk_score >= 25
        )

    @classmethod
    def _analyze_url(cls, url: str) -> QRAnalysisResult:
        """Audits QR code leading to a web destination."""
        clean_url = url.replace("hxxp://", "http://").replace("hxxps://", "https://")
        warning_signals: List[str] = [
            "QR code opens an external web page. Avoid entering passwords, OTPs, or banking details if unfamiliar."
        ]
        evidence: List[str] = [f"Decoded Target URL: {clean_url}"]

        # Check for deceptive schemes or IP hosts
        parsed = urllib.parse.urlparse(clean_url)
        risk_score = 15
        if re.match(r"^(\d{1,3}\.){3}\d{1,3}$", parsed.hostname or ""):
            warning_signals.append("Destination uses a raw numeric IP address instead of a recognized domain name.")
            risk_score += 30

        if "@" in parsed.netloc:
            warning_signals.append("URL contains an embedded userinfo '@' credential symbol, often used for phishing obfuscation.")
            risk_score += 40

        risk_level = "High" if risk_score >= 45 else ("Medium" if risk_score >= 25 else "Low")

        return QRAnalysisResult(
            payload_type="url",
            raw_payload=url,
            decoded_summary=f"Web Link QR pointing to '{parsed.hostname or clean_url}'. Submit URL to CyberShield URL Scanner for deep forensics.",
            risk_level=risk_level,
            risk_score=risk_score,
            warning_signals=warning_signals,
            recommendations=[
                "Do NOT open the URL automatically.",
                "Submit this link directly to CyberShield's Master URL Scanner for full DNS, TLS, and Threat Intel inspection.",
                "Verify the domain address carefully for typosquatting before proceeding."
            ],
            evidence=evidence,
            safe_to_proceed=False,
            requires_precaution=True
        )

    @classmethod
    def _analyze_wifi(cls, payload: str) -> QRAnalysisResult:
        """Audits Wi-Fi auto-connect configuration QR."""
        ssid_match = re.search(r"S:([^;]+)", payload)
        type_match = re.search(r"T:([^;]+)", payload)
        ssid = ssid_match.group(1) if ssid_match else "Hidden/Unknown"
        auth_type = type_match.group(1) if type_match else "WPA"

        warning_signals = [
            "Auto-connects device to a Wi-Fi network. Rogue Wi-Fi access points can perform Man-In-The-Middle (MITM) attacks and monitor unencrypted network traffic."
        ]
        if auth_type.upper() == "NOPASS":
            warning_signals.append("Unencrypted Open Network (NOPASS): Zero encryption on wireless transmissions.")

        return QRAnalysisResult(
            payload_type="wifi",
            raw_payload="WIFI:S:[REDACTED];T:[REDACTED];P:[REDACTED];;",
            decoded_summary=f"Wi-Fi Connection Profile for SSID '{ssid}' ({auth_type}).",
            risk_level="Medium" if auth_type.upper() == "NOPASS" else "Low",
            risk_score=35 if auth_type.upper() == "NOPASS" else 20,
            warning_signals=warning_signals,
            recommendations=[
                f"Verify physical authenticity of SSID '{ssid}' with venue staff before connecting.",
                "Use a trusted VPN if connecting to public or unverified wireless networks.",
                "Disable automatic network reconnect when leaving the area."
            ],
            evidence=[f"Network SSID: '{ssid}'", f"Authentication Protocol: {auth_type}"],
            safe_to_proceed=False,
            requires_precaution=True
        )

    @classmethod
    def _analyze_vcard(cls, payload: str) -> QRAnalysisResult:
        """Audits contact card QR payload."""
        fn_match = re.search(r"(?i)\bFN:([^\r\n]+)", payload)
        tel_match = re.search(r"(?i)\bTEL[^:]*:([^\r\n]+)", payload)
        name = fn_match.group(1).strip() if fn_match else "Unnamed Contact"
        phone = tel_match.group(1).strip() if tel_match else "Not provided"

        return QRAnalysisResult(
            payload_type="vcard",
            raw_payload=payload[:200] + ("..." if len(payload) > 200 else ""),
            decoded_summary=f"Contact Card (vCard) for '{name}' (Phone: {phone}).",
            risk_level="Low",
            risk_score=10,
            warning_signals=["Confirm identity of contact before importing into your address book."],
            recommendations=["Check for impersonation of executive officers or financial institutions."],
            evidence=[f"Contact Name: {name}", f"Contact Phone: {phone}"],
            safe_to_proceed=True,
            requires_precaution=False
        )

    @classmethod
    def _analyze_generic_text(cls, payload: str) -> QRAnalysisResult:
        """Audits unclassified textual QR payloads."""
        snippet = payload[:120] + ("..." if len(payload) > 120 else "")
        return QRAnalysisResult(
            payload_type="text",
            raw_payload=payload[:300],
            decoded_summary=f"Text content: '{snippet}'",
            risk_level="Low",
            risk_score=5,
            warning_signals=[],
            recommendations=["Verify the purpose of this text before executing instructions."],
            evidence=[f"Length: {len(payload)} characters"],
            safe_to_proceed=True,
            requires_precaution=False
        )
