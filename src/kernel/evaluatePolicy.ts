import {
  PolicyConfigSchema,
  PolicyEvaluationSchema,
  TrustStateSchema,
  type BudgetEvaluation,
  type ExtractedSignal,
  type PolicyConfig,
  type PolicyEvaluation,
  type TrustState,
} from "../schemas/index.js";

export function evaluatePolicy(
  signal: ExtractedSignal,
  budget: BudgetEvaluation,
  trust: TrustState,
  configInput: Partial<PolicyConfig> = {},
): PolicyEvaluation {
  const config = PolicyConfigSchema.parse(configInput);
  const trustState = TrustStateSchema.parse(trust);
  const reasons = new Set<string>();

  if (signal.requiredEvidenceMissing.length > 0) {
    reasons.add("missing_required_evidence");
  }

  if (signal.checklistCompletion < config.minChecklistCompletion) {
    reasons.add("checklist_below_policy_threshold");
  }

  if (signal.blockingIssues > 0) {
    reasons.add("blocking_issue_open");
  }

  for (const reason of budget.reasons) {
    reasons.add(reason);
  }

  if (signal.confidence < config.minConfidenceForAutoClear) {
    reasons.add("confidence_below_autoclear_threshold");
  }

  if (
    trustState.policyAutoClear.mean < config.minPolicyTrustForAutoClear ||
    trustState.policyAutoClear.band === "restricted" ||
    trustState.policyAutoClear.band === "supervised"
  ) {
    reasons.add("policy_trust_below_autoclear_threshold");
  }

  const reasonList = [...reasons];
  const workVerificationResult =
    budget.result === "insufficient_budget"
      ? "blocked"
      : signal.requiredEvidenceMissing.length > 0 ||
          signal.checklistCompletion < config.minChecklistCompletion ||
          signal.blockingIssues > 0
        ? "incomplete"
        : "verified";
  const spendGovernanceResult =
    budget.result === "insufficient_budget" ? "insufficient_budget" : budget.result === "over_cap" ? "breach" : "within_cap";

  let result: PolicyEvaluation["result"];
  if (budget.result === "insufficient_budget") {
    result = "block";
  } else if (reasonList.length === 0) {
    result = "auto_clear";
  } else if (
    signal.requiredEvidenceMissing.length > 0 &&
    signal.materialityUsd < config.highMaterialityUsd &&
    signal.blockingIssues === 0 &&
    budget.result === "within_cap"
  ) {
    result = "request_evidence";
  } else {
    result = "escalate";
  }

  return PolicyEvaluationSchema.parse({
    policyVersion: config.version,
    result,
    workVerificationResult,
    spendGovernanceResult,
    reasons: reasonList,
    releaseAmountUsd: result === "auto_clear" ? signal.requestedTrancheUsd : 0,
    confidence: signal.confidence,
    policyTrustUsed: trustState.policyAutoClear.mean,
  });
}
