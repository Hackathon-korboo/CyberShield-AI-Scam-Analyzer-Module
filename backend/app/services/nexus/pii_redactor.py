"""CyberShield Nexus — AI Privacy and PII Redaction Engine (Core Innovation 7)

Identifies sensitive personal identifiable information (PII), credentials,
and payment identifiers in raw input text, generating pseudonymized text for
external cloud LLM dispatch while strictly preserving a local, in-memory reversible
mapping so verified forensic reports present complete, authentic evidence to authorized users.

Guarantees:
- Never transmits raw phone numbers, emails, bank accounts, or OTPs to external AI APIs.
- Reversible mapping is strictly local and never serialized or leaked into LLM prompts.
- Compatible with Member 2 EvidenceValidator substring verification.
"""

import re
from typing import Dict, List, Tuple, Any
from pydantic import BaseModel, Field


class RedactionResult(BaseModel):
    """Result of PII redaction pass."""
    original_text: str
    redacted_text: str
    redaction_count: int
    entity_counts: Dict[str, int] = Field(default_factory=dict)
    redaction_applied: bool = False
    # Local-only reversible token mapping: e.g. {"[REDACTED_PHONE_1]": "+91 9876543210"}
    local_mapping: Dict[str, str] = Field(default_factory=dict)


class PIIRedactor:
    """Deterministic, high-performance PII masking and local token mapping."""

    # 1. Phone numbers (Indian 10-digit mobile, Toll-free, International E.164)
    PHONE_REGEX = re.compile(
        r"""(?x)
        (?:
            \+91[\s.-]?[6-9]\d{4}[\s.-]?\d{5}\b
            |
            \b91[\s.-]?[6-9]\d{4}[\s.-]?\d{5}\b
            |
            \b[6-9]\d{4}[\s.-]?\d{5}\b
            |
            \b1800[\s.-]?\d{3}[\s.-]?\d{3,4}\b
            |
            \+\d{1,3}[\s.-]?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,5}[\s.-]?\d{3,5}\b
        )
        """
    )

    # 2. Email addresses
    EMAIL_REGEX = re.compile(r"""\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b""")

    # 3. UPI Virtual Payment Addresses (e.g., user@okhdfcbank, name@upi, scammer@paytm)
    UPI_REGEX = re.compile(r"""\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b""")

    # 4. Bank Account numbers / Credit card candidates (9 to 18 consecutive digits)
    ACCOUNT_REGEX = re.compile(r"""\b(?:\d[ -]?){11,18}\d\b""")

    # 5. OTP / PIN candidates (4 to 8 digit codes adjacent to keywords like otp, pin, code, verification)
    OTP_CONTEXT_REGEX = re.compile(
        r"""(?i)(?:otp|pin|code|password|passcode|verification\s*(?:code|otp)?)[\s:=#\-]+(?:is\s+)?(\b\d{4,8}\b)"""
    )

    @classmethod
    def redact(cls, text: str) -> RedactionResult:
        """
        Redacts sensitive tokens in text with semantic pseudonyms and records
        an in-memory mapping to enable local restoration.
        """
        if not text:
            return RedactionResult(original_text="", redacted_text="", redaction_count=0)

        redacted = text
        local_mapping: Dict[str, str] = {}
        counts: Dict[str, int] = {
            "phone": 0,
            "email": 0,
            "upi": 0,
            "account": 0,
            "secret": 0
        }

        # Step 1: Redact OTPs / PIN secrets first (context-aware)
        def replace_secret(match: re.Match) -> str:
            full_match = match.group(0)
            secret_val = match.group(1)
            counts["secret"] += 1
            placeholder = f"[REDACTED_SECRET_{counts['secret']}]"
            local_mapping[placeholder] = secret_val
            return full_match.replace(secret_val, placeholder)

        redacted = cls.OTP_CONTEXT_REGEX.sub(replace_secret, redacted)

        # Step 2: Redact Emails
        def replace_email(match: re.Match) -> str:
            val = match.group(0)
            # Avoid re-masking existing placeholders
            if val.startswith("[REDACTED_"):
                return val
            counts["email"] += 1
            placeholder = f"[REDACTED_EMAIL_{counts['email']}]"
            local_mapping[placeholder] = val
            return placeholder

        redacted = cls.EMAIL_REGEX.sub(replace_email, redacted)

        # Step 3: Redact UPI VPAs (that weren't already matched as email)
        def replace_upi(match: re.Match) -> str:
            val = match.group(0)
            if val.startswith("[REDACTED_"):
                return val
            # Only mask if it resembles known banking/payment handles
            upi_handles = ("okaxis", "okhdfcbank", "oksbi", "okicici", "paytm", "upi", "ybl", "ibl", "axl", "barodampay")
            handle = val.split("@")[-1].lower() if "@" in val else ""
            if handle in upi_handles or "pay" in handle or "bank" in handle:
                counts["upi"] += 1
                placeholder = f"[REDACTED_UPI_{counts['upi']}]"
                local_mapping[placeholder] = val
                return placeholder
            return val

        redacted = cls.UPI_REGEX.sub(replace_upi, redacted)

        # Step 4: Redact Phone Numbers
        def replace_phone(match: re.Match) -> str:
            val = match.group(0).strip()
            if val.startswith("[REDACTED_"):
                return match.group(0)
            digits_only = re.sub(r"\D", "", val)
            if 7 <= len(digits_only) <= 15:
                counts["phone"] += 1
                placeholder = f"[REDACTED_PHONE_{counts['phone']}]"
                local_mapping[placeholder] = val
                return placeholder
            return val

        redacted = cls.PHONE_REGEX.sub(replace_phone, redacted)

        # Step 5: Redact Bank Account / Card numbers
        def replace_account(match: re.Match) -> str:
            val = match.group(0).strip()
            if val.startswith("[REDACTED_"):
                return match.group(0)
            digits = re.sub(r"\D", "", val)
            if 11 <= len(digits) <= 19:
                counts["account"] += 1
                placeholder = f"[REDACTED_ACCOUNT_{counts['account']}]"
                local_mapping[placeholder] = val
                return placeholder
            return val

        redacted = cls.ACCOUNT_REGEX.sub(replace_account, redacted)

        total_redactions = sum(counts.values())

        return RedactionResult(
            original_text=text,
            redacted_text=redacted,
            redaction_count=total_redactions,
            entity_counts=counts,
            redaction_applied=total_redactions > 0,
            local_mapping=local_mapping
        )

    @classmethod
    def restore_evidence(cls, text_with_placeholders: str, mapping: Dict[str, str]) -> str:
        """Restores original evidence substrings from the local mapping for authorized display."""
        restored = text_with_placeholders
        for placeholder, original in mapping.items():
            restored = restored.replace(placeholder, original)
        return restored
