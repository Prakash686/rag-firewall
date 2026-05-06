from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

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

    def search(self, query, k=3):
        query_embedding = model.encode([query])
        distances, indices = self.index.search(np.array(query_embedding), k)

        results = [self.texts[i] for i in indices[0]]
        return results