# app/core/config.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Monetbil
    MONETBIL_SERVICE_KEY: str
    MONETBIL_SERVICE_SECRET: str  # Pour vérifier signatures webhook

    # Paystack (optionnel)
    PAYSTACK_SECRET_KEY: Optional[str] = None
    PAYSTACK_PUBLIC_KEY: Optional[str] = None

    # Autres
    DATABASE_URL: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    JWT_PRIVATE_KEY: Optional[str] = None
    JWT_PUBLIC_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()