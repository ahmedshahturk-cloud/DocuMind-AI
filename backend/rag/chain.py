"""
RAG chain: retrieval-augmented generation using LangChain + Gemini.
"""
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from .vectorstore import search_documents

load_dotenv()

SYSTEM_PROMPT = (
    "You are a helpful document assistant named DocuMind AI. "
    "Answer only based on the provided document context. "
    "If the answer is not in the context, say "
    "'I could not find this information in the uploaded documents.'\n\n"
    "Be thorough, accurate, and provide well-structured answers. "
    "When relevant, quote specific parts of the documents to support your answer."
)

# In-memory chat history per session
_chat_histories: dict[str, list[dict]] = {}


def get_llm() -> ChatGoogleGenerativeAI:
    """Return a configured Gemini LLM instance."""
    api_key = os.getenv("GEMINI_API_KEY")
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.3,
        convert_system_message_to_human=True,
    )


def build_prompt(context: str, chat_history: str, question: str) -> list:
    """Build the prompt messages for the LLM."""
    messages = [
        ("system", SYSTEM_PROMPT),
        (
            "human",
            f"Document Context:\n{context}\n\n"
            f"Previous Conversation:\n{chat_history}\n\n"
            f"User Question: {question}\n\n"
            f"Please provide a comprehensive answer based on the document context above.",
        ),
    ]
    return messages


def get_chat_history(session_id: str) -> list[dict]:
    """Get chat history for a session."""
    return _chat_histories.get(session_id, [])


def add_to_history(session_id: str, role: str, content: str) -> None:
    """Add a message to chat history."""
    if session_id not in _chat_histories:
        _chat_histories[session_id] = []
    _chat_histories[session_id].append({"role": role, "content": content})
    # Keep only last 20 messages to avoid token limits
    if len(_chat_histories[session_id]) > 20:
        _chat_histories[session_id] = _chat_histories[session_id][-20:]


def query_rag(question: str, session_id: str) -> str:
    """Run the full RAG pipeline: retrieve context, build prompt, query Gemini."""
    # 1. Retrieve relevant chunks
    relevant_docs = search_documents(question, k=5)
    if not relevant_docs:
        return "No documents have been uploaded yet. Please upload a PDF document first."

    # 2. Build context from retrieved chunks
    context_parts = []
    for i, doc in enumerate(relevant_docs):
        source = doc.metadata.get("filename", "Unknown")
        context_parts.append(f"[Source: {source}, Chunk {i + 1}]\n{doc.page_content}")
    context = "\n\n---\n\n".join(context_parts)

    # 3. Get chat history
    history = get_chat_history(session_id)
    history_str = "\n".join(
        [f"{msg['role'].upper()}: {msg['content']}" for msg in history[-6:]]
    )

    # 4. Build prompt and query LLM
    llm = get_llm()
    messages = build_prompt(context, history_str, question)
    prompt = ChatPromptTemplate.from_messages(messages)
    chain = prompt | llm
    response = chain.invoke({})

    answer = response.content

    # 5. Save to history
    add_to_history(session_id, "user", question)
    add_to_history(session_id, "assistant", answer)

    return answer
