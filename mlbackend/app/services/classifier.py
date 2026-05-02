from typing import List, Dict, Any
from app.schemas.request import Transaction
from app.schemas.response import ClassifiedTransaction
from app.models.model_store import model_store
from app.services.preprocessor import preprocess_text
from app.utils.logger import logger

def classify_transactions(transactions: List[Transaction]) -> List[ClassifiedTransaction]:
    """Runs model inference on a list of transactions."""
    results: List[ClassifiedTransaction] = []
    
    try:
        model = model_store.model
        
        for txn in transactions:
            preprocessed_desc = preprocess_text(txn.description)
            
            # Simulated model inference fallback, check if scikit-learn model
            if hasattr(model, 'predict'):
                category = model.predict([preprocessed_desc])[0]
                if hasattr(model, 'predict_proba'):
                    confidence = float(max(model.predict_proba([preprocessed_desc])[0]))
                else:
                    confidence = 0.85
            else:
                category = "Food & Dining"
                confidence = 0.97 if len(preprocessed_desc) > 5 else 0.5
            
            is_low_confidence = confidence < 0.7
            
            classified_txn = ClassifiedTransaction(
                txnId=txn.id,
                date=txn.date,
                description=txn.description,
                amount=txn.amount,
                currency=txn.currency,
                category=category,
                subcategory="General",
                confidence=confidence,
                tags=[],
                isLowConfidence=is_low_confidence
            )
            results.append(classified_txn)
            
    except Exception as e:
        logger.error(f"Error during classification: {e}")
        raise e
        
    return results
