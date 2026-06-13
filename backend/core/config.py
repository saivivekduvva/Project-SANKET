from pydantic_settings import BaseSettings
import os
import urllib.parse
from dotenv import load_dotenv

# Load variables from .env file into environment
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Project SANKET Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Swapped to PostgreSQL per user request - Loading from ENV variable for security
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"postgresql://postgres:{urllib.parse.quote_plus(os.getenv('DB_PASSWORD', ''))}@localhost:5432/sanket"
    )
    
    # Secret key for deriving encryption keys (in a real app, this should be in an env var and use TPM)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-tpm-derived-key-which-should-be-32-bytes")
    
    # Cryptographic Tag for export
    INADMISSIBILITY_TAG: str = "ASSISTIVE — NOT EVIDENCE"

settings = Settings()
