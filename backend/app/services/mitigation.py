def mitigation_decision(risk_score):

    if risk_score >= 0.60:
        return "BLOCK"

    return "ALLOW"