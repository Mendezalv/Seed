from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Configurações da aplicação.
    Lê valores do arquivo .env ou variáveis de ambiente.
    """
    DATABASE_URL: str = "sqlite+aiosqlite:///./seed.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "seed-super-secret-production-key-change-in-env-32chars"  # noqa: S105
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    INMET_BASE_URL: str = "https://apitempo.inmet.gov.br"
    BCB_BASE_URL: str = "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata"
    CPTEC_BASE_URL: str = "http://servicos.cptec.inpe.br/XML"
    BRAPI_BASE_URL: str = "https://brapi.dev/api"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "DEBUG"
    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

@lru_cache
def get_settings() -> Settings:
    """
    Retorna a instância única (Singleton) das configurações.
    Utiliza cache para evitar múltiplas leituras do arquivo .env.
    """
    return Settings()
