from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ML_INTERNAL_SECRET: str = "super-secret-internal-key"
    MODEL_PATH: str = "ml_models/expense_classifier.pkl"
    PORT: int = 8000

    class Config:
        env_file = ".env"

settings = Settings()
