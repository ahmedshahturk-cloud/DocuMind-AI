"""
Google Generative AI Embeddings wrapper for LangChain.
"""
import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv(override=True)


def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    """Return a configured Google Generative AI Embeddings instance."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_key_here":
        raise ValueError(
            "GEMINI_API_KEY is not set. "
            "Get a free key at https://aistudio.google.com and add it to backend/.env"
        )
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-2",
        google_api_key=api_key,
    )
