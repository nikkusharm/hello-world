from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.domain.models import AuditAction
from app.infrastructure.database.session import get_db
from app.infrastructure.repositories.phase1 import AuditRepository, ProjectRepository, UserRepository
from app.schemas.phase1 import AuditLogRead, ProjectCreate, ProjectRead, UserCreate, UserRead

router = APIRouter(prefix="/api/v1", tags=["phase-1-foundation"])


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    user = UserRepository(db).create(payload)
    AuditRepository(db).record(AuditAction.CREATE, "user", str(user.id), {"email": user.email}, user.id)
    return UserRead.model_validate(user)


@router.get("/users", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)) -> list[UserRead]:
    return [UserRead.model_validate(user) for user in UserRepository(db).list()]


@router.post("/projects", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)) -> ProjectRead:
    project = ProjectRepository(db).create(payload)
    AuditRepository(db).record(AuditAction.CREATE, "project", str(project.id), {"code": project.code}, project.owner_id)
    return ProjectRead.model_validate(project)


@router.get("/projects", response_model=list[ProjectRead])
def list_projects(db: Session = Depends(get_db)) -> list[ProjectRead]:
    return [ProjectRead.model_validate(project) for project in ProjectRepository(db).list()]


@router.get("/audit-logs", response_model=list[AuditLogRead])
def list_audit_logs(db: Session = Depends(get_db)) -> list[AuditLogRead]:
    return [AuditLogRead.model_validate(log) for log in AuditRepository(db).list()]
