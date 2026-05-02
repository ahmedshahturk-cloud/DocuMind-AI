"""
DocuMind AI Backend — FastAPI application.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.upload import router as upload_router
from routes.chat import router as chat_router

# Load environment variables
load_dotenv()

app = FastAPI(
    title="DocuMind AI",
    description="AI-Powered Document Intelligence Platform — Chat with your documents using RAG",
    version="1.0.0",
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_router, tags=["Documents"])
app.include_router(chat_router, tags=["Chat"])


@app.get("/", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": "DocuMind AI",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health():
    """Detailed health check."""
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    return {
        "status": "healthy",
        "gemini_configured": bool(gemini_key and gemini_key != "your_key_here"),
    }
