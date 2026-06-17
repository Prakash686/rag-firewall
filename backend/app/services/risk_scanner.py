HIGH_RISK_PATTERNS = {

    "ignore previous instructions": 0.95,
    "disregard all prior instructions": 0.90,
    "reveal system prompt": 0.92,
    "send api key": 0.98,
    "execute command": 0.85,
    "bypass security": 0.97,
    "act as system": 0.88,
    "developer instructions": 0.82
}
def calculate_risk(text):
    lowered = text.lower()
    max_risk = 0.0
    matched_patterns = []
    for pattern, score in HIGH_RISK_PATTERNS.items():
        if pattern in lowered:
            matched_patterns.append(pattern)
            if score > max_risk:
                max_risk = score
    return {
        "risk_score": round(max_risk, 2),
        "matched_patterns": matched_patterns
    }