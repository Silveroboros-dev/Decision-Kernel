# MVP Roadmap

## Goal

Build a narrow but convincing pivot from Governance OS into the Outlier problem set.

The MVP should prove four things:

1. messy inputs can be converted into structured signal
2. policy can auto-clear a meaningful share of cases
3. exceptions can be routed cleanly to humans or agents under bounded authority
4. outcomes can be scored retrospectively in a way that changes future routing, trust, or limits

## Suggested first use case

Start with a workflow that has:
- frequent routine cases
- meaningful exceptions
- measurable cost or quality outcomes
- a real reason to keep audit history
- explicit agent or tool spend

Best candidate for the Outlier framing:
- milestone verification and agent spend governance for a hybrid project team

Why this is the right wedge:
- it speaks directly to verification without managers
- it makes cost governance concrete
- it can inherit proven Governance OS primitives
- it does not require solving token design first

## v0: Submission bundle and proof layer

Deliverables:
- clear README that explains the pivot from Governance OS
- project brief, system model, and thesis aligned to the Request for Builders
- explicit problem framing around verification without managers and cost governance for agents
- one concrete example decision flow around milestone and spend verification
- linked proof artifacts from Governance OS that show deterministic evaluation, exceptions, and evidence packs in practice

## v1: Simulation kernel

Deliverables:
- structured case schema
- signal extraction module
- policy representation
- budget constraints and approval thresholds
- exception routing logic
- retrospective outcome schema
- simple scorer for policies and decision-makers

The goal is not production readiness. It is to make the kernel legible and testable.

## v2: Interactive prototype

Deliverables:
- small UI showing input, extracted signal, applied policy, budget state, and escalation path
- audit log and provenance view
- scorecards for policies and decision-makers
- editable policy rules and authority limits

## v3: Trust and coordination extension

Deliverables:
- cost budgets by workflow
- model/tool spend accounting
- budget-aware routing and throttling
- trust-aware routing between humans and agents
- evidence that the system can trade off quality, latency, and cost

## Design questions to answer early

- What is the smallest useful unit of signal?
- How explicit does policy need to be before it becomes usable?
- What kinds of exceptions deserve human intervention versus bounded agent resolution?
- How should trust and authority change over time?
- Which outcomes should affect compensation, and how directly?

## Good demo criterion

A good Decision Kernel demo should make a viewer say:
"I can see how this becomes the verification and cost-governance layer beneath hybrid human-agent coordination."
