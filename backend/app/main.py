from fastapi import FastAPI
from pydantic import BaseModel
from app.services.loader import load_documents

app = FastAPI()

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


@app.get("/load-test")
def test_loader():
    return load_documents()

@app.post("/query", response_model=QueryResponse)
def query_api(data: QueryRequest):
    return {
        "answer": "This is a sample answer",
        "chunks": ["chunk1","chunk2"],
        "blocked_chunks": []
    }
