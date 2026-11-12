"""CyberShield Nexus — Evidence Relationship Intelligence Graph (Core Innovation 1)

Constructs, queries, and correlates multi-entity scam campaigns across investigations.
Distinguishes between mathematically confirmed technical infrastructure (Verified, Solid Edges)
and heuristic or behavioral correlations (Inferred, Dashed Edges).

Entity Types:
- URL, Domain, IP, Phone, Email, UPI VPA, Brand, Message Hash, Scan

Relationship Types:
- EXACT_DOMAIN_MATCH, SAME_URL, SAME_IP, SAME_PHONE, SAME_UPI_ID, SAME_EMAIL,
  SAME_REDIRECT_DESTINATION, SAME_BRAND_IMPERSONATION, SIMILAR_MESSAGE_PATTERN,
  SHARED_THREAT_INTELLIGENCE_SOURCE
"""

import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Set, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, and_, desc

from app.database.models import ThreatEntity, ThreatRelationship, Scan, IntelligenceResult, RiskReport


class GraphNode(Dict[str, Any]):
    """Format compatible with Cytoscape.js, React Flow, and D3."""
    pass


class GraphEdge(Dict[str, Any]):
    """Edge representation with verified/inferred distinction."""
    pass


class ThreatGraphService:
    """Manages the lifecycle, correlation, and multi-hop querying of Threat Entities."""

    @staticmethod
    def _canonicalize(entity_type: str, raw_value: str) -> str:
        """Normalizes entity values to ensure deterministic graph deduplication."""
        val = raw_value.strip()
        if entity_type in ("domain", "email", "upi"):
            return val.lower()
        if entity_type == "phone":
            # Keep digits only for matching
            import re
            return re.sub(r"\D", "", val)
        if entity_type == "url":
            # Normalize scheme and trailing slash
            val = val.lower().rstrip("/")
            if not val.startswith(("http://", "https://")):
                val = "https://" + val
            return val
        return val.lower()

    @classmethod
    def ingest_scan(
        cls,
        db: Session,
        scan_id: str,
        scan_type: str,
        target: str,
        risk_level: str,
        extracted_indicators: Optional[Dict[str, List[str]]] = None,
        technical_data: Optional[Dict[str, Any]] = None,
        brand_detected: Optional[str] = None
    ) -> List[ThreatEntity]:
        """
        Parses all technical artifacts from a completed scan and updates the Threat Graph:
        - Creates or updates ThreatEntity records.
        - Automatically creates verified edges to the parent Scan node.
        - Automatically correlates shared indicators across past scans.
        """
        created_or_updated: List[ThreatEntity] = []

        # 1. Create or retrieve parent Scan Entity
        scan_node = cls._get_or_create_entity(
            db=db,
            entity_type="scan",
            entity_value=f"Scan: {target[:60]}",
            risk_level=risk_level,
            scan_id=scan_id,
            metadata={"scan_type": scan_type}
        )
        created_or_updated.append(scan_node)

        # 2. Ingest Target as primary entity (URL or Domain or Message Fingerprint)
        if scan_type in ("url", "domain"):
            target_entity = cls._get_or_create_entity(
                db=db,
                entity_type=scan_type,
                entity_value=target,
                risk_level=risk_level,
                scan_id=scan_id
            )
            created_or_updated.append(target_entity)
            cls._create_or_touch_relationship(
                db=db,
                source_id=scan_node.id,
                target_id=target_entity.id,
                rel_type="INVESTIGATED_TARGET",
                is_verified=True,
                confidence=100,
                evidence="Primary investigation target submitted by user.",
                report_id=scan_id
            )

            # Ingest extracted Domain if URL
            import urllib.parse
            try:
                parsed = urllib.parse.urlparse(target if "://" in target else f"http://{target}")
                if parsed.hostname:
                    domain_entity = cls._get_or_create_entity(
                        db=db,
                        entity_type="domain",
                        entity_value=parsed.hostname.lower(),
                        risk_level=risk_level,
                        scan_id=scan_id
                    )
                    created_or_updated.append(domain_entity)
                    cls._create_or_touch_relationship(
                        db=db,
                        source_id=target_entity.id,
                        target_id=domain_entity.id,
                        rel_type="EXACT_DOMAIN_MATCH",
                        is_verified=True,
                        confidence=100,
                        evidence=f"URL '{target}' resolves under domain '{parsed.hostname}'.",
                        report_id=scan_id
                    )
            except Exception:
                pass

        elif scan_type == "message":
            msg_hash = hashlib.sha256(target.encode("utf-8")).hexdigest()[:16]
            msg_entity = cls._get_or_create_entity(
                db=db,
                entity_type="message_hash",
                entity_value=f"msg_{msg_hash}",
                risk_level=risk_level,
                scan_id=scan_id,
                metadata={"snippet": target[:100]}
            )
            created_or_updated.append(msg_entity)
            cls._create_or_touch_relationship(
                db=db,
                source_id=scan_node.id,
                target_id=msg_entity.id,
                rel_type="INVESTIGATED_TARGET",
                is_verified=True,
                confidence=100,
                evidence="Message fingerprint generated from submitted text.",
                report_id=scan_id
            )

        # 3. Ingest Extracted Technical Indicators (URLs, Domains, Emails, Phones)
        if extracted_indicators:
            for url_val in extracted_indicators.get("urls", []):
                ent = cls._get_or_create_entity(db, "url", url_val, risk_level, scan_id)
                created_or_updated.append(ent)
                cls._create_or_touch_relationship(
                    db, scan_node.id, ent.id, "EXTRACTED_INDICATOR", is_verified=True, confidence=100,
                    evidence="Extracted verbatim from scanned content.", report_id=scan_id
                )

            for dom_val in extracted_indicators.get("domains", []):
                ent = cls._get_or_create_entity(db, "domain", dom_val, risk_level, scan_id)
                created_or_updated.append(ent)
                cls._create_or_touch_relationship(
                    db, scan_node.id, ent.id, "EXACT_DOMAIN_MATCH", is_verified=True, confidence=100,
                    evidence="Domain indicator extracted from content.", report_id=scan_id
                )

            for email_val in extracted_indicators.get("emails", []):
                ent = cls._get_or_create_entity(db, "email", email_val, risk_level, scan_id)
                created_or_updated.append(ent)
                cls._create_or_touch_relationship(
                    db, scan_node.id, ent.id, "SAME_EMAIL", is_verified=True, confidence=100,
                    evidence="Email address extracted from content.", report_id=scan_id
                )

            for phone_val in extracted_indicators.get("phone_numbers", []):
                ent = cls._get_or_create_entity(db, "phone", phone_val, risk_level, scan_id)
                created_or_updated.append(ent)
                cls._create_or_touch_relationship(
                    db, scan_node.id, ent.id, "SAME_PHONE", is_verified=True, confidence=100,
                    evidence="Phone number extracted from content.", report_id=scan_id
                )

        # 4. Ingest Technical DNS & Redirect details if provided
        if technical_data:
            ips = technical_data.get("resolved_ips", [])
            for ip_val in ips:
                ent = cls._get_or_create_entity(db, "ip", ip_val, risk_level, scan_id)
                created_or_updated.append(ent)
                cls._create_or_touch_relationship(
                    db, scan_node.id, ent.id, "SAME_IP", is_verified=True, confidence=100,
                    evidence=f"DNS resolved host to IP {ip_val}.", report_id=scan_id
                )

        # 5. Ingest Brand Impersonation if detected
        if brand_detected:
            brand_ent = cls._get_or_create_entity(db, "brand", brand_detected, "High", scan_id)
            created_or_updated.append(brand_ent)
            # Inferred relationship (Dashed edge in UI)
            cls._create_or_touch_relationship(
                db, scan_node.id, brand_ent.id, "SAME_BRAND_IMPERSONATION", is_verified=False, confidence=80,
                evidence=f"Heuristic pattern matches known brand lure for '{brand_detected}'.", report_id=scan_id
            )

        db.commit()
        return created_or_updated

    @classmethod
    def _get_or_create_entity(
        cls,
        db: Session,
        entity_type: str,
        entity_value: str,
        risk_level: str,
        scan_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> ThreatEntity:
        canonical = cls._canonicalize(entity_type, entity_value)
        existing = db.query(ThreatEntity).filter(
            ThreatEntity.entity_type == entity_type,
            ThreatEntity.canonical_value == canonical
        ).first()

        now = datetime.now(timezone.utc)
        if existing:
            existing.last_seen = now
            # Escalate risk if incoming scan is more critical
            risk_ranks = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1, "Unknown": 0}
            if risk_ranks.get(risk_level, 0) > risk_ranks.get(existing.risk_level, 0):
                existing.risk_level = risk_level
            return existing

        new_entity = ThreatEntity(
            entity_type=entity_type,
            entity_value=entity_value,
            canonical_value=canonical,
            risk_level=risk_level,
            scan_id=scan_id,
            metadata_json=json.dumps(metadata) if metadata else None,
            first_seen=now,
            last_seen=now
        )
        db.add(new_entity)
        db.flush()
        return new_entity

    @classmethod
    def _create_or_touch_relationship(
        cls,
        db: Session,
        source_id: str,
        target_id: str,
        rel_type: str,
        is_verified: bool,
        confidence: int,
        evidence: str,
        report_id: Optional[str] = None
    ) -> ThreatRelationship:
        if source_id == target_id:
            return None

        # Check if relationship already exists in either direction
        existing = db.query(ThreatRelationship).filter(
            or_(
                and_(ThreatRelationship.source_entity_id == source_id, ThreatRelationship.target_entity_id == target_id),
                and_(ThreatRelationship.source_entity_id == target_id, ThreatRelationship.target_entity_id == source_id)
            ),
            ThreatRelationship.relationship_type == rel_type
        ).first()

        if existing:
            existing.confidence = max(existing.confidence, confidence)
            return existing

        rel = ThreatRelationship(
            source_entity_id=source_id,
            target_entity_id=target_id,
            relationship_type=rel_type,
            is_verified=is_verified,
            confidence=confidence,
            evidence_reference=evidence,
            source_report_id=report_id,
            detected_at=datetime.now(timezone.utc)
        )
        db.add(rel)
        db.flush()
        return rel

    @classmethod
    def get_subgraph(
        cls,
        db: Session,
        entity_id: Optional[str] = None,
        scan_id: Optional[str] = None,
        hops: int = 2,
        entity_types: Optional[List[str]] = None,
        max_nodes: int = 60
    ) -> Dict[str, Any]:
        """
        Retrieves a connected subgraph centered around an entity_id or scan_id,
        or the top threat cluster if no seed is provided.
        """
        seed_nodes: List[ThreatEntity] = []
        if entity_id:
            node = db.query(ThreatEntity).filter(ThreatEntity.id == entity_id).first()
            if node:
                seed_nodes.append(node)
        elif scan_id:
            nodes = db.query(ThreatEntity).filter(ThreatEntity.scan_id == scan_id).all()
            seed_nodes.extend(nodes)

        # If still no seeds, select recent high-risk entities
        if not seed_nodes:
            seed_nodes = db.query(ThreatEntity).order_by(
                desc(ThreatEntity.last_seen)
            ).limit(10).all()

        if not seed_nodes:
            return {"nodes": [], "edges": [], "stats": {"total_nodes": 0, "total_edges": 0}}

        visited_node_ids: Set[str] = {n.id for n in seed_nodes}
        current_frontier: Set[str] = set(visited_node_ids)
        all_edges: Dict[str, ThreatRelationship] = {}

        # Multi-hop breadth-first expansion
        for _ in range(max(1, min(hops, 3))):
            if not current_frontier or len(visited_node_ids) >= max_nodes:
                break

            rels = db.query(ThreatRelationship).filter(
                or_(
                    ThreatRelationship.source_entity_id.in_(current_frontier),
                    ThreatRelationship.target_entity_id.in_(current_frontier)
                )
            ).all()

            next_frontier: Set[str] = set()
            for r in rels:
                edge_key = f"{min(r.source_entity_id, r.target_entity_id)}_{max(r.source_entity_id, r.target_entity_id)}_{r.relationship_type}"
                all_edges[edge_key] = r

                other_id = r.target_entity_id if r.source_entity_id in current_frontier else r.source_entity_id
                if other_id not in visited_node_ids:
                    visited_node_ids.add(other_id)
                    next_frontier.add(other_id)

            current_frontier = next_frontier

        # Fetch all visited entity nodes
        nodes_query = db.query(ThreatEntity).filter(ThreatEntity.id.in_(visited_node_ids))
        if entity_types:
            nodes_query = nodes_query.filter(ThreatEntity.entity_type.in_(entity_types))
        entities = nodes_query.all()
        valid_entity_ids = {e.id for e in entities}

        # Format nodes
        formatted_nodes = [
            {
                "id": e.id,
                "label": e.entity_value[:35] + ("..." if len(e.entity_value) > 35 else ""),
                "full_value": e.entity_value,
                "type": e.entity_type,
                "risk_level": e.risk_level,
                "scan_id": e.scan_id,
                "first_seen": e.first_seen.isoformat() if e.first_seen else None,
                "last_seen": e.last_seen.isoformat() if e.last_seen else None,
            }
            for e in entities
        ]

        # Format edges (filter to ensure both endpoints are present in node list)
        formatted_edges = [
            {
                "id": r.id,
                "source": r.source_entity_id,
                "target": r.target_entity_id,
                "relationship": r.relationship_type,
                "is_verified": r.is_verified,  # True = Solid, False = Dashed
                "confidence": r.confidence,
                "evidence": r.evidence_reference,
                "detected_at": r.detected_at.isoformat() if r.detected_at else None,
            }
            for r in all_edges.values()
            if r.source_entity_id in valid_entity_ids and r.target_entity_id in valid_entity_ids
        ]

        return {
            "nodes": formatted_nodes,
            "edges": formatted_edges,
            "stats": {
                "total_nodes": len(formatted_nodes),
                "total_edges": len(formatted_edges),
                "verified_edges": sum(1 for e in formatted_edges if e["is_verified"]),
                "inferred_edges": sum(1 for e in formatted_edges if not e["is_verified"]),
                "critical_entities": sum(1 for n in formatted_nodes if n["risk_level"] in ("Critical", "High"))
            }
        }
