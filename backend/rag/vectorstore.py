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
    """Add chunked document texts to the vector store concurrently."""
    vectorstore = get_vectorstore()
    
    def process_chunk(i, text):
        try:
            _id = f"{doc_id}_chunk_{i}"
            vectorstore.add_texts(texts=[text], metadatas=[metadatas[i]], ids=[_id])
        except Exception as e:
            print(f"Skipping chunk {i} due to embedding error: {e}")

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(process_chunk, i, text) for i, text in enumerate(texts)]
        concurrent.futures.wait(futures)


def search_documents(query: str, k: int = 5) -> list:
    """Perform similarity search and return top K relevant chunks."""
    vectorstore = get_vectorstore()
    results = vectorstore.similarity_search(query, k=k)
    return results


def delete_document_vectors(doc_id: str) -> None:
    """Delete all vectors associated with a document ID."""
    client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
    collection = client.get_or_create_collection("documind")
    # Get all IDs that belong to this document
    all_data = collection.get(where={"doc_id": doc_id})
    if all_data["ids"]:
        collection.delete(ids=all_data["ids"])
