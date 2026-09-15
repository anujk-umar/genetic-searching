import os
from typing import List

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    
    class Settings(BaseSettings):
        ENVIRONMENT: str = "development"
        PORT: int = 8000
        CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app"
        
        GEMINI_API_KEY: str = ""
        PINECONE_API_KEY: str = ""
        PINECONE_INDEX_NAME: str = "pgx-guidelines"
        PINECONE_ENVIRONMENT: str = "us-east-1"
        
        FIREBASE_PROJECT_ID: str = ""

        model_config = SettingsConfigDict(
            env_file=".env",
            env_file_encoding="utf-8",
            extra="ignore"
        )

        @property
        def cors_origin_list(self) -> List[str]:
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

except ImportError:
    # Standard fallback without pydantic-settings package
    from pydantic import BaseModel
    
    class Settings(BaseModel):
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        PORT: int = int(os.getenv("PORT", 8000))
        CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app")
        
        GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
        PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
        PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "pgx-guidelines")
        PINECONE_ENVIRONMENT: str = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
        
        FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")

        @property
        def cors_origin_list(self) -> List[str]:
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
