"""CyberShield Nexus — Golden Hour Incident Response Center (Core Innovation 2)

Provides urgent, contextual, and evidence-guided action checklists for scam victims.
Structured around the critical 1-to-3-hour 'Golden Hour' window when financial lien
placements and account freezes via official nodal authorities have peak efficacy.

Explicit Principles:
- Verified Indian cybercrime reporting infrastructure: Helpline 1930 & https://cybercrime.gov.in/.
- Never promises guaranteed fund recovery (strictly honest, realistic expectations).
- Prioritizes forensic evidence preservation (screenshots, SMS headers, UTRs) before destructive resets.
- Zero credential collection (never asks user for OTPs, PINs, or active passwords).
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class IncidentQuestionnaire(BaseModel):
    """User input representing the incident context."""
    scenario_type: str = Field(..., description="scenario_a, scenario_b, scenario_c, scenario_d, or scenario_e")
    time_elapsed: str = Field(default="< 1 hour", description="< 1 hour, 1-3 hours, 3-24 hours, > 24 hours")
    money_transferred: bool = Field(default=False)
    amount_transferred: Optional[str] = None
    transaction_id_or_utr: Optional[str] = None
    bank_or_app_name: Optional[str] = None
    credentials_entered: bool = Field(default=False)
    account_or_service: Optional[str] = None
    app_installed: bool = Field(default=False)
    installed_app_name: Optional[str] = None
    device_accessible: bool = Field(default=True)


class ChecklistItem(BaseModel):
    """Prioritized response step."""
    step_number: int
    title: str
    urgency: str  # 'IMMEDIATE', 'HIGH', 'MEDIUM', 'FOLLOW_UP'
    description: str
    action_type: str  # 'CALL', 'VISIT_URL', 'DEVICE_SETTING', 'BANK_ACTION', 'DOCUMENTATION'
    action_target: Optional[str] = None
    verified_channel: Optional[str] = None
    evidence_tips: Optional[str] = None


class GoldenHourResponse(BaseModel):
    """Contextual incident response action package."""
    scenario_title: str
    severity_assessment: str
    golden_hour_active: bool
    golden_hour_warning: str
    official_helplines: List[Dict[str, str]]
    immediate_checklist: List[ChecklistItem]
    evidence_preservation_guide: List[str]
    disclaimer: str


class GoldenHourService:
    """Generates tailored response workflows based on the victim's timeline and exposure."""

    OFFICIAL_HELPLINES = [
        {
            "name": "National Cyber Crime Helpline (India)",
            "contact": "1930",
            "type": "Toll-Free Phone",
            "hours": "24x7",
            "jurisdiction": "All Indian States & UTs (Citizen Financial Cyber Fraud Reporting System)",
            "official_url": "https://cybercrime.gov.in/"
        },
        {
            "name": "National Cyber Crime Reporting Portal",
            "contact": "https://cybercrime.gov.in/",
            "type": "Official Web Portal",
            "hours": "24x7",
            "jurisdiction": "Ministry of Home Affairs (MHA), Government of India",
            "official_url": "https://cybercrime.gov.in/"
        },
        {
            "name": "RBI Sachet Portal (Unauthorised Deposit/Lending Schemes)",
            "contact": "https://sachet.rbi.org.in/",
            "type": "Financial Regulatory Portal",
            "hours": "24x7",
            "jurisdiction": "Reserve Bank of India",
            "official_url": "https://sachet.rbi.org.in/"
        },
        {
            "name": "DoT Chakshu Facility (Report Fraudulent Communication)",
            "contact": "https://sancharsaathi.gov.in/sfc/",
            "type": "Telecom Security Portal",
            "hours": "24x7",
            "jurisdiction": "Department of Telecommunications, India",
            "official_url": "https://sancharsaathi.gov.in/sfc/"
        }
    ]

    SCENARIO_METADATA = {
        "scenario_a": {
            "title": "Scenario A: Suspicious Message / SMS Received (No Link Clicked)",
            "severity": "Low Risk / Precautionary",
            "summary": "You received an unsolicited message with lures or threats, but took no action. Your device and accounts remain intact."
        },
        "scenario_b": {
            "title": "Scenario B: Suspicious Link Clicked (No Information Entered)",
            "severity": "Medium Risk / Monitoring",
            "summary": "You visited an untrusted webpage, but did not submit credentials, OTPs, or financial information."
        },
        "scenario_c": {
            "title": "Scenario C: Credentials, Passwords, or OTP Entered",
            "severity": "High Risk / Active Credential Threat",
            "summary": "Attacker has acquired user identifiers, access passwords, or live multi-factor verification tokens."
        },
        "scenario_d": {
            "title": "Scenario D: Money Transferred via UPI, NetBanking, or Card",
            "severity": "CRITICAL EMERGENCY / Active Financial Loss",
            "summary": "Funds have been debited from your bank account or card. Immediate action required under the Golden Hour protocol."
        },
        "scenario_e": {
            "title": "Scenario E: Suspicious APK / Remote-Access Software Installed",
            "severity": "CRITICAL EMERGENCY / Device Compromise",
            "summary": "Malicious APK or remote-control application (AnyDesk, QuickSupport, TeamViewer) installed on the device."
        }
    }

    @classmethod
    def get_supported_scenarios(cls) -> Dict[str, Any]:
        """Returns standard scenarios and questions for frontend display."""
        return {
            "scenarios": cls.SCENARIO_METADATA,
            "helplines": cls.OFFICIAL_HELPLINES,
            "time_windows": ["< 1 hour", "1-3 hours", "3-24 hours", "> 24 hours"]
        }

    @classmethod
    def generate_response_plan(cls, q: IncidentQuestionnaire) -> GoldenHourResponse:
        """Synthesizes a prioritized response checklist tailored to the victim's situation."""
        meta = cls.SCENARIO_METADATA.get(q.scenario_type, cls.SCENARIO_METADATA["scenario_a"])
        checklist: List[ChecklistItem] = []
        evidence_preservation: List[str] = []

        is_golden_hour = q.time_elapsed in ("< 1 hour", "1-3 hours") and (q.money_transferred or q.scenario_type == "scenario_d")
        gh_warning = (
            "🚨 CRITICAL GOLDEN HOUR ACTIVE: You are within the 1-to-3-hour window. Call 1930 IMMEDIATELY! "
            "Police nodal officers can place an immediate freeze or lien on the fraudster's beneficiary wallet/account."
            if is_golden_hour
            else "Standard incident containment procedures apply. Follow the prioritized actions below."
        )

        step_counter = 1

        # =========================================================================
        # Scenario D or Money Transferred: Financial Containment
        # =========================================================================
        if q.scenario_type == "scenario_d" or q.money_transferred:
            bank_str = f" ({q.bank_or_app_name})" if q.bank_or_app_name else ""
            checklist.append(ChecklistItem(
                step_number=step_counter,
                title="Call National Cyber Crime Helpline (1930) IMMEDIATELY",
                urgency="IMMEDIATE",
                description="Dial 1930 immediately. Provide the fraud amount, beneficiary UPI VPA or account number, and transaction UTR reference to initiate an urgent nodal freeze.",
                action_type="CALL",
                action_target="tel:1930",
                verified_channel="National Toll-Free Helpline: 1930",
                evidence_tips="Have your 12-digit UPI UTR or bank transaction reference number ready before dialing."
            ))
            step_counter += 1

            checklist.append(ChecklistItem(
                step_number=step_counter,
                title=f"Contact Your Bank's Fraud Prevention Cell{bank_str}",
                urgency="IMMEDIATE",
                description="Call your bank using ONLY the verified toll-free number printed on the back of your debit card or official mobile banking app. Request an immediate block on UPI, netbanking, and debit cards.",
                action_type="BANK_ACTION",
                action_target="Official Bank Fraud Desk",
                verified_channel="Look on the physical bank card or official app. Never use Google search for bank customer care numbers.",
                evidence_tips="Ask the bank executive for a formal Incident / Complaint Acknowledgement Number."
            ))
            step_counter += 1

            checklist.append(ChecklistItem(
                step_number=step_counter,
                title="Lodge Formal Complaint on National Cyber Crime Portal",
                urgency="HIGH",
                description="File a complaint on https://cybercrime.gov.in/ under 'Report Cyber Crime' -> 'Financial Fraud'. Upload payment screenshots, bank statement, and transaction references.",
                action_type="VISIT_URL",
                action_target="https://cybercrime.gov.in/",
                verified_channel="https://cybercrime.gov.in/ (Official Government of India portal)",
                evidence_tips="Download and save the official complaint PDF receipt with Acknowledgement Number."
            ))
            step_counter += 1

            evidence_preservation.extend([
                "Take full-screen screenshots of the debit SMS, UPI transaction receipt, and beneficiary account/VPA.",
                "Note down the 12-digit UTR (Unique Transaction Reference) number from your bank statement.",
                "Do NOT delete any SMS messages, WhatsApp chats, or call records from the scammer."
            ])

        # =========================================================================
        # Scenario E or App Installed: Device Integrity & Isolation
        # =========================================================================
        if q.scenario_type == "scenario_e" or q.app_installed:
            app_str = f" ('{q.installed_app_name}')" if q.installed_app_name else ""
            checklist.append(ChecklistItem(
                step_number=step_counter,
                title=f"Isolate Device Immediately (Enable Airplane Mode){app_str}",
                urgency="IMMEDIATE",
                description="Turn on Airplane Mode immediately and disconnect Wi-Fi. This severs the remote attacker's telemetry, live screen sharing, and SMS interception channel.",
                action_type="DEVICE_SETTING",
                action_target="Device Settings -> Airplane Mode",
                verified_channel="Local device hardware controls",
                evidence_tips="Photograph the device screen using another phone before disconnecting if active remote control is occurring."
            ))
            step_counter += 1

            checklist.append(ChecklistItem(
                step_number=step_counter,
                title="Revoke Device Administrator & Accessibility Permissions",
                urgency="HIGH",
                description="Navigate to Settings -> Security -> Device Admin Apps (and Accessibility Services). Check for suspicious entries (e.g. QuickSupport, AnyDesk, unknown APKs) and revoke permissions.",
                action_type="DEVICE_SETTING",
                action_target="Settings -> Security -> Device Admin",
                verified_channel="Android/iOS System Settings",
                evidence_tips="Record the exact package name or app name before uninstallation."
            ))
            step_counter += 1

            checklist.append(ChecklistItem(
                step_number=step_counter,
                title="Uninstall Suspicious Application and Run Play Protect",
                urgency="HIGH",
                description="Uninstall the malicious application. Open Google Play Store -> Settings -> Play Protect -> Scan to identify residual compromised modules.",
                action_type="DEVICE_SETTING",
                action_target="Settings -> Apps -> Uninstall",
                verified_channel="Google Play Protect / Apple App Store",
                evidence_tips="Ensure transaction evidence is preserved before performing any deeper factory reset."
            ))
            step_counter += 1

            evidence_preservation.extend([
                "Do NOT factory reset the phone immediately if financial loss occurred: Police forensic teams need message logs.",
                "Capture screenshots of recent app downloads and permissions granted."
            ])

        # =========================================================================
        # Scenario C or Credentials Entered: Credential Revocation
        # =========================================================================
        if q.scenario_type == "scenario_c" or q.credentials_entered:
            acc_str = f" for '{q.account_or_service}'" if q.account_or_service else ""
            checklist.append(ChecklistItem(
                step_number=step_counter,
                title=f"Change Master Password from an Independent Clean Device{acc_str}",
                urgency="IMMEDIATE",
                description="Using a known-clean computer or phone (NOT the compromised device), log in to the official service website and change your password immediately.",
                action_type="VISIT_URL",
                action_target="Official Service Provider Website",
                verified_channel="Always type the URL manually in browser or use official mobile app.",
                evidence_tips="Choose a strong, unique 16+ character passphrase not reused elsewhere."
            ))
            step_counter += 1

            checklist.append(ChecklistItem(
                step_number=step_counter,
                title="Terminate All Active Remote Sessions ('Log Out Everywhere')",
                urgency="IMMEDIATE",
                description="Go to the service's Security settings and select 'Sign out of all other sessions / devices'. This revokes session tokens the attacker may have cloned.",
                action_type="VISIT_URL",
                action_target="Account Security -> Active Sessions",
                verified_channel="Official Account Management Dashboard",
                evidence_tips="Check for unfamiliar IP addresses, locations, or browser sessions in login history."
            ))
            step_counter += 1

            checklist.append(ChecklistItem(
                step_number=step_counter,
                title="Re-enroll Multi-Factor Authentication (MFA) via Authenticator App",
                urgency="HIGH",
                description="Replace SMS-based OTP verification with an Authenticator App (Google Authenticator, Microsoft Authenticator) or hardware security key (FIDO2) to prevent SIM-swap attacks.",
                action_type="VISIT_URL",
                action_target="Account Security -> 2-Step Verification",
                verified_channel="Official Service Security Settings",
                evidence_tips="Save your new emergency backup codes in a secure physical location."
            ))
            step_counter += 1

        # =========================================================================
        # Scenario B: Suspicious Link Clicked (No Credentials)
        # =========================================================================
        if q.scenario_type == "scenario_b" and not q.credentials_entered and not q.money_transferred:
            checklist.append(ChecklistItem(
                step_number=step_counter,
                title="Clear Browser Cache, Cookies, and Site Data",
                urgency="MEDIUM",
                description="In your mobile browser (Chrome/Safari), go to History -> Clear Browsing Data -> Select Cookies and Cached Images for 'All Time'. This clears tracking cookies and rogue workers.",
                action_type="DEVICE_SETTING",
                action_target="Browser Settings -> Clear Data",
                verified_channel="Web Browser Settings",
                evidence_tips="Keep the full target URL string saved for forensic reporting."
            ))
            step_counter += 1

            checklist.append(ChecklistItem(
                step_number=step_counter,
                title="Check Browser Notification & Download Permissions",
                urgency="MEDIUM",
                description="Verify that the malicious site did not trick you into granting 'Push Notifications' or downloading background files.",
                action_type="DEVICE_SETTING",
                action_target="Browser Settings -> Site Settings -> Notifications",
                verified_channel="Web Browser Site Settings",
                evidence_tips="Remove any unfamiliar site listed under 'Allowed' notifications."
            ))
            step_counter += 1

        # =========================================================================
        # Scenario A: Suspicious Message Received Only
        # =========================================================================
        if q.scenario_type == "scenario_a" and not q.credentials_entered and not q.money_transferred and not q.app_installed:
            checklist.append(ChecklistItem(
                step_number=step_counter,
                title="Report Fraudulent Sender on DoT Chakshu Portal",
                urgency="LOW",
                description="Report the scam SMS/call number on the Department of Telecommunications Chakshu portal (sancharsaathi.gov.in/sfc) to block the scammer's SIM card and IMEI.",
                action_type="VISIT_URL",
                action_target="https://sancharsaathi.gov.in/sfc/",
                verified_channel="https://sancharsaathi.gov.in/sfc/ (DoT Official)",
                evidence_tips="Include the sender header (e.g., AD-SBIINP, VK-HDFCBK) and complete message body."
            ))
            step_counter += 1

            checklist.append(ChecklistItem(
                step_number=step_counter,
                title="Block Sender and Mark as Spam in Messaging App",
                urgency="LOW",
                description="Use your messaging app's built-in 'Report Spam and Block' feature so global telecommunications filters learn the threat fingerprint.",
                action_type="DEVICE_SETTING",
                action_target="SMS App -> Details -> Block & Report",
                verified_channel="Device Messaging Application",
                evidence_tips="Do NOT reply or click any 'STOP' or 'UNSUBSCRIBE' keywords in suspicious SMS."
            ))
            step_counter += 1

            evidence_preservation.append("Save the SMS sender alphanumeric header and timestamp.")

        disclaimer = (
            "IMPORTANT NOTICE: CyberShield AI provides rapid incident guidance based on official cybersecurity protocols. "
            "We do not promise or guarantee fund recovery. CyberShield AI will NEVER ask for your OTPs, UPI PINs, or passwords. "
            "Always interact directly with authorized law enforcement (1930 / cybercrime.gov.in) and verified banking officers."
        )

        return GoldenHourResponse(
            scenario_title=meta["title"],
            severity_assessment=meta["severity"],
            golden_hour_active=is_golden_hour,
            golden_hour_warning=gh_warning,
            official_helplines=cls.OFFICIAL_HELPLINES,
            immediate_checklist=checklist,
            evidence_preservation_guide=evidence_preservation,
            disclaimer=disclaimer
        )
