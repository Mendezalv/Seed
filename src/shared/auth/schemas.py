from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, EmailStr
from decimal import Decimal

class UsuarioResponse(BaseModel):
    id: UUID
    email: EmailStr
    nome_completo: str
    propriedade_id: UUID
    role: str
    ativo: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UsuarioCreate(BaseModel):
    email: EmailStr
    nome_completo: str
    senha: str = Field(min_length=8)
    propriedade_id: UUID | None = None
    role: str = "OPERADOR"

class MembroCreate(BaseModel):
    email: EmailStr
    nome_completo: str
    senha: str = Field(min_length=8)
    role: str = Field(default="OPERADOR", pattern="^(ADMIN|GESTOR|OPERADOR|CONSULTOR)$")

class MembroUpdate(BaseModel):
    nome_completo: str | None = None
    role: str | None = Field(default=None, pattern="^(ADMIN|GESTOR|OPERADOR|CONSULTOR)$")
    ativo: bool | None = None
    senha: str | None = Field(default=None, min_length=8)

class LoginRequest(BaseModel):
    email: EmailStr
    senha: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse

class PropriedadeCreate(BaseModel):
    nome: str
    cnpj_cpf: str | None = None
    inscricao_estadual: str | None = None
    endereco: str | None = None
    municipio: str | None = None
    estado: str | None = Field(default=None, max_length=2, min_length=2)
    area_total_hectares: Decimal | None = None
    car_numero: str | None = None

class PropriedadeResponse(BaseModel):
    id: UUID
    nome: str
    cnpj_cpf: str | None
    inscricao_estadual: str | None
    endereco: str | None
    municipio: str | None
    estado: str | None
    area_total_hectares: Decimal | None
    car_numero: str | None
    status: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class PropriedadeUpdate(BaseModel):
    nome: str | None = None
    cnpj_cpf: str | None = None
    inscricao_estadual: str | None = None
    endereco: str | None = None
    municipio: str | None = None
    estado: str | None = Field(default=None, max_length=2, min_length=2)
    area_total_hectares: Decimal | None = None
    car_numero: str | None = None
