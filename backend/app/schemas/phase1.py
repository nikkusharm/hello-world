from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from app.domain.models import AuditAction, RoleName


class UserCreate(BaseModel):
    email: EmailStr
    display_name: str = Field(min_length=1, max_length=200)
    password: str = Field(min_length=12)
    role: RoleName = RoleName.ENGINEER


class UserRead(BaseModel):
    id: int
    email: EmailStr
    display_name: str
    role: RoleName
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectCreate(BaseModel):
    code: str = Field(min_length=2, max_length=80)
    name: str = Field(min_length=1, max_length=200)
    customer: str = Field(min_length=1, max_length=200)
    owner_id: int


class ProjectRead(BaseModel):
    id: int
    code: str
    name: str
    customer: str
    owner_id: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AuditLogRead(BaseModel):
    id: int
    actor_id: int | None
    action: AuditAction
    entity_type: str
    entity_id: str
    details: str
    created_at: datetime

    model_config = {"from_attributes": True}
