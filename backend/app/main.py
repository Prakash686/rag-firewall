from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.services.loader import load_documents
from app.services.chunker import chunk_documents
from app.services.vector_store import VectorStore
from app.services.groqservice import generate_answer

app = FastAPI()
vector_store = VectorStore()

docs = load_documents()
chunks = chunk_documents(docs)
vector_store.build_index(chunks)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str
    chunks: list[str]
    blocked_chunks: list[str]

@app.get("/") 
def root():
    return {"message": "Well, Backend is working"}






@app.post("/query", response_model=QueryResponse)
def query_api(data: QueryRequest):

    retrieved_chunks = vector_store.search(data.query)

    chunk_texts = [c["text"] for c in retrieved_chunks]

    answer =generate_answer(data.query,chunk_texts)

    return {
        "answer": answer,
        "chunks": chunk_texts,
        "blocked_chunks": []
    }