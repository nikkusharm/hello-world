# Creo AI Engineering Copilot

Enterprise AI Engineering Copilot for PTC Creo that assists engineers, automates repetitive CAD operations, validates engineering rules, reuses historical knowledge, reviews drawings, and produces release readiness evidence without replacing the engineer.

## Current Scope: Phase 1 Foundation

This repository now contains the first production-oriented foundation slice:

- FastAPI backend scaffold using clean architecture boundaries.
- SQLAlchemy domain models for users, projects, role management, and audit logs.
- Repository pattern for persistence access.
- Environment-driven settings for database, Redis, JWT, and feature flags.
- OpenAPI-ready Phase 1 endpoints.
- Initial architecture, API contract, and UI wireframe documentation.
- Automated tests for health checks and the user/project/audit flow.

## Run Locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
PYTHONPATH=backend pytest
PYTHONPATH=backend uvicorn app.main:app --reload --app-dir backend
```

## Target Architecture

The platform is modular and agent-driven. Each agent will be independently deployable and independently testable, including Creo Assistant, CAD Automation, Geometry Validation, Assembly Validation, Drawing Validation, Knowledge Retrieval, Rule Engine, Release Readiness, BOM Validation, Lessons Learned, Workflow, and Reporting agents.

See `docs/architecture/clean-architecture.md` for the clean architecture blueprint and phase roadmap.
