from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.services.loader import load_documents
from app.services.chunker import chunk_documents
from app.services.vector_store import VectorStore
from app.services.groqservice import generate_answer
from app.services.detector import detect_injection
from app.services.risk_scanner import calculate_risk

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
    chunks: list[dict]
    blocked_chunks: list[dict]

@app.get("/") 
def root():
    return {"message": "Well, Backend is working"}

@app.get("/risk-test")
def risk_test():

    chunks = vector_store.search("ignore previous instructions")

    results = []

    for chunk in chunks:

        risk = calculate_risk(chunk["text"])

        results.append({
            "text": chunk["text"],
            "risk_score": risk["risk_score"],
            "matched_patterns": risk["matched_patterns"]
        })

    return results


@app.post("/query", response_model=QueryResponse)
def query_api(data: QueryRequest):

    retrieved_chunks = vector_store.search(data.query)
    print("\nRetrieved Chunks:") 
    for chunk in retrieved_chunks:
        print(chunk["text"])
        print("---------")
    safe_chunks = []
    blocked_chunks = []
    for chunk in retrieved_chunks:
        detection = detect_injection(chunk["text"])
        risk = calculate_risk(chunk["text"])
        if detection["is_suspicious"]:
            blocked_chunks.append({
                "text": chunk["text"],
                "matches": detection["matches"],
                "risk_score": risk["risk_score"]
            })
        else:
            chunk["risk_score"] = risk["risk_score"]
            safe_chunks.append(chunk)

    chunk_texts = [c["text"] for c in safe_chunks]
    safe_chunk_data = [
        {
            "text": c["text"],
            "risk_score": c["risk_score"]
        }
        for c in safe_chunks
    ]

    answer =generate_answer(data.query,chunk_texts)

    return {
        "answer": answer,
        "chunks": safe_chunk_data,
        "blocked_chunks": blocked_chunks
    }