from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from app.schemas.request import ClassifyRequest, Transaction
from app.schemas.response import ClassifyResponse, Summary
from app.services.classifier import classify_transactions
from app.utils.logger import logger

router = APIRouter()

@router.post("/classify", response_model=ClassifyResponse)
async def classify_endpoint(request: ClassifyRequest) -> ClassifyResponse:
    try:
        results = classify_transactions(request.transactions)
        
        total = len(results)
        categorized = sum(1 for txn in results if not txn.isLowConfidence)
        low_confidence = total - categorized
        
        summary = Summary(
            total=total,
            categorized=categorized,
            lowConfidence=low_confidence
        )
        
        return ClassifyResponse(
            results=results,
            summary=summary,
            model_version="1.0.0",
            processed_at=datetime.utcnow().isoformat() + "Z"
        )
    except Exception as e:
        logger.error(f"Failed to process classification request: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during classification")
