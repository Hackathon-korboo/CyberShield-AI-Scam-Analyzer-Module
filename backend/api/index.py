"""Vercel Serverless Function entrypoint for CyberShield AI FastAPI Backend."""
import sys
from pathlib import Path

# Add backend directory to sys.path so that 'app' module resolves seamlessly
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

# Vercel's Python runtime discovers 'app' as the ASGI application
__all__ = ["app"]
