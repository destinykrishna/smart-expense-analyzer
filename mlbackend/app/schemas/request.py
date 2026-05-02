from pydantic import BaseModel, Field, field_validator
from typing import List

class Transaction(BaseModel):
    id: str
    date: str
    description: str
    amount: float
    currency: str

class ClassifyRequest(BaseModel):
    job_id: str
    transactions: List[Transaction] = Field(..., min_length=1)

    @field_validator("transactions")
    def transactions_must_not_be_empty(cls, v: List[Transaction]) -> List[Transaction]:
        if not v:
            raise ValueError("Transactions list cannot be empty")
        return v
