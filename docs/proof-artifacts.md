# Proof Artifacts

## Purpose

Decision Kernel is early as a standalone repo, so the credibility question is whether the pivot inherits real operating primitives from Governance OS.

This page answers that with concrete artifacts from the predecessor project.

## What Governance OS already demonstrates

### 1. Deterministic decision flow

Artifact:
- [docs/DECISION_JOURNEY.md](https://github.com/Silveroboros-dev/Governance-OS/blob/main/docs/DECISION_JOURNEY.md)

Why it matters:
- shows the exact interrupt model from signal to policy evaluation to exception to immutable decision to evidence pack
- makes clear that the kernel, not the model, decides policy outcomes

### 2. Runnable end-to-end demo script

Artifact:
- [docs/demos/TREASURY_DEMO.md](https://github.com/Silveroboros-dev/Governance-OS/blob/main/docs/demos/TREASURY_DEMO.md)

Why it matters:
- shows seeded scenarios, UI flow, decision trace, evidence export, and replay
- demonstrates that the predecessor repo was designed to be shown as a machine, not just described as an idea

### 3. Explicit constraint registry

Artifact:
- [packs/treasury/constraints.json](https://github.com/Silveroboros-dev/Governance-OS/blob/main/packs/treasury/constraints.json)

Why it matters:
- shows completeness rules, severity rules, and dedupe keys in explicit machine-readable form
- proves the project already encoded policy-relevant judgment in data structures rather than vague prose

Example patterns visible there:
- required fields for a confirmed breach
- lower bar for observations than for breaches
- escalation rules based on deterministic thresholds
- evidence source priority ordering

### 4. Canonicalized outputs from end-to-end evals

Artifacts:
- [evals/outputs/treasury_e2e_orion_v2_canon.json](https://github.com/Silveroboros-dev/Governance-OS/blob/main/evals/outputs/treasury_e2e_orion_v2_canon.json)
- [evals/outputs/treasury_e2e_orion_v2_raw.json](https://github.com/Silveroboros-dev/Governance-OS/blob/main/evals/outputs/treasury_e2e_orion_v2_raw.json)

Why it matters:
- shows candidate signals being normalized into breaches versus observations
- shows incomplete or unauthorized thresholds being downgraded rather than silently treated as confirmed failures

That downgrade behavior is important because it is the exact kind of verification discipline Decision Kernel needs in a broader hybrid-work domain.

### 5. Audit-grade evidence as a first-class output

Artifact:
- [tests/core/test_evidence_export.py](https://github.com/Silveroboros-dev/Governance-OS/blob/main/tests/core/test_evidence_export.py)

Why it matters:
- evidence export is not just a UI story
- it is tested as part of the product contract

### 6. Grounding and hallucination checks for the coprocessor layer

Artifacts:
- [tests/evals/test_grounding.py](https://github.com/Silveroboros-dev/Governance-OS/blob/main/tests/evals/test_grounding.py)
- [tests/evals/test_hallucination.py](https://github.com/Silveroboros-dev/Governance-OS/blob/main/tests/evals/test_hallucination.py)
- [evals/runner.py](https://github.com/Silveroboros-dev/Governance-OS/blob/main/evals/runner.py)

Why it matters:
- shows the AI layer was treated as a bounded coprocessor that needed verification
- matches the same design stance Decision Kernel keeps: extraction can use models, but governed outcomes need explicit checks

## What this proves for Decision Kernel

These artifacts do not prove that Decision Kernel is finished. They prove something more important for this stage:

- the pivot is grounded in a real kernel
- policy, evidence, and exception handling already existed in code and demos
- the jump to milestone verification and agent spend governance is an extension of proven primitives, not a narrative reset

That is the basis for presenting Decision Kernel as an adjacent builder submission rather than a speculative concept note.
