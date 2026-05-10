import spacy

nlp = spacy.load("en_core_web_sm")

def chunk_documents(documents,chunk_size=3,overlap=1):
    chunks =[]

    for doc in documents:
        text = doc["content"]
        filename = doc["filename"]

        parsed = nlp(text)
        sentences = [sent.text.strip() for sent in parsed.sents]
        start = 0
        while start < len(sentences):
            end = start + chunk_size
            chunk_sentences = sentences[start:end]
            chunk_text = " ".join(chunk_sentences)
            chunks.append({
                "text":chunk_text,
                "source": filename
            })
            start += chunk_size - overlap
    return chunks
