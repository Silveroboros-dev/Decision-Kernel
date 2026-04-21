# System Model

## Inheritance from Governance OS

Decision Kernel should inherit the strongest parts of Governance OS:

- deterministic evaluation where possible
- explicit policies instead of hidden judgment
- provenance attached to extracted signal
- replayable decision history
- clean separation between extraction, evaluation, and approval

The change is domain scope. Instead of only evaluating finance workflows, the kernel evaluates hybrid human-agent work more generally.

## Core entities

### Case
The unit of governed work.

Examples:
- milestone verification request
- agent spend approval
- workflow task approval
- anomaly review
- output acceptance or rejection

A case holds the inputs, extracted signals, policy results, exceptions, and later outcomes for one decision context.

### Signal
Structured state extracted from messy inputs.

Examples:
- request metadata
- claimed milestone status
- workflow status
- model outputs with confidence markers
- budget consumption
- observed anomalies
- external market or operational events

A signal should be minimal but decision-relevant. It is not raw text; it is the part of the world the kernel can reason about.

### Policy
An executable rule set that maps structured state to action.

A policy can:
- approve
- reject
- defer
- request more evidence
- escalate
- enforce limits or constraints

Policies are versioned and scored over time. They are not static documents.

### Budget
Explicit spend constraints attached to a workflow, project, agent, or task class.

A budget can express:
- total spend ceiling
- per-run model spend
- tool or API limits
- approval thresholds
- quality-latency-cost tradeoffs

If agents are the new labor, their spend has to be governed with the same seriousness as payroll.

### Exception
A case that cannot be safely resolved by ordinary policy execution.

Typical exception causes:
- insufficient evidence
- conflicting policies
- budget overrun
- low confidence
- anomaly or suspected adversarial behavior
- high materiality or irreversible consequences

### Decision-maker
A human or agent authorized to resolve exceptions or own specific policy classes.

Decision-makers have:
- scope of authority
- historical performance
- trust weight
- cost profile
- escalation eligibility
- bounded action rights

### Outcome
A retrospective observation about what actually happened after an action or decision.

Outcomes can include:
- realized economic result
- error or incident rate
- reversals or remediation cost
- latency to resolution
- downstream business impact
- human override frequency

### Provenance
The evidence trail that explains why the kernel saw what it saw and did what it did.

Examples:
- source spans from documents
- event IDs and timestamps
- model outputs with extraction notes
- policy version used
- approver identity or agent ID

Without provenance, the kernel cannot justify or replay decisions.

## Control loop

1. A case is opened from an input.
2. Signal extraction converts messy evidence into structured state with provenance.
3. The relevant policy set and budget constraints are selected.
4. Policy evaluation produces one of four broad outcomes:
   - auto-clear
   - request evidence
   - escalate
   - block
5. If escalated, the system selects an eligible human or agent decision-maker.
6. Action is taken and logged with provenance.
7. Outcome data arrives later.
8. Policies and decision-makers are rescored.
9. Trust, allocation authority, and compensation parameters can be adjusted.

## Scoring model

The system should score both policies and decision-makers.

### Policy quality
Possible dimensions:
- realized outcome quality
- false positive rate
- false negative rate
- budget efficiency
- override frequency
- robustness under edge cases

### Decision-maker quality
Possible dimensions:
- quality of resolved exceptions
- speed under pressure
- calibration of confidence
- downstream cost of bad calls
- consistency across similar cases
- override rate against subsequent outcomes

The point is not perfect objectivity. The point is disciplined retrospective learning.

## Authority model

Decision Kernel should treat authority as allocatable and revisable, not fixed forever.

Possible dimensions:
- which policies a decision-maker may resolve
- monetary or operational limits
- whether the actor may approve, reject, defer, or only recommend
- whether an agent needs co-sign from a human above a threshold
- how trust scores affect routing priority

This is the bridge from workflow software into coordination infrastructure.

## Economic layer

A policy engine becomes more powerful when tied to economic governance.

Examples:
- budget ceilings by workflow
- model or tool spend limits
- cost-aware routing
- approval thresholds that depend on materiality
- compensation or reward adjustments for superior decision quality

This is the bridge to cost governance for agents. If agents are the new labor, agent spend starts to look like payroll and needs the same seriousness.

## Minimum viable architecture

- case ingestion layer
- signal extraction service
- policy engine
- budget engine
- exception router
- decision log and provenance store
- retrospective evaluator
- scoring service
- small operator surface for review and policy editing

## Non-goals for v1

- full legal or on-chain execution
- universal market design for incentives
- generalized autonomous organization stack
- speculative token design before the operational layer works
- pretending the verification layer is already a finished funding instrument
