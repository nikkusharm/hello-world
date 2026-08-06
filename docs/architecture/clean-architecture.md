# Clean Architecture Blueprint

The platform is organized as independently deployable modules around a clean architecture boundary.

## Layers

- **Domain**: enterprise entities, value objects, engineering issue classifications, and audit actions.
- **Application**: use cases that orchestrate repositories, rules, AI agents, and workflow decisions.
- **Infrastructure**: SQLAlchemy persistence, Redis, Celery/RabbitMQ workers, identity providers, Creo/PLM/SAP adapters, vector stores, and observability exporters.
- **Interfaces**: FastAPI routes, OpenAPI contracts, NextJS pages, and asynchronous message contracts.

## Modular Agent Boundary

Each AI capability is delivered as a separate module with its own API, worker queue, configuration, tests, and deployment manifest. Agents communicate through explicit contracts and persisted audit events rather than in-process coupling.

## Phase Plan

1. Foundation: authentication, users, projects, roles, and audit logging.
2. Creo integration: CAD reader, parameter reader, and metadata extraction adapters.
3. Knowledge base: vector database, RAG indexing, hybrid search, and similarity search.
4. AI design assistant: prompt engine, recommendations, templates, and feature suggestions.
5. Rule engine: geometry, assembly, and drawing validation rules.
6. Release readiness: BOM validation, workflow, and review management.
7. Reporting: analytics, KPIs, and Power BI integration.
8. Optimization: caching, parallel AI execution, performance, and monitoring.
