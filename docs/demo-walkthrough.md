# Demo Walkthrough

## Purpose

This is the first concrete Decision Kernel case to keep in mind while reviewing the repo.

It is intentionally narrow:
- a hybrid team claims a milestone is complete
- they request release of the next budget tranche
- part of the work was done by agents spending model and tool credits

This is the shortest path from the Governance OS kernel to the Outlier problem set.

## Case

Project: small hybrid research-and-build team

Milestone claim:
- "Research packet v1 is complete"
- "Release the next $1,500 budget tranche"
- "Allow the agent workflow to continue for another week"

Inputs:
- artifact bundle with draft, transcript summaries, and synthesis memo
- task checklist from the workflow system
- spend ledger for model and tool usage
- git or document timestamps
- prior exception history

## Step 1: Extract signal

The raw inputs are messy. Decision Kernel reduces them to decision-relevant state with provenance.

Illustrative extracted signal:

```json
{
  "case_id": "mk_001",
  "milestone_id": "research_packet_v1",
  "artifacts_present": 8,
  "artifacts_required": 10,
  "checklist_completion": 0.92,
  "blocking_issues": 1,
  "agent_spend_usd": 182.40,
  "agent_spend_cap_usd": 150.00,
  "budget_remaining_usd": 1640.00,
  "requested_next_tranche_usd": 1500.00,
  "confidence": 0.81,
  "provenance_refs": [
    "artifact:packet-v1-summary.md",
    "workflow:task-run-447",
    "ledger:agent-spend-2026-04-21"
  ]
}
```

The important move is not summarization. It is compression into state the kernel can actually evaluate.

## Step 2: Evaluate policy and budget

Example policy logic:

- if required artifacts are missing, do not auto-clear
- if a blocking issue exists, escalate
- if agent spend exceeds per-run cap, escalate
- if the next tranche exceeds remaining budget, block
- if evidence is complete and spend is within limits, auto-clear

Illustrative evaluation:

```json
{
  "policy_result": "escalate",
  "reasons": [
    "missing_required_artifacts",
    "blocking_issue_open",
    "agent_spend_over_cap"
  ],
  "eligible_decision_makers": [
    "project_operator_human",
    "budget_guardian_agent"
  ]
}
```

This is the bridge between verification without managers and cost governance for agents. The same case is judged on delivery evidence and spend discipline together.

## Step 3: Route the exception

Because the case is not safe to auto-clear, Decision Kernel opens an exception.

Example exception fields:

```json
{
  "exception_type": "milestone_and_spend_review",
  "severity": "high",
  "context": {
    "missing_artifacts": 2,
    "blocking_issues": 1,
    "spend_over_cap_usd": 32.40
  }
}
```

The router can choose:
- a human operator if the consequence is material
- a bounded agent if the case is low-risk and inside delegated authority
- a higher-authority reviewer if budget or trust thresholds are crossed

## Step 4: Log the decision

Illustrative human decision:

```json
{
  "decision": "approve_limited_continuation",
  "approved_next_tranche_usd": 500.00,
  "conditions": [
    "missing artifacts due within 24 hours",
    "agent spend cap tightened to 100 USD per run",
    "blocking issue must be closed before full release"
  ],
  "rationale": "Work quality is promising, but evidence is incomplete and spend discipline slipped. Release only enough budget to finish the packet safely.",
  "decided_by": "human_operator_07"
}
```

What matters is that the decision is:
- bounded
- explicit
- logged with provenance
- tied to policy and budget state

## Step 5: Apply the consequence

Decision Kernel does not stop at recommendation. The governed consequence is part of the loop.

Immediate effects:
- only $500 is released, not the full $1,500
- the workflow remains active under tighter spend limits
- the case stays partially open until missing evidence is delivered

This is the practical meaning of governed execution.

## Step 6: Rescore after the outcome arrives

Three days later:
- missing artifacts are delivered
- the agent stays inside the tighter spend cap
- the milestone is completed without further exception

Illustrative retrospective update:

```json
{
  "policy_score_delta": 0.04,
  "decision_maker_score_delta": 0.07,
  "agent_trust_delta": 0.03,
  "notes": "Limited continuation avoided over-release while preserving progress."
}
```

Now the system has learned something:
- the policy caught a real edge case
- the reviewer made a good bounded call
- the team or agent may deserve slightly more authority next time

## Why this case matters

This single workflow demonstrates all the core claims:

- work is turned into structured signal
- policy handles routine cases
- exceptions consume scarce judgment
- agent spend is governed like operating cost
- decisions are logged, not improvised
- future authority changes based on realized outcomes

That is why this is the correct first wedge for the Outlier brief.
