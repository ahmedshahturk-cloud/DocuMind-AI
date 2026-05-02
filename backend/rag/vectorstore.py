"""
ChromaDB vector store management for document embeddings.
"""
import os
import chromadb
from langchain_community.vectorstores import Chroma
from .embeddings import get_embeddings

CHROMA_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")


def get_vectorstore(collection_name: str = "documind") -> Chroma:
    """Return a Chroma vector store instance with Google embeddings."""
    embeddings = get_embeddings()
    return Chroma(
        collection_name=collection_name,
        embedding_function=embeddings,
        persist_directory=CHROMA_DB_DIR,
    )


import concurrent.futures

def add_documents(texts: list[str], metadatas: list[dict], doc_id: str) -> None:
    """Add chunked document texts to the vector store in batches for speed."""
    vectorstore = get_vectorstore()
    batch_size = 10
    
    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i : i + batch_size]
        batch_metadatas = metadatas[i : i + batch_size]
        batch_ids = [f"{doc_id}_chunk_{j}" for j in range(i, i + len(batch_texts))]
        
        try:
            # Try to add the whole batch at once
            vectorstore.add_texts(texts=batch_texts, metadatas=batch_metadatas, ids=batch_ids)
        except Exception as e:
            print(f"Batch {i//batch_size} failed: {e}. Falling back to sequential processing for this batch.")
            # Fallback: process each chunk in the failed batch one by one
            for j, (text, meta, _id) in enumerate(zip(batch_texts, batch_metadatas, batch_ids)):
                try:
                    vectorstore.add_texts(texts=[text], metadatas=[meta], ids=[_id])
                except Exception as inner_e:
                    print(f"Skipping chunk {i+j} due to persistent embedding error: {inner_e}")


def search_documents(query: str, doc_id: str = None, k: int = 5) -> list:
    """Perform similarity search and return top K relevant chunks, optionally filtered by doc_id."""
    vectorstore = get_vectorstore()
    
    search_kwargs = {}
    if doc_id and doc_id != "default":
        search_kwargs["filter"] = {"doc_id": doc_id}
        
    results = vectorstore.similarity_search(query, k=k, **search_kwargs)
    return results


def delete_document_vectors(doc_id: str) -> None:
    """Delete all vectors associated with a document ID."""
    client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
    collection = client.get_or_create_collection("documind")
    # Get all IDs that belong to this document
    all_data = collection.get(where={"doc_id": doc_id})
    if all_data["ids"]:
        collection.delete(ids=all_data["ids"])
