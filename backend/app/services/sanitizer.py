import re
import unicodedata


def sanitize_text(text):

    text = unicodedata.normalize("NFKC", text)

    text = re.sub(r'[\u200B-\u200D\uFEFF]', '', text)

    text = re.sub(r'\s+', ' ', text)

    return text.strip()