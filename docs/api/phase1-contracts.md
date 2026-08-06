# Phase 1 API Contracts

Base path: `/api/v1`

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/users` | Create an engineer, reviewer, manager, quality user, or admin. |
| `GET` | `/users` | List active users for administration and ownership assignment. |
| `POST` | `/projects` | Create a customer project and assign an owner. |
| `GET` | `/projects` | List projects visible to the caller. |
| `GET` | `/audit-logs` | Return append-only audit events for compliance review. |

All mutating endpoints must create audit entries. Future OAuth2, Active Directory, SSO, and JWT enforcement will wrap these contracts without changing domain use cases.
