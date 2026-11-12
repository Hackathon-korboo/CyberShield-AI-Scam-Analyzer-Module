"""CyberShield AI — Unified Database Models (Part 19 + Member 4 Full-Stack)

SQLAlchemy ORM models for off-chain persistence of Unified Threat Reports,
canonical hash indexing, relational scan records, intelligence results,
risk reports, and scan audit events.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ThreatReportModel(Base):
    """Off-chain database storage model for Member 1 Unified Threat Reports."""

    __tablename__ = "threat_reports"

    scan_id = Column(String(36), primary_key=True, index=True)
    target_type = Column(String(32), nullable=False)
    target_value = Column(String(2048), nullable=False, index=True)
    risk_classification = Column(String(64), nullable=False, index=True)
    risk_score = Column(Integer, nullable=True)
    canonical_hash = Column(String(66), nullable=True, index=True)
    created_at = Column(
        String(64),
        default=lambda: datetime.now(timezone.utc).isoformat(),
        nullable=False,
    )
    report_json = Column(Text, nullable=False)
    retrieval_count = Column(Integer, default=0, nullable=False)

    # Blockchain tracking fields
    on_chain_tx_hash = Column(String(66), nullable=True)
    on_chain_status = Column(String(32), default="not_registered", nullable=False)
    registered_at = Column(String(64), nullable=True)


class Scan(Base):
    """Relational investigation record for Member 4 frontend and analytics."""

    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_type = Column(String(32), nullable=False)  # 'url', 'domain', 'message'
    target = Column(Text, nullable=False)
    status = Column(String(32), nullable=False, default="completed")
    risk_level = Column(String(32), nullable=False, default="Unknown")
    risk_score = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    # Relationships
    intelligence_results = relationship(
        "IntelligenceResult",
        back_populates="scan",
        cascade="all, delete-orphan",
        order_by="IntelligenceResult.provider"
    )
    report = relationship(
        "RiskReport",
        back_populates="scan",
        uselist=False,
        cascade="all, delete-orphan"
    )
    events = relationship(
        "ScanEvent",
        back_populates="scan",
        cascade="all, delete-orphan",
        order_by="ScanEvent.created_at"
    )


class IntelligenceResult(Base):
    """Stores threat intelligence provider responses and indicator correlations."""

    __tablename__ = "intelligence_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    provider = Column(String(64), nullable=False)
    indicator_type = Column(String(64), nullable=False)
    indicator_value = Column(Text, nullable=False)
    status = Column(String(32), nullable=False)  # 'match_found', 'clean', 'not_configured', 'unavailable', 'error'
    matched = Column(Boolean, default=False)
    verified = Column(Boolean, default=False)
    reference = Column(Text, nullable=True)
    details = Column(Text, nullable=True)  # JSON-encoded string
    first_seen = Column(DateTime(timezone=True), nullable=True)
    last_seen = Column(DateTime(timezone=True), nullable=True)

    scan = relationship("Scan", back_populates="intelligence_results")


class RiskReport(Base):
    """Canonical cryptographic report and proof record."""

    __tablename__ = "risk_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, unique=True)
    summary = Column(Text, nullable=False)
    evidence = Column(Text, nullable=False)  # JSON-encoded array of strings/objects
    recommendations = Column(Text, nullable=False)  # JSON-encoded array of actions
    report_hash = Column(String(64), nullable=False)
    verification_status = Column(String(32), nullable=False, default="locally_hashed")
    blockchain_tx = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    scan = relationship("Scan", back_populates="report")


class ScanEvent(Base):
    """Audit timeline events for tracking the scan lifecycle."""

    __tablename__ = "scan_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    scan = relationship("Scan", back_populates="events")


class ThreatEntity(Base):
    """Entity node in the CyberShield Nexus Threat Relationship Graph."""

    __tablename__ = "threat_entities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_type = Column(String(32), nullable=False, index=True)  # url, domain, ip, phone, email, upi, brand, scan
    entity_value = Column(String(2048), nullable=False, index=True)
    canonical_value = Column(String(2048), nullable=False, index=True)
    risk_level = Column(String(32), default="Unknown", nullable=False)
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="SET NULL"), nullable=True)
    metadata_json = Column(Text, nullable=True)  # JSON-encoded extra attributes
    first_seen = Column(DateTime(timezone=True), default=utc_now)
    last_seen = Column(DateTime(timezone=True), default=utc_now)


class ThreatRelationship(Base):
    """Directed/undirected correlation edge connecting entities in the Threat Graph."""

    __tablename__ = "threat_relationships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_entity_id = Column(String(36), ForeignKey("threat_entities.id", ondelete="CASCADE"), nullable=False, index=True)
    target_entity_id = Column(String(36), ForeignKey("threat_entities.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(64), nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)  # True = Solid edge (verified), False = Dashed edge (inferred)
    confidence = Column(Integer, default=100)  # 0 - 100
    evidence_reference = Column(Text, nullable=True)
    source_report_id = Column(String(64), nullable=True)
    detected_at = Column(DateTime(timezone=True), default=utc_now)


class CommunityThreatReport(Base):
    """Opt-in, privacy-preserving community threat indicators submitted by users."""

    __tablename__ = "community_threat_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    indicator_type = Column(String(32), nullable=False, index=True)  # url, domain, ip, upi_vpa, phone_hash
    indicator_value = Column(String(2048), nullable=False)  # Defanged / normalized indicator
    category = Column(String(64), nullable=False)  # phishing, financial_fraud, malware, fake_lottery, upi_scam
    severity = Column(String(32), nullable=False, default="High")
    reporter_notes = Column(Text, nullable=True)
    source_scan_id = Column(String(36), ForeignKey("scans.id", ondelete="SET NULL"), nullable=True)
    upvotes = Column(Integer, default=1)
    status = Column(String(32), default="active", nullable=False)  # active, flagged, reviewed
    submitted_at = Column(DateTime(timezone=True), default=utc_now)

