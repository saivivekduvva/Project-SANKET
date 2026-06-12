from fastapi import FastAPI
from core.config import settings
from db.database import engine
from db import models
from api.api_v1.endpoints import compliance, inference
import logging

# Set up database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for Project SANKET Assistive Interview Tool. NOT FOR EVIDENTIARY USE."
)

# Include Routers
app.include_router(compliance.router, prefix=f"{settings.API_V1_STR}/compliance", tags=["compliance"])
app.include_router(inference.router, prefix=f"{settings.API_V1_STR}/inference", tags=["inference"])

@app.get("/")
def read_root():
    return {"message": "Project SANKET API is running. Adhering to Selvi (2010) and Article 20(3)."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
