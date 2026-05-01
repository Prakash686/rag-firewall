from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class QueryRequest(BaseModel):
    query:str

class QueryResponse(BaseModel):
    answer:str
    chunks:list[str]
    blocked_chunks:list[str]

@app.get("/") 
def root():
    return {"message": "Well, Backend is working"}

@app.post("/query", response_model=QueryResponse)
def query_api(data: QueryRequest):
    return {
        "answer": "This is a sample answer",
        "chunks": ["chunk1","chunk2"],
    "blocked_chunks" : []
    }
