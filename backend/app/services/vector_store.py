
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from sentence_transformers import CrossEncoder

model = SentenceTransformer("all-MiniLM-L6-v2")

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

class VectorStore:
    def __init__(self):
        self.index = None
        self.texts = []

    def build_index(self, chunks):
        texts = [c["text"] for c in chunks]
        embeddings = model.encode(texts)

        self.index = faiss.IndexFlatL2(embeddings.shape[1])
        self.index.add(np.array(embeddings))

        self.texts = chunks

    def search(self,query,k=3):
        query_embedding = model.encode([query])

        distances,indices = self.index.search(np.array(query_embedding), k*2)

        retrieved_chunks = []

        for idx, distance in zip(indices[0],distances[0]):
            chunk = self.texts[idx].copy()
            chunk["score"] = float(distance)
            retrieved_chunks.append(chunk)

        pairs = [ (query,chunk["text"]) for chunk in retrieved_chunks ]

        rerank_scores = reranker.predict(pairs)

        for chunk, rerank_score in zip (retrieved_chunks,rerank_scores):
            chunk["rerank_score"] = float(rerank_score)

        reranked = sorted(retrieved_chunks,key=lambda x:x["rerank_score"],
                         reverse=True)
            
        return reranked[:k]