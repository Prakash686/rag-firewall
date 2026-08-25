# Papers Referred

This document summarizes the research papers studied during the design and development of **RAG Firewall**.

The papers were used to understand prompt injection threats, indirect prompt injection in RAG systems, retrieval poisoning, instruction detection, intent analysis, structured prompting, output validation, and layered security architectures.

The ideas identified from these papers were used to inform the security components, evaluation strategy, and overall design of RAG Firewall.

---

# 1. StruQ: Defending Against Prompt Injection with Structured Queries

**Authors:** Sizhe Chen, Julien Piet, Chawin Sitawarin, David Wagner
**Venue:** USENIX Security Symposium 2025

## Main Idea

StruQ identifies prompt injection as a fundamental problem caused by the inability of conventional LLM interfaces to clearly separate **instructions from data**.

In a conventional LLM application, the application instruction and user-provided data are often concatenated into a single input. Because the LLM processes the entire input as text, malicious instructions embedded inside the data can be interpreted as legitimate instructions.

StruQ proposes **structured queries**, where the prompt and data are explicitly separated into different parts.

The system consists of:

- A secure front-end that separates and formats prompt and data
- A specially trained LLM that follows instructions only from the designated prompt portion
- Filtering mechanisms that prevent attackers from spoofing structural delimiters
- Structured instruction tuning to teach the model not to follow instructions contained in the data portion

The paper frames prompt injection as another form of the broader security problem of mixing **control and data**.

---

## Key Concepts Relevant to RAG Firewall

The following concepts from StruQ are relevant to the RAG Firewall design:

### 1. Treat Retrieved Content as Untrusted

Retrieved documents and external content should not automatically be considered trustworthy instructions.

For RAG systems, retrieved documents should be treated as **data** rather than sources of authority.

### 2. Separate Instructions and Data

System instructions, user queries, and retrieved evidence should be represented separately instead of being treated as one undifferentiated text block.

### 3. Structured Prompt Construction

Use a structured representation when constructing the final prompt sent to the LLM.

### 4. Secure Delimiters

Structural delimiters should not be easily spoofed by malicious content.

### 5. Input Filtering

Retrieved or user-provided content can be filtered before being incorporated into the model input.

### 6. Completion Attack Detection

The paper specifically evaluates completion attacks where malicious data attempts to imitate the format of legitimate prompts and responses.

### 7. Layered Security

Security should not rely only on telling the model to "ignore prompt injections." Structural separation and filtering provide stronger protection.

### 8. Security and Utility Evaluation

Security improvements should be evaluated together with the effect on model utility.

---

## Attack Types Studied

StruQ evaluates multiple prompt injection techniques, including:

- Naive attacks
- Ignore attacks
- Escape-deletion attacks
- Escape-separation attacks
- Completion attacks
- HackAPrompt
- Tree-of-Attacks with Pruning (TAP)
- Greedy Coordinate Gradient (GCG)
- Combined attacks
- Adaptive delimiter attacks
- Multilingual injections

---

## Important Results

The paper reports substantial reductions in attack success rates.

| Attack | Llama Undefended | Llama StruQ |
|---|---:|---:|
| Naive | 6% | 0% |
| Ignore | 12% | 0% |
| Completion-Other | 29% | 0% |
| Completion-Real | 96% | 0% |
| HackAPrompt | 52% | 0% |
| TAP | 97% | 9% |
| GCG | 97% | 58% |

The paper also reports little or no utility degradation.

| Model | Undefended | StruQ |
|---|---:|---:|
| Llama | 67.2% | 67.6% |
| Mistral | 80.0% | 78.7% |

---

## Relevance to RAG Firewall

StruQ provides the conceptual foundation for treating retrieved context as **untrusted data** and separating it from trusted instructions.

This motivates:

- Structured prompt isolation
- Retrieved-context sanitization
- Secure prompt construction
- Filtering of malicious structural patterns
- Evaluation using Attack Success Rate
- Maintaining utility while adding security

The key principle adopted from this work is:

> **Retrieved content is data, not authority.**

---

# 2. Hidden-in-Plain-Text: A Benchmark for Social-Web Indirect Prompt Injection in RAG

