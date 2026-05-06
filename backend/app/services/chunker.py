def chunk_documents(documents, chunk_size=100, overlap=20):
    chunks = []

    for doc in documents:
        text = doc["content"]
        filename = doc["filename"]

        start = 0
        while start < len(text):
            end = start + chunk_size

            chunk_text = text[start:end]

            chunks.append({
                "text": chunk_text,
                "source": filename
            })

            start += chunk_size - overlap

    return chunks