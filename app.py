from fastapi import FastAPI
from src.api.parser import router as parser_router  
from src.api.classifier import router as classifier_router
# Use the new v1 router that combines everything
from src.api.v1 import router as v1_router 

app = FastAPI(
    title="Parser API", 
    version="1.0",
    description="API for securely processing PDFs, Chat RAG, and Structured Extraction."
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Legacy Routers (Keep these if you still need the zip-download logic) ---
app.include_router(parser_router, prefix="/legacy", tags=["Legacy Parser"])
app.include_router(classifier_router, prefix="/legacy", tags=["Legacy Classifier"])

# --- New Unified Router ---
app.include_router(v1_router)

@app.get("/")
async def root():
    return {"message": "API is running. Access the interactive documentation at /docs."}