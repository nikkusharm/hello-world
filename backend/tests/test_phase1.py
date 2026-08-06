from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_user_project_audit_flow() -> None:
    user_response = client.post(
        "/api/v1/users",
        json={
            "email": "engineer@example.com",
            "display_name": "Design Engineer",
            "password": "very-secure-password",
            "role": "engineer",
        },
    )
    assert user_response.status_code == 201
    user_id = user_response.json()["id"]

    project_response = client.post(
        "/api/v1/projects",
        json={"code": "PTC-001", "name": "Creo Pilot", "customer": "Internal", "owner_id": user_id},
    )
    assert project_response.status_code == 201

    audit_response = client.get("/api/v1/audit-logs")
    assert audit_response.status_code == 200
    assert len(audit_response.json()) >= 2
