STEP 5 — Firewall v1

5.1 Retrieval Sanitization
    • HTML cleaning
    • Unicode normalization
    • Zero-width character removal
    • Markdown cleanup

5.2 Instruction Detection
    • Regex signatures
    • Prompt injection detection
    • Dangerous keyword detection
    • Attack pattern classification

5.3 Risk Scoring
    • Signature score
    • Unicode score
    • HTML score
    • Trust score
    • Final risk score

5.4 Mitigation Logic
    • Allow
    • Redact
    • Block

5.5 Origin Tracing
    • User query
    • Retrieved chunk
    • Source identification

5.6 Firewall Integration
    • Run all layers together
    • Produce firewall decision
    • Return safe chunks + blocked chunks + metadata

✅ STEP 5 COMPLETE