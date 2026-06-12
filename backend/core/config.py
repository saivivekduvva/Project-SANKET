from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Project SANKET Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # SQLite for local development, can be swapped for PostgreSQL
    DATABASE_URL: str = "sqlite:///./sanket.db"
    
    # Secret key for deriving encryption keys (in a real app, this should be in an env var and use TPM)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-tpm-derived-key-which-should-be-32-bytes")
    
    # Cryptographic Tag for export
    INADMISSIBILITY_TAG: str = "ASSISTIVE — NOT EVIDENCE"

settings = Settings()
