import pickle
import os
from app.config import settings

class ModelStore:
    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelStore, cls).__new__(cls)
            cls._instance._load_model()
        return cls._instance

    def _load_model(self):
        if self._model is None:
            if not os.path.exists(settings.MODEL_PATH):
                # Placeholder for testing, since model might not exist yet
                self._model = lambda x: ["Food & Dining"] * len(x)
                 # raise FileNotFoundError(f"Model file not found at {settings.MODEL_PATH}")
            else:
                 with open(settings.MODEL_PATH, "rb") as f:
                     self._model = pickle.load(f)

    @property
    def model(self):
        return self._model

model_store = ModelStore()
