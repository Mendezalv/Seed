from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Configurações da aplicação.
    Lê valores do arquivo .env ou variáveis de ambiente.
    """
    DATABASE_URL: str
    REDIS_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    INMET_BASE_URL: str
    BCB_BASE_URL: str
    CPTEC_BASE_URL: str
    BRAPI_BASE_URL: str
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "DEBUG"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

@lru_cache
def get_settings() -> Settings:
    """
    Retorna a instância única (Singleton) das configurações.
    Utiliza cache para evitar múltiplas leituras do arquivo .env.
    """
    return Settings()
