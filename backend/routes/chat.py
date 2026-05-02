"""
Chat routes: query documents using RAG pipeline.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from rag.chain import query_rag, clear_chat_history, get_chat_history


@router.get("/chat/history/{session_id}")
def get_history(session_id: str):
    """Get chat history for a session."""
    history = get_chat_history(session_id)
    return {"history": history, "session_id": session_id}


@router.delete("/chat/clear/{session_id}")
def clear_chat(session_id: str):
    """Clear chat history for a session."""
    clear_chat_history(session_id)
    return {"message": "Chat history cleared successfully", "session_id": session_id}

router = APIRouter()


class ChatRequest(BaseModel):
    query: str
    session_id: str = "default"


class ChatResponse(BaseModel):
    answer: str
    session_id: str


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """Send a question and get an AI-powered answer based on uploaded documents."""
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        answer = query_rag(
            question=request.query,
            session_id=request.session_id,
        )
        return ChatResponse(answer=answer, session_id=request.session_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")