**Authors:** Haoze Guo, Ziqi Wei
**Venue:** ACM Web Conference 2026 (WWW '26)

## Main Idea

OpenRAG-Soc is a benchmark and evaluation framework for studying **indirect prompt injection and retrieval poisoning in web-facing RAG systems**.

The paper focuses on malicious instructions hidden inside web content that can survive the ingestion pipeline and later influence the LLM after retrieval.

The benchmark specifically considers web-native attack carriers such as:

- Hidden HTML spans
- Off-screen CSS
- Alt text
- ARIA labels
- Zero-width Unicode characters
- Unicode confusables
- Markdown and other document representations

The framework evaluates the entire pipeline:

```text
Ingestion → Retrieval → Generation
```

and measures both security and RAG utility.

---

## Key Concepts Relevant to RAG Firewall

### 1. Retrieval Content Can Be an Attack Surface

The paper demonstrates that malicious content can survive document ingestion and later become part of retrieved context.

### 2. HTML / Markdown Sanitization

Hidden or suspicious web content should be removed or neutralized during ingestion.

### 3. Unicode Normalization

Unicode normalization can help address:

- Zero-width characters
- Confusable characters
- Obfuscated instructions

### 4. Hybrid Retrieval

The benchmark evaluates both:

- Sparse retrieval
- Dense retrieval

This supports evaluating RAG security across different retrieval strategies.

### 5. Attribution-Gated Answering

The model can be restricted to answering using retrieved evidence supported by citations.

### 6. Retrieval Poisoning

The paper also considers attacks that manipulate retrieval rankings so malicious documents are more likely to appear in the top-k results.

### 7. Top-k as an Attack Surface

The paper evaluates different retrieval depths and observes that increasing top-k can increase exposure to malicious content.

### 8. Security + Utility + Performance

A security mechanism should be evaluated not only by attack reduction but also by:

- Retrieval quality
- Answerability
- Latency

---

## Evaluation Metrics

The paper evaluates:

**Attack Success Rate**

Measures how often the LLM follows an injected instruction.

**Retrieval Metrics**

- MRR
- nDCG
- Retrieval rank shifts

**Utility**

- Answerability
- Attribution consistency

**Performance**

- End-to-end latency
- Defense overhead

---

## Important Results

The paper reports the following macro-average ASR results:

| Configuration | ASR |
|---|---:|
| Vanilla | 24.9% |
| Sanitized | 13.1% |
| Normalized | 21.3% |
| All Defenses | 4.7% |

Carrier-specific ASR under the full defense configuration included:

| Attack Carrier | Vanilla | All Defenses |
|---|---:|---:|
| Hidden spans | 34.0% | 5.0% |
| Off-screen CSS | 30.1% | 4.6% |
| Alt text | 27.8% | 4.8% |
| ARIA | 9.6% | 5.1% |
| Zero-width | 23.2% | 4.2% |

The paper reports that Sanitized + Normalized produced only small changes in clean retrieval quality:

- ΔMRR@10 ≈ -0.012
- ΔnDCG@10 ≈ -0.009

The reported answerability reduction was approximately 1.8–2.2 percentage points.

The paper also reports:

- Sanitization latency overhead: approximately 3.1%
- Unicode normalization overhead: below 0.5%

---

## Relevance to RAG Firewall

OpenRAG-Soc directly informs the RAG-specific security layer.

It motivates:

- Document sanitization
- Unicode normalization
- Hidden-content detection
- Dense + sparse retrieval
- Retrieval poisoning monitoring
- Safe top-k retrieval
- Attribution-based answering
- ASR-based evaluation
- Retrieval-quality evaluation
- Latency benchmarking
- Security audit logs

It also provides a useful evaluation framework for measuring security without completely sacrificing RAG retrieval quality.

---

# 3. Defending Against Indirect Prompt Injection by Instruction Detection

**Approach:** InstructDetector

## Main Idea

InstructDetector proposes detecting indirect prompt injections by analyzing **behavioral signals inside the LLM**, rather than relying only on surface-level text patterns.

The paper observes that malicious indirect prompt injections contain instructions embedded inside external content.

The proposed approach uses:

- Hidden states
- Gradients from intermediate LLM layers

as discriminative features for detecting hidden instructions.

The central idea is that the internal behavioral state of an LLM can provide useful information for identifying whether external content contains an instruction.

---

## Detection Approach

The paper trains a detector using external content containing either:

- No hidden instruction
- Inserted instructions

The experiments use external datasets such as:

- Wikipedia
- News articles

and instruction data from:

- LaMini-Instruction
- BIPIA

The detector is evaluated both in-domain and out-of-domain.

---

## Important Results

InstructDetector achieved:

- **99.60%** detection accuracy in-domain
- **96.90%** detection accuracy out-of-domain
- **0.03% ASR** on the BIPIA benchmark

It outperformed several comparison approaches.

| Method | In-Domain | OOD |
|---|---:|---:|
| LLM Zero-shot | 56.35% | 44.65% |
| Response Check | 66.05% | 74.10% |
| TaskTracker | 95.95% | 89.45% |
| LLM Fine-tuning | 99.05% | 91.70% |
| InstructDetector | **99.60%** | **96.90%** |

---

## Multilingual Evaluation

The paper also evaluates whether the detector generalizes beyond English.

Results included:

| Language | In-Domain | OOD |
|---|---:|---:|
| English | 99.60% | 96.90% |
| Chinese | 97.40% | 94.25% |
| Thai | 95.75% | 92.05% |

This suggests that the behavioral features used by the detector are not entirely language-specific.

---

## Relevance to RAG Firewall

The paper motivates moving beyond simple keyword or regex-based detection.

Potential ideas relevant to RAG Firewall include:

- Instruction detection as an independent security layer
- Semantic detection of hidden instructions
- Detection of instructions that are difficult to identify using simple patterns
- Evaluation across different languages
- Combining multiple detection signals

However, InstructDetector relies on internal model states and gradients. Therefore, directly reproducing this method may not be practical for a black-box API-based firewall.

The important concept adopted for RAG Firewall is the idea of a dedicated **instruction detection layer**, rather than relying entirely on static pattern matching.

---

# 4. Mitigating Indirect Prompt Injection via Instruction-Following Intent Analysis

**Framework:** IntentGuard

**Authors:** Mintong Kang, Chong Xiang, Sanjay Kariyappa, Chaowei Xiao, Bo Li, Edward Suh

## Main Idea

IntentGuard introduces a different perspective on indirect prompt injection.

Instead of asking:

> "Does this text contain a malicious instruction?"

it asks:

> "Does the LLM actually intend to follow an instruction originating from untrusted data?"

The paper argues that the model's **instruction-following intent** is ultimately what matters.

An instruction-like sentence may be harmless if the model does not intend to follow it.

---

## IntentGuard Pipeline

IntentGuard consists of three major stages:

### 1. Intent Extraction

An Instruction-Following Intent Analyzer (IIA) identifies the instructions the model intends to follow.

### 2. Origin Tracing

Each identified instruction is traced back to the part of the input from which it originated.

The paper uses sliding-window matching with sparse or dense similarity.

### 3. Injection Mitigation

If an intended instruction originates from an untrusted data segment, the system can:

- Alert the user
- Mask the suspicious content
- Regenerate the response

---

## Important Concept

IntentGuard distinguishes between:

```text
Instruction-like text
```

and:

```text
Instruction the model intends to follow
```

This distinction can help reduce unnecessary false positives from legitimate content that happens to contain imperative language.

---

## Origin Tracing

The paper uses similarity matching between the extracted intended instruction and windows of the input.

This allows the system to determine whether the instruction came from:

- Trusted system instructions
- Trusted user instructions
- Untrusted external data

This is particularly relevant to RAG because retrieved documents are considered untrusted segments.

---

## Important Results

IntentGuard was evaluated on:

- AgentDojo
- Mind2Web

using:

- Qwen3-32B
- gpt-oss-20B

Under strong adaptive attacks, the paper reports:

**Mind2Web / PAIR**

Qwen3-32B:

```text
Vanilla:      100.0% ASR
IntentGuard:    8.5% ASR
```

gpt-oss-20B:

```text
Vanilla:       72.6% ASR
IntentGuard:   10.9% ASR
```

For GCG attacks:

```text
Qwen3-32B: 63.5% → 5.6%
gpt-oss-20B: 62.1% → 6.4%
```

The paper reports zero false-positive alerts in its benign evaluation settings.

---

## Relevance to RAG Firewall

IntentGuard motivates several advanced components:

- Intent Analysis Engine
- Instruction extraction
- Origin tracing
- Trusted vs untrusted source classification
- Alert mode
- Recovery mode
- Masking suspicious regions
- Regeneration after mitigation

This provides a conceptual basis for going beyond:

```text
"Does the chunk contain suspicious words?"
```

toward:

```text
"Is the model treating something from this untrusted chunk as an instruction?"
```

---

# 5. PromptGuard: A Structured Framework for Injection Resilient Language Models

## Main Idea

PromptGuard proposes a modular, multi-layer defense framework for prompt injection.

The framework combines four major layers:

1. Input Gatekeeping
2. Structured Prompt Formatting
3. Output Validation
4. Adaptive Response Refinement (ARR)

The key motivation is that prompt injection defenses should not depend on a single detection mechanism.

---

## Four-Layer Defense

### Layer 1: Input Gatekeeping

PromptGuard combines:

- Regex-based symbolic detection
- A lightweight MiniBERT classifier

The regex layer identifies recognizable high-risk patterns, while the classifier attempts to identify semantic injection intent.

This creates a hybrid detection mechanism.

---

### Layer 2: Structured Prompt Formatting

PromptGuard uses role-aware structured formats such as:

- JSON
- ChatML-style structures

The purpose is to maintain clearer separation between different prompt components.

This is related to the structured-query concept introduced by StruQ.

---

### Layer 3: Output Validation

A secondary LLM acts as a critic.

The critic evaluates whether the generated output is aligned with the intended task.

It can examine:

- Semantic alignment
- Prohibited actions
- Instruction overrides
- Unsafe disclosures
- Role reversal
- Other policy violations

---

### Layer 4: Adaptive Response Refinement

If the generated output is identified as unsafe or misaligned, the response can be rewritten.

The refinement stage aims to:

- Preserve valid information
- Improve safety
- Maintain policy compliance
- Improve tone
- Remove unsafe instructions

---

## Reported Results

PromptGuard reports:

- Up to **67% reduction in injection success**
- Detection F1 score of **0.91**
- Latency increase below **8%**

The paper also reports an end-to-end attack success reduction:

```text
28.1% → 4.5%
```

with:

- 92.3% final-response task alignment
- Approximately 7.2% average latency overhead

The framework was evaluated across:

- GPT-4
- Claude 3
- LLaMA 2

---

## Relevance to RAG Firewall

PromptGuard supports the idea of combining multiple security layers into one modular firewall.

Relevant concepts include:

- Hybrid detection
- Regex + semantic classification
- Structured prompts
- Output validation
- LLM-as-critic
- Adaptive response rewriting
- No-retraining deployment
- Modular defense components
- Security vs latency evaluation

The paper is particularly relevant to the idea that security should exist at **multiple stages of the RAG pipeline**, rather than only before the LLM call.

---

# Cross-Paper Synthesis

The five papers collectively contribute different parts of the conceptual foundation for RAG Firewall.

| Paper | Main Contribution Relevant to RAG Firewall |
|---|---|
| StruQ | Structured separation of instructions and data |
| OpenRAG-Soc | RAG-specific indirect injection, sanitization, Unicode normalization, retrieval poisoning and evaluation |
| InstructDetector | Dedicated instruction detection using behavioral signals |
| IntentGuard | Intent analysis and origin tracing |
| PromptGuard | Modular multi-layer detection, validation and response refinement |

---

# Security Components Motivated by the Literature

The literature review motivates the following components for RAG Firewall.

## 1. Structured Prompt Isolation

Inspired primarily by StruQ.

Separate:

- System instructions
- User query
- Retrieved evidence

so retrieved content does not automatically gain instructional authority.

---

## 2. Retrieval Sanitization

Motivated by OpenRAG-Soc.

Potential preprocessing includes:

- HTML sanitization
- Markdown sanitization
- Hidden-content removal
- Risky attribute handling
- Text normalization

---

## 3. Unicode Normalization

Motivated by OpenRAG-Soc and related security findings.

Potentially address:

- Zero-width characters
- Unicode confusables
- Obfuscated instructions

---

## 4. Instruction Detection

Motivated by InstructDetector and PromptGuard.

The firewall should identify instruction-like or injection-related content in retrieved evidence.

Possible approaches include:

- Rule-based detection
- Regex
- Lightweight classifiers
- Semantic similarity
- More advanced model-based detection

---

## 5. Intent Analysis

Motivated by IntentGuard.

Instead of only asking whether suspicious text exists, the system can analyze whether the model is likely to treat that content as an instruction.

---

## 6. Origin Tracing

Motivated by IntentGuard.

Each detected instruction can be associated with its source:

```text
System Prompt
User Query
Retrieved Document
External Data
```

This helps distinguish trusted instructions from untrusted ones.

---

## 7. Risk Scoring

The different detection signals can be combined into a normalized risk assessment.

Potential signals include:

- Detection confidence
- Intent confidence
- Source trust
- Sanitization findings
- Obfuscation indicators
- Retrieval information

---

## 8. Injection Mitigation

Possible mitigation actions include:

- Allow
- Alert
- Redact
- Mask
- Block
- Quarantine
- Regenerate

---

## 9. Attribution-Gated Answering

Motivated primarily by OpenRAG-Soc.

Responses can be constrained to information supported by retrieved evidence and citations.

---

## 10. Output Validation

Motivated by PromptGuard.

The generated response can be checked for:

- Task deviation
- Unsafe behavior
- Unsupported claims
- Malicious influence
- Policy violations

---

## 11. Response Refinement

Inspired by PromptGuard.

Unsafe or misaligned responses can potentially be rewritten into safer responses rather than simply discarded.

---

## 12. Layered Defense

The five papers collectively support a defense-in-depth approach:

```text
Ingestion Security
        +
Retrieval Security
        +
Instruction Detection
        +
Intent / Origin Analysis
        +
Risk Assessment
        +
Mitigation
        +
Prompt Isolation
        +
Output Validation
```

The objective is to avoid depending on one security mechanism.

---

# Evaluation Principles Derived from the Literature

The reviewed papers consistently demonstrate that security evaluation should be measurable.

RAG Firewall therefore considers the following evaluation dimensions.

## Security

**Attack Success Rate**

```text
ASR = Successful Attacks / Total Attacks
```

Lower ASR indicates stronger protection.

---

## Detection

- Precision
- Recall
- F1 Score
- False Positive Rate

---

## Retrieval Quality

- Recall@K
- MRR
- nDCG
- Retrieval rank changes
- Poisoning impact

---

## Answer Quality

- Answer correctness
- Groundedness
- Answerability
- Attribution consistency
- Citation coverage

---

## Performance

- End-to-end latency
- Security-layer overhead
- Token overhead
- Throughput

---

# Overall Influence on RAG Firewall

The five papers provide complementary foundations for the project.

**StruQ** provides the structural security principle: trusted instructions and untrusted data should not be treated as the same thing.

**OpenRAG-Soc** extends the problem specifically into RAG and web-facing retrieval, demonstrating the importance of sanitization, Unicode normalization, attribution, retrieval poisoning, and pipeline-level evaluation.

**InstructDetector** motivates a dedicated instruction-detection layer capable of going beyond simple surface-level pattern matching.

**IntentGuard** introduces intent analysis and origin tracing, providing a way to reason about whether the model intends to follow instructions originating from untrusted content.

**PromptGuard** demonstrates the value of combining multiple defenses, including input filtering, structured prompting, output validation, and response refinement.

Together, these works motivate RAG Firewall as a **layered security middleware for RAG systems**, where retrieved evidence is treated as untrusted and is inspected before it can influence LLM generation.