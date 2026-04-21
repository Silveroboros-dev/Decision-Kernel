# Decision Kernel

Decision Kernel is the verification and spend-governance layer sponsors use before releasing milestone-based budgets to hybrid human-agent teams.

It is the pivot of Governance OS into a broader verification and cost-governance layer for hybrid human-agent systems.

Governance OS proved the kernel in high-stakes finance: signal extraction, deterministic policy evaluation, exception routing, replayability, and audit-grade evidence. Decision Kernel generalizes that kernel for a different target: hybrid teams where work is done by humans, agents, or both, and where capital or authority cannot move safely unless the work becomes legible enough to verify.

Decision Kernel extends the validator idea beyond the chain. It turns milestone, spend, and authority claims in hybrid human-agent teams into governed state transitions: evidence is compressed into signal, policy validates or escalates the claim, and realized outcomes rescore the policy over time.

This repository was created in response to the Outlier Ventures Conviction Markets [Request for Builders](https://www.convictionmarkets.io/submit) open call.

## Submission Snapshot

- Current state: docs-first pivot package built from Governance OS primitives, with a concrete walkthrough and linked proof artifacts from the predecessor repo
- Best-fit problems: 04 Verification without managers, 07 Cost governance for agents, with 05 Coordination without companies as the extension
- Biggest blocker: the main blocker is access to live sponsor milestone workflows and spend data to calibrate policy thresholds and retrospective scoring beyond synthetic traces
- What we want from Outlier: sharp feedback on wedge and business model, plus access to builders, operators, or funders already hitting these coordination problems

## Why this repo exists

The Outlier Ventures Request for Builders is asking a real question: how do hybrid teams fund, coordinate, and share upside when the company is no longer the natural container?

Our answer is narrow and operational. Before programmable ownership or capital release, there has to be a trusted verification layer:

- messy work has to become structured signal
- policy has to decide routine cases
- true exceptions have to be routed cleanly
- agent spend has to be governed like payroll
- outcomes have to update future trust and authority

Decision Kernel is that layer.

## Best-fit problem framing

Decision Kernel maps most directly to:

- 04 Verification without managers
- 07 Cost governance for agents

With a credible extension into:

- 05 Coordination without companies

## Why this is a credible pivot

This is not a rebrand. Governance OS already proved the kernel in a narrower domain:

- deterministic kernel and replayability
- signal extraction with provenance
- explicit policy evaluation
- exception routing
- audit log and evidence packs
- approval-gated agent tooling

The pivot changes the governed object and learning loop:

- from treasury and wealth workflows to general hybrid human-agent work
- from a finance-specific policy engine to a general verification substrate
- from human-only final authority to bounded authority for humans or agents under policy
- from decision support alone to retrospective scoring of policies and decision-makers
- from compliance framing to verification plus cost governance

It is a generalization of the same kernel to the problem set Outlier is actually pointing at.

## Concrete Walkthrough

The shortest way to understand the product is the first target case:

1. A hybrid team claims a milestone is complete and requests release of the next budget tranche.
2. Decision Kernel extracts structured signal from artifacts, spend logs, test outputs, and workflow state.
3. Policy checks whether the milestone is sufficiently evidenced and whether agent or tool spend stayed inside limits.
4. Routine cases auto-clear. Missing evidence, threshold breaches, or high-materiality cases escalate.
5. The chosen human or agent decision-maker logs a bounded decision with rationale and provenance.
6. Later outcomes rescore the policy and the decision-maker, which changes future routing, trust, and authority.
7. The result is not just a yes or no. It is a governed release of budget, authority, or further work.

Read the full example in [docs/demo-walkthrough.md](docs/demo-walkthrough.md).

## MVP

There is now a minimal prototype in [prototype/index.html](prototype/index.html).

It demonstrates both halves of the kernel:

1. an exception path where incomplete evidence and spend overrun escalate the case
2. an auto-clear path where routine work releases the milestone tranche automatically
3. provenance for the signal extraction and policy decision
4. retrospective rescoring after the outcome arrives

To run it locally:

```bash
python3 -m http.server 4175 -d prototype
```

Then open `http://localhost:4175`.

## What Is Real Today

- Real today: a local interactive prototype with two scenarios, visible policy states, provenance panels, and outcome rescoring
- Simulated today: milestone evidence, spend events, routing, and rescoring are driven by synthetic traces rather than live sponsor workflow data
- Not yet done: public hosted demo link and production data integration

## Proof Lineage From Governance OS

This repo is early, but the predecessor project already contains the kinds of artifacts that make the kernel credible:

| Artifact | Why it matters |
|---|---|
| [Decision journey](https://github.com/Silveroboros-dev/Governance-OS/blob/main/docs/DECISION_JOURNEY.md) | Shows the deterministic evaluation → exception → immutable decision → evidence pack flow |
| [Treasury demo script](https://github.com/Silveroboros-dev/Governance-OS/blob/main/docs/demos/TREASURY_DEMO.md) | Shows a runnable end-to-end demo path with seeded scenarios and exported evidence |
| [Constraint registry](https://github.com/Silveroboros-dev/Governance-OS/blob/main/packs/treasury/constraints.json) | Shows explicit completeness, severity, and dedupe rules in code-native form |
| [Canonicalized eval output](https://github.com/Silveroboros-dev/Governance-OS/blob/main/evals/outputs/treasury_e2e_orion_v2_canon.json) | Shows raw candidate signals being downgraded, classified, and normalized deterministically |
| [Evidence export test](https://github.com/Silveroboros-dev/Governance-OS/blob/main/tests/core/test_evidence_export.py) | Shows the audit bundle is treated as a first-class output, not presentation fluff |
| [Grounding test](https://github.com/Silveroboros-dev/Governance-OS/blob/main/tests/evals/test_grounding.py) and [hallucination test](https://github.com/Silveroboros-dev/Governance-OS/blob/main/tests/evals/test_hallucination.py) | Shows the coprocessor layer is verified against evidence instead of trusted implicitly |

There is a fuller guide in [docs/proof-artifacts.md](docs/proof-artifacts.md).

## Core loop

1. Ingest a messy input: request, milestone claim, workflow state, spend event, anomaly, or agent output.
2. Extract decision-relevant signal into structured state with provenance.
3. Evaluate explicit policy against the state, budget, and authority constraints.
4. Auto-clear routine cases when confidence and rules permit.
5. Route exceptions to the right human or agent decision-maker.
6. Log action, rationale, and evidence.
7. Observe realized outcomes later.
8. Rescore policies and decision-makers.
9. Adapt future routing, trust, and authority allocations.

## Design principles

- Policy first. Discretion is expensive and should be reserved for edge cases.
- Evidence before opinion. Claims must carry provenance.
- Humans and agents share the same coordination plane.
- Agent spend is governed spend.
- Ex post learning matters more than ex ante confidence.
- Governance should scale without collapsing into bureaucracy.

## First Payer

The first payer is a protocol foundation running milestone-based grant programs for hybrid human-agent contributor teams.

The first user is the program operator reviewing whether work is sufficiently verified to release the next tranche. The governed subjects are contributors and agents spending against that budget.

They adopt this because three pains are immediate:

- milestone claims are noisy and hard to verify
- agent and tool spend can run ahead of judgment
- every exception currently turns into ad hoc chat, meetings, or manual review

## Why This Can Become a Business

The near-term business case is milestone release control for sponsors that need explicit approval, budget governance, and auditability around hybrid execution.

The moat is not just the interface. It is the accumulated policy library, decision history, provenance graph, outcome data, and trust-routing feedback loop. If Decision Kernel becomes the place where teams verify work, release budget, and learn which human or agent decision-makers are reliable, it compounds into a coordination system rather than a thin approval tool.

If that loop works, high-performing policies become reusable coordination assets: the basis for future markets around verified execution, not just votes.

## Reviewer Order

If you only read three things, read these in order:

1. this README
2. [docs/system-model.md](docs/system-model.md)
3. [docs/demo-walkthrough.md](docs/demo-walkthrough.md)

## Repo shape

- `docs/project-brief.md`: short internal brief on the pivot, positioning, and how to describe the project
- `docs/demo-walkthrough.md`: one concrete end-to-end case around milestone verification and spend governance
- `docs/proof-artifacts.md`: Governance OS artifacts that support the credibility of the pivot
- `docs/thesis.md`: the conceptual argument
- `docs/system-model.md`: entities, flows, authority, and scoring logic
- `docs/mvp-roadmap.md`: what to build first
- `docs/outlier-positioning.md`: submission framing for the Request for Builders

## Working name

`Decision Kernel` is the preferred name because it points to a small, composable control layer rather than a generic governance platform or a top-heavy management product.
