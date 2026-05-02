from pydantic import BaseModel
from typing import List

class ClassifiedTransaction(BaseModel):
    txnId: str
    date: str
    description: str
    amount: float
    currency: str
    category: str
    subcategory: str
    confidence: float
    tags: List[str]
    isLowConfidence: bool

class Summary(BaseModel):
    total: int
    categorized: int
    lowConfidence: int

class ClassifyResponse(BaseModel):
    results: List[ClassifiedTransaction]
    summary: Summary
    model_version: str
    processed_at: str
