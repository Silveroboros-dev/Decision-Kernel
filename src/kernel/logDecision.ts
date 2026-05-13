import {
  LoggedDecisionSchema,
  type ExtractedSignal,
  type LoggedDecision,
  type PolicyEvaluation,
  type RoutingDecision,
} from "../schemas/index.js";

export function logDecision(
  signal: ExtractedSignal,
  policy: PolicyEvaluation,
  routing: RoutingDecision,
): LoggedDecision {
  if (policy.result === "auto_clear") {
    return LoggedDecisionSchema.parse({
      decision: "auto_release",
      approvedNextTrancheUsd: signal.requestedTrancheUsd,
      decidedBy: "decision_kernel",
      rationale: "Evidence is complete, spend is inside policy, and trust is high enough for automatic release.",
      conditions: [],
      policyVersion: policy.policyVersion,
    });
  }

  if (policy.result === "block") {
    return LoggedDecisionSchema.parse({
      decision: "block_release",
      approvedNextTrancheUsd: 0,
      decidedBy: routing.route,
      rationale: "Requested tranche exceeds the remaining governed budget.",
      conditions: ["open senior review before any capital release"],
      policyVersion: policy.policyVersion,
    });
  }

  if (policy.workVerificationResult === "verified" && policy.spendGovernanceResult === "breach") {
    return LoggedDecisionSchema.parse({
      decision: "verify_work_hold_spend_review",
      approvedNextTrancheUsd: 0,
      decidedBy: routing.route,
      rationale: "Milestone evidence is sufficient, but agent spend exceeded the delegated cap.",
      conditions: ["verify work separately from spend breach", "tighten agent spend cap before continuation"],
      policyVersion: policy.policyVersion,
    });
  }

  if (policy.result === "request_evidence") {
    return LoggedDecisionSchema.parse({
      decision: "request_more_evidence",
      approvedNextTrancheUsd: 0,
      decidedBy: routing.route,
      rationale: "The claim is plausible but cannot clear without the missing required evidence.",
      conditions: ["submit missing required evidence", "rerun policy evaluation after evidence lands"],
      policyVersion: policy.policyVersion,
    });
  }

  return LoggedDecisionSchema.parse({
    decision: "approve_limited_continuation",
    approvedNextTrancheUsd: Math.min(500, signal.budgetRemainingUsd),
    decidedBy: routing.route,
    rationale: "The claim has enough promise to continue, but evidence or spend problems prevent full release.",
    conditions: [
      "missing evidence due within 24 hours",
      "blocking issues must close before full release",
      "agent spend cap tightened for the next run",
    ],
    policyVersion: policy.policyVersion,
  });
}
