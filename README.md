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

## Run Locally with Docker

Docker is the easiest way to run the current backend because it starts the API, PostgreSQL, and Redis together.

```bash
docker compose up --build
```

After the logs show Uvicorn is running, open:

- API docs: <http://localhost:8000/docs>
- Health check: <http://localhost:8000/health>

To stop everything, press `Ctrl+C`, then run:

```bash
docker compose down
```

## Run Locally with Python

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
PYTHONPATH=backend pytest
PYTHONPATH=backend uvicorn app.main:app --reload --app-dir backend
```

On Windows PowerShell, use:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
$env:PYTHONPATH="backend"
pytest
uvicorn app.main:app --reload --app-dir backend
```

## If http://localhost:8000/docs Does Not Open

1. Confirm the server is running and the terminal is still open.
2. Check Docker containers with `docker compose ps`.
3. Check backend logs with `docker compose logs api`.
4. Confirm port 8000 is not already used by another app.
5. Try the health URL first: <http://localhost:8000/health>.
6. If you are running Python locally, confirm dependencies installed successfully with `pip install -e '.[dev]'`.

## Target Architecture

The platform is modular and agent-driven. Each agent will be independently deployable and independently testable, including Creo Assistant, CAD Automation, Geometry Validation, Assembly Validation, Drawing Validation, Knowledge Retrieval, Rule Engine, Release Readiness, BOM Validation, Lessons Learned, Workflow, and Reporting agents.

See `docs/architecture/clean-architecture.md` for the clean architecture blueprint and phase roadmap.
