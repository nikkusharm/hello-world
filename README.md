# Creo AI Engineering Copilot

Enterprise AI Engineering Copilot for PTC Creo that assists engineers, automates repetitive CAD operations, validates engineering rules, reuses historical knowledge, reviews drawings, and produces release readiness evidence without replacing the engineer.

## Current Scope: Phase 1 Foundation

This repository contains the first production-oriented foundation slice:

- FastAPI backend scaffold using clean architecture boundaries.
- SQLAlchemy domain models for users, projects, role management, and audit logs.
- Repository pattern for persistence access.
- Environment-driven settings for database, Redis, JWT, and feature flags.
- OpenAPI-ready Phase 1 endpoints.
- Docker Compose stack for API, PostgreSQL, and Redis.
- Initial architecture, API contract, and UI wireframe documentation.
- Automated tests for health checks and the user/project/audit flow.

## Run Locally with Docker

Docker is the easiest way to run the backend because it starts the API, PostgreSQL, and Redis together.

```bash
docker compose down --remove-orphans
docker compose build --no-cache
docker compose up
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
pip install -r requirements-dev.txt
PYTHONPATH=backend pytest
PYTHONPATH=backend uvicorn app.main:app --reload --app-dir backend
```

On Windows PowerShell, use:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
$env:PYTHONPATH="backend"
pytest
uvicorn app.main:app --reload --app-dir backend
```

## If http://localhost:8000/docs Does Not Open

1. Confirm Docker Desktop is running.
2. Confirm the terminal running `docker compose up` is still open.
3. Check Docker containers with `docker compose ps`.
4. Check backend logs with `docker compose logs api`.
5. Rebuild without cache using `docker compose build --no-cache`.
6. Confirm port 8000 is not already used by another app.
7. Try the health URL first: <http://localhost:8000/health>.

## Target Architecture

The platform is modular and agent-driven. Each agent will be independently deployable and independently testable, including Creo Assistant, CAD Automation, Geometry Validation, Assembly Validation, Drawing Validation, Knowledge Retrieval, Rule Engine, Release Readiness, BOM Validation, Lessons Learned, Workflow, and Reporting agents.

See `docs/architecture/clean-architecture.md` for the clean architecture blueprint and phase roadmap.
