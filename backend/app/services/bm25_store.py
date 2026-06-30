from rank_bm25 import BM25Okapi

class BM25Store:

    def __init__(self):
        self.bm25 = None
        self.chunks = []

    def build_index(self,chunks):
        self.chunks =chunks

        tokenized = [
            chunk["text"].lower().split()
            for chunk in chunks
        ]
        self.bm25 = BM25Okapi(tokenized)


    def search(self, query, top_k=3):
        tokenized_query = query.lower().split()
        scores = self.bm25.get_scores(tokenized_query)

        ranked = sorted(
            zip(scores, self.chunks),
            reverse=True,
            key=lambda x: x[0]
        )
        results = []
        for score, chunk in ranked[:top_k]:
            new_chunk = chunk.copy()
            new_chunk["bm25_score"] = float(score)
            results.append(new_chunk)
        return results