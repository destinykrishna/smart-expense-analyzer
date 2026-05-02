from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from app.routers import classify
from app.config import settings
from app.utils.exceptions import add_exception_handlers
from app.utils.logger import logger

app = FastAPI(title="Smart Expense Analyzer ML Backend")

add_exception_handlers(app)

@app.middleware("http")
async def verify_internal_key(request: Request, call_next):
    if request.url.path != "/health":
        internal_key = request.headers.get("X-Internal-Key")
        if internal_key != settings.ML_INTERNAL_SECRET:
            logger.warning(f"Unauthorized access attempt. Provided key: {internal_key}")
            return JSONResponse(status_code=401, content={"detail": "Unauthorized"})
    
    response = await call_next(request)
    return response

app.include_router(classify.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
