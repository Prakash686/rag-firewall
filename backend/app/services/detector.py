SUSPICIOUS_PATTERNS = [

    "ignore previous instructions",
    "disregard all prior instructions",
    "reveal system prompt",
    "send api key",
    "execute command",
    "bypass security",
    "act as system",
    "developer instructions"

]


def detect_injection(text):

    lowered = text.lower()

    matches = []

    for pattern in SUSPICIOUS_PATTERNS:

        if pattern in lowered:

            matches.append(pattern)

    return {
        "is_suspicious": len(matches) > 0,
        "matches": matches
    }