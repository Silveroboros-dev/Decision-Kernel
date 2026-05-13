import {
  RoutingDecisionSchema,
  TrustStateSchema,
  type BudgetEvaluation,
  type ExtractedSignal,
  type PolicyEvaluation,
  type RoutingDecision,
  type TrustState,
} from "../schemas/index.js";

export const ROUTING_THRESHOLDS = {
  highMaterialityUsd: 1000,
  minAgentTrustForSpendBreach: 0.75,
  minReviewerTrustForMaterialReview: 0.65,
} as const;

export function routeException(
  policy: PolicyEvaluation,
  budget: BudgetEvaluation,
  signal: ExtractedSignal,
  trust: TrustState,
): RoutingDecision {
  const trustState = TrustStateSchema.parse(trust);

  if (policy.result === "auto_clear") {
    return RoutingDecisionSchema.parse({
      route: "no_review",
      authorityMode: "automatic",
      eligibleDecisionMakers: ["decision_kernel"],
      reasons: [],
    });
  }

  if (policy.result === "block") {
    return RoutingDecisionSchema.parse({
      route: "senior_reviewer",
      authorityMode: "blocked",
      eligibleDecisionMakers: ["senior_reviewer"],
      reasons: policy.reasons,
    });
  }

  if (signal.materialityUsd >= ROUTING_THRESHOLDS.highMaterialityUsd) {
    if (
      trustState.reviewerMaterialReview.mean < ROUTING_THRESHOLDS.minReviewerTrustForMaterialReview ||
      trustState.reviewerMaterialReview.band === "restricted" ||
      trustState.reviewerMaterialReview.band === "supervised"
    ) {
      return RoutingDecisionSchema.parse({
        route: "senior_reviewer",
        authorityMode: "human_required",
        eligibleDecisionMakers: ["senior_reviewer"],
        reasons: [
          ...policy.reasons,
          "high_materiality_requires_human_review",
          "reviewer_trust_below_material_review_threshold",
        ],
      });
    }

    return RoutingDecisionSchema.parse({
      route: "project_operator_human",
      authorityMode: "human_required",
      eligibleDecisionMakers: ["project_operator_human", "senior_reviewer"],
      reasons: [...policy.reasons, "high_materiality_requires_human_review"],
    });
  }

  if (
    budget.result === "over_cap" &&
    trustState.agentBudgetDiscipline.mean >= ROUTING_THRESHOLDS.minAgentTrustForSpendBreach &&
    (trustState.agentBudgetDiscipline.band === "normal" || trustState.agentBudgetDiscipline.band === "expanded")
  ) {
    return RoutingDecisionSchema.parse({
      route: "budget_guardian_agent",
      authorityMode: "bounded_agent",
      eligibleDecisionMakers: ["budget_guardian_agent", "project_operator_human"],
      reasons: [...policy.reasons, "low_materiality_spend_breach_inside_agent_review_authority"],
    });
  }

  return RoutingDecisionSchema.parse({
    route: "project_operator_human",
    authorityMode: "human_required",
    eligibleDecisionMakers: ["project_operator_human", "senior_reviewer"],
    reasons:
      budget.result === "over_cap"
        ? [...policy.reasons, "agent_trust_below_spend_review_threshold"]
        : policy.reasons,
  });
}
