import re
import unicodedata


def remove_html(text):
    clean = re.sub(r"<[^>]+>", "", text)
    return clean


def normalize_unicode(text):
    return unicodedata.normalize("NFKC", text)


def remove_zero_width(text):

    zero_width_chars = [
        "\u200B",
        "\u200C",
        "\u200D",
        "\uFEFF"
    ]

    for char in zero_width_chars:
        text = text.replace(char, "")

    return text


def clean_markdown(text):

    text = re.sub(r"#+\s*", "", text)
    text = re.sub(r"\*\*(.*?)\*\*", r"\1", text)
    text = re.sub(r"\*(.*?)\*", r"\1", text)
    text = re.sub(r"`(.*?)`", r"\1", text)
    text = re.sub(r">\s*", "", text)

    return text


def sanitize(text):

    text = remove_html(text)
    text = normalize_unicode(text)
    text = remove_zero_width(text)
    text = clean_markdown(text)

    return text