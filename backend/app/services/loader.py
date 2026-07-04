import os
from app.services.sanitizer import sanitize


def load_documents():
    documents = []


    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))

    data_path = os.path.join(base_dir, "data", "docs")

    print("DEBUG PATH:", data_path)  

    for filename in os.listdir(data_path):
        if filename.endswith(".txt"):
            file_path = os.path.join(data_path, filename)

            with open(file_path, "r", encoding="utf-8") as f:
                text = sanitize(f.read())

                documents.append({
                    "filename": filename,
                    "content": text
                })

    return documents