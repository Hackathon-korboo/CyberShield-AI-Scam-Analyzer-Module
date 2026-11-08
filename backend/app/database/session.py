"""CyberShield AI — Database Session Management (Part 19 + Production Hardening)

Provides SQLAlchemy engine initialization, session lifecycle, and dependency injection.
Supports local SQLite development, Vercel /tmp fallback, and high-concurrency production PostgreSQL.
"""

import logging
import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import get_settings
from app.database.models import Base

logger = logging.getLogger("cybershield.database")
settings = get_settings()

# Normalize Heroku/Neon legacy postgres:// to postgresql://
db_url = settings.database_url
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# In serverless environments (Vercel/AWS Lambda) with SQLite, write to /tmp
if db_url.startswith("sqlite") and (os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME")):
    db_url = "sqlite:////tmp/cybershield.db"

# Connect args & engine configuration
connect_args = {}
engine_kwargs = {
    "pool_pre_ping": True,
}

if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    # Managed PostgreSQL configuration (e.g. Neon, Supabase, RDS)
    # Recycle connections after 5 minutes to prevent stale serverless connections
    engine_kwargs["pool_recycle"] = 300
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Initialize database tables with safety handling for transient failures."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")
    except Exception as exc:
        logger.warning("Database schema creation deferred or non-fatal failure: %s", exc)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
