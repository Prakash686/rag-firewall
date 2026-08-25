from app.services.sanitizer import sanitize
from app.services.detector import detect_injection
from app.services.risk_scanner import calculate_risk
from app.services.mitigation import mitigation_decision


class Firewall:

    def scan_chunk(self, chunk):

        clean_text = sanitize(chunk["text"])

        detection = detect_injection(clean_text)

        risk = calculate_risk(
            clean_text,
            detection["categories"],
            detection["match_count"]
        )

        decision = mitigation_decision(risk["risk_score"])

        return {
            "clean_text": clean_text,
            "detection": detection,
            "risk": risk,
            "decision": decision
        }