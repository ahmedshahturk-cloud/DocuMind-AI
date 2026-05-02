"""
Upload routes: PDF upload, document listing, document deletion.
"""
import os
import uuid
import json
from datetime import datetime, timezone

import fitz  # PyMuPDF
from fastapi import APIRouter, UploadFile, File, HTTPException
from langchain_text_splitters import RecursiveCharacterTextSplitter

from rag.vectorstore import add_documents, delete_document_vectors

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
METADATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "documents_meta.json")

os.makedirs(UPLOAD_DIR, exist_ok=True)


def _load_metadata() -> list[dict]:
    """Load document metadata from JSON file."""
    if os.path.exists(METADATA_FILE):
        with open(METADATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def _save_metadata(metadata: list[dict]) -> None:
    """Save document metadata to JSON file."""
    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, default=str)


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file using PyMuPDF."""
    doc = fitz.open(file_path)
    text = ""
    for page_num in range(len(doc)):
        page = doc[page_num]
        text += page.get_text()
    doc.close()
    return text


def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """Split text into chunks using LangChain's RecursiveCharacterTextSplitter."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    return splitter.split_text(text)


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload a PDF, extract text, chunk it, embed and store in ChromaDB."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Generate unique ID
    doc_id = str(uuid.uuid4())

    # Save file to disk
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}_{file.filename}")
    content = await file.read()

    with open(file_path, "wb") as f:
        f.write(content)

    try:
        # Extract text
        text = extract_text_from_pdf(file_path)
        if not text.strip():
            os.remove(file_path)
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF. The file may be scanned or image-based.",
            )

        # Chunk text
        chunks = chunk_text(text)

        # Create metadata for each chunk
        metadatas = [
            {
                "doc_id": doc_id,
                "filename": file.filename,
                "chunk_index": i,
                "total_chunks": len(chunks),
            }
            for i in range(len(chunks))
        ]

        # Add to vector store
        add_documents(texts=chunks, metadatas=metadatas, doc_id=doc_id)

        # Save document metadata
        doc_meta = {
            "id": doc_id,
            "filename": file.filename,
            "upload_time": datetime.now(timezone.utc).isoformat(),
            "total_chunks": len(chunks),
            "total_characters": len(text),
            "file_path": file_path,
        }

        all_meta = _load_metadata()
        all_meta.append(doc_meta)
        _save_metadata(all_meta)

        return {
            "message": "Document uploaded and processed successfully",
            "document": doc_meta,
        }

    except HTTPException:
        raise
    except ValueError as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Cleanup on failure
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


@router.get("/documents")
async def list_documents():
    """List all uploaded documents."""
    metadata = _load_metadata()
    return {"documents": metadata}


@router.delete("/document/{doc_id}")
async def delete_document(doc_id: str):
    """Delete a document and its vectors."""
    metadata = _load_metadata()
    doc = next((d for d in metadata if d["id"] == doc_id), None)

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    # Delete vectors from ChromaDB
    try:
        delete_document_vectors(doc_id)
    except Exception:
        pass  # Continue even if vector deletion fails

    # Delete file from disk
    if os.path.exists(doc.get("file_path", "")):
        os.remove(doc["file_path"])

    # Update metadata
    metadata = [d for d in metadata if d["id"] != doc_id]
    _save_metadata(metadata)

    return {"message": "Document deleted successfully"}
