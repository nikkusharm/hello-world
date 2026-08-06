import json
from sqlalchemy.orm import Session
from app.domain.models import AuditAction, AuditLog, Project, User
from app.infrastructure.security.passwords import hash_password
from app.schemas.phase1 import ProjectCreate, UserCreate


class UserRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, payload: UserCreate) -> User:
        user = User(
            email=payload.email,
            display_name=payload.display_name,
            hashed_password=hash_password(payload.password),
            role=payload.role,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def list(self) -> list[User]:
        return list(self.db.query(User).order_by(User.id).all())


class ProjectRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, payload: ProjectCreate) -> Project:
        project = Project(**payload.model_dump())
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def list(self) -> list[Project]:
        return list(self.db.query(Project).order_by(Project.id).all())


class AuditRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def record(self, action: AuditAction, entity_type: str, entity_id: str, details: dict[str, object], actor_id: int | None = None) -> AuditLog:
        log = AuditLog(actor_id=actor_id, action=action, entity_type=entity_type, entity_id=entity_id, details=json.dumps(details, sort_keys=True))
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def list(self) -> list[AuditLog]:
        return list(self.db.query(AuditLog).order_by(AuditLog.id.desc()).all())
