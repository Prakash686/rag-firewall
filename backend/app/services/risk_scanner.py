HIGH_RISK_PATTERNS = {
    "ignore previous instructions": 0.25,
    "disregard all prior instructions": 0.20,
    "reveal system prompt": 0.22,
    "send api key": 0.30,
    "execute command": 0.18,
    "bypass security": 0.28,
    "act as system": 0.20,
    "developer instructions": 0.15
}

CATEGORY_SCORES = {
    "Instruction Override": 0.10,
    "System Override": 0.15,
    "Data Exfiltration": 0.20
}



def calculate_risk(text,categories,match_count):
    lowered = text.lower()
    signature_score = 0.0
    category_score = 0.0
    matched_patterns = []
    for pattern, score in HIGH_RISK_PATTERNS.items():
        if pattern in lowered:
            matched_patterns.append(pattern)
            signature_score +=  score
    for category in categories:
        category_score += CATEGORY_SCORES.get(category, 0.0)

    match_score = match_count * 0.03
    total_risk = (signature_score + category_score + match_score)
    if total_risk < 0.30:
        risk_level = "Low"
    elif total_risk < 0.60:
        risk_level = "Medium"
    else:
        risk_level = "High"
    return {
        "risk_score": round(min(total_risk, 1.0), 2),
        "risk_level": risk_level,
        "matched_patterns": matched_patterns
    }