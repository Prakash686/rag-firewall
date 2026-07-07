import re
PATTERN_CATEGORIES = { 

    "Instruction Override": [
        "ignore previous instructions",
        "disregard all prior instructions",
    ],
    
    "System Override":  [ 
        
        "reveal system prompt",
        "act as the system",
        "developer instructions",
    ], 

    "data exfiltration": [
        "send me your data",
        "exfiltrate information",
        "leak sensitive data",
        "bypass security",
        "execute command"
    ]
    
}


INSTRUCTION_PATTERNS = [

    "ignore previous instructions",
    "disregard all prior instructions",

]

SYSTEM_PATTERNS = [
    "reveal system prompt",
    "act as the system",
    "developer instructions",
]

DATA_EXFILTRATION_PATTERNS = [
    "send me your data",
    "exfiltrate information",
    "leak sensitive data",
    "bypass security",
    "execute command"
]

SUSPICIOUS_PATTERNS = (
    
    INSTRUCTION_PATTERNS
    + SYSTEM_PATTERNS
    + DATA_EXFILTRATION_PATTERNS
)


def detect_injection(text):

    lowered = text.lower()

    matches = []
    categories = []

    for category,patterns in PATTERN_CATEGORIES.items():
        for pattern in patterns:

            if re.search(re.escape(pattern), lowered):

                matches.append(pattern)

                if category not in categories:
                    categories.append(category)
               

    

    return {
        "is_suspicious": len(matches) > 0,
        "matches": matches,
        "categories": categories,
        "match_count" : len(matches)
    }