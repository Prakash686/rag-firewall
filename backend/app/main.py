from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from app.services.loader import load_documents
from app.services.chunker import chunk_documents
from app.services.vector_store import VectorStore
from app.services.groqservice import generate_answer
from app.services.detector import detect_injection
from app.services.risk_scanner import calculate_risk
from app.services.bm25_store import BM25Store
from app.services.sanitizer import sanitize
from app.services.mitigation import mitigation_decision
app = FastAPI()
vector_store = VectorStore()
bm25_store = BM25Store()

docs = load_documents()
chunks = chunk_documents(docs)
vector_store.build_index(chunks)
bm25_store.build_index(chunks)  
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

@app.get("/bm25-test") 
def bm25_test(query:str):
    results = bm25_store.search(query)
    return results


@app.post("/query", response_model=QueryResponse)
def query_api(data: QueryRequest):

    faiss_chunks = vector_store.search(data.query)

        


    bm25_chunks = bm25_store.search(data.query)
       

    retrieved_chunks = []
    seen = set()

    for chunk in faiss_chunks + bm25_chunks:
        if chunk["id"] not in seen:
            retrieved_chunks.append(chunk)
            seen.add(chunk["id"])

    print("\nretrieved Chunks:") 
    for chunk in retrieved_chunks:
        print(chunk["text"])
        print("---------")
    safe_chunks = []
    blocked_chunks = []
    for chunk in retrieved_chunks:
        clean_text = sanitize(chunk["text"])
        detection = detect_injection(clean_text)
        risk = calculate_risk(
            clean_text,
            detection["categories"],
            detection["match_count"]
        )
        decision = mitigation_decision(risk["risk_score"])
        if decision["action"] == "BLOCK":
            blocked_chunks.append({
                "text": clean_text,
                "source": chunk["source"],
                "chunk_id": chunk["id"],
                "chunk_index": chunk["chunk_index"],
                "matches": detection["matches"],
                "categories": detection["categories"],
                "risk_score": risk["risk_score"],
                "risk_level": risk["risk_level"],
                "match_count": detection["match_count"]
            })
        else:
            chunk["text"] = clean_text
            chunk["risk_score"] = risk["risk_score"]
            chunk["risk_level"] = risk["risk_level"]
            safe_chunks.append(chunk)

    chunk_texts = [c["text"] for c in safe_chunks]
    safe_chunk_data = [
        {
            "text": c["text"],
            "source": c["source"],
            "chunk_id": c["id"],
            "chunk_index": c["chunk_index"],
            "risk_score": c["risk_score"],
            "risk_level": c["risk_level"]
        }
        for c in safe_chunks
    ]

    
    answer =generate_answer(data.query,chunk_texts)

    return {
        "answer": answer,
        "chunks": safe_chunk_data,
        "blocked_chunks": blocked_chunks
    }