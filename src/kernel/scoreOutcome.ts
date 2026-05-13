import {
  AuthorityEvaluationSchema,
  OutcomeAssessmentSchema,
  OutcomeObservationSchema,
  ScoreUpdateSchema,
  TrustStateSchema,
  type AuthorityBand,
  type AuthorityChangeDecision,
  type OutcomeAssessment,
  type OutcomeObservation,
  type PolicyEvaluation,
  type PolicyRevisionCandidate,
  type ResponsibilityScope,
  type RoutingDecision,
  type ScoreUpdate,
  type TrustMetric,
  type TrustState,
} from "../schemas/index.js";
import { clamp, round } from "./math.js";

const severityWeight = {
  minor: 0.4,
  normal: 1,
  moderate: 2,
  severe: 5,
  critical: 10,
} as const;

function downgradeBand(band: AuthorityBand): AuthorityBand {
  if (band === "expanded") return "normal";
  if (band === "normal") return "supervised";
  return "restricted";
}

function updateMetric(metric: TrustMetric, quality: number, weight: number): TrustMetric {
  if (weight === 0) return metric;

  const alpha = metric.mean * metric.evidenceStrength;
  const beta = (1 - metric.mean) * metric.evidenceStrength;
  const nextAlpha = alpha + weight * quality;
  const nextBeta = beta + weight * (1 - quality);
  const evidenceStrength = round(nextAlpha + nextBeta, 2);

  return {
    mean: round(clamp(nextAlpha / evidenceStrength), 3),
    evidenceStrength,
    band: metric.band,
  };
}

function inferAffectedScopes(
  policy: PolicyEvaluation,
  routing: RoutingDecision,
  outcome: OutcomeObservation,
): ResponsibilityScope[] {
  if (outcome.responsibilityScopes.length > 0) {
    return outcome.responsibilityScopes;
  }

  const scopes = new Set<ResponsibilityScope>();

  if (policy.result === "auto_clear") {
    scopes.add("policy_auto_clear");
  }

  if (routing.authorityMode === "human_required") {
    scopes.add("reviewer_material_review");
  }

  if (policy.spendGovernanceResult === "breach" || !outcome.stayedWithinAdjustedSpendCap) {
    scopes.add("agent_budget_discipline");
  }

  if (outcome.externalDependencyFailure) {
    scopes.add("external_dependency");
  }

  return [...scopes];
}

function assessOutcome(
  policy: PolicyEvaluation,
  routing: RoutingDecision,
  input: OutcomeObservation,
): OutcomeAssessment {
  const outcome = OutcomeObservationSchema.parse(input);
  const badOutcome = !outcome.accepted || outcome.reversed || outcome.downstreamQualityScore < 0.55;
  const highConfidenceMiss = policy.confidence >= 0.9 && badOutcome;
  const redLineEvent = outcome.severity === "critical" || outcome.evidenceIssue === "falsified";
  const affectedScopes = inferAffectedScopes(policy, routing, outcome);
  let eventWeight = severityWeight[outcome.severity];

  if (highConfidenceMiss) eventWeight *= 1.5;
  if (outcome.selfEscalated) eventWeight *= 0.6;
  if (outcome.externalDependencyFailure) eventWeight *= 0.4;

  let authoritySignal: OutcomeAssessment["authoritySignal"] = "none";
  let rationale = "Outcome updates scoped trust; authority stays unchanged by default.";

  if (redLineEvent) {
    authoritySignal = "immediate_restriction";
    rationale = "Integrity or critical-risk event requires immediate authority restriction.";
  } else if (policy.result === "auto_clear" && badOutcome && outcome.comparableFailureCount >= 3) {
    authoritySignal = "policy_revision_candidate";
    rationale = "Repeated bad auto-clears indicate the policy is under-specified for this case class.";
  } else if (
    policy.spendGovernanceResult === "breach" &&
    !outcome.stayedWithinAdjustedSpendCap &&
    outcome.comparableFailureCount >= 3
  ) {
    authoritySignal = "spend_cap_adjustment";
    rationale = "Repeated spend discipline failures should reduce autonomous spend authority, not all authority.";
  } else if (outcome.severity === "severe" && highConfidenceMiss) {
    authoritySignal = "one_band_downgrade";
    rationale = "A severe high-confidence miss is strong enough to change authority.";
  } else if (outcome.severity === "moderate" && outcome.comparableFailureCount >= 3) {
    authoritySignal = "routing_adjustment";
    rationale = "Repeated moderate failures justify stricter routing for comparable cases.";
  }

  return OutcomeAssessmentSchema.parse({
    severity: outcome.severity,
    outcomeQuality: outcome.downstreamQualityScore,
    eventWeight: round(eventWeight, 2),
    redLineEvent,
    affectedScopes,
    authoritySignal,
    rationale,
  });
}

function updateTrust(
  before: TrustState,
  policy: PolicyEvaluation,
  routing: RoutingDecision,
  outcome: OutcomeObservation,
  assessment: OutcomeAssessment,
): TrustState {
  const after: TrustState = {
    policyAutoClear: { ...before.policyAutoClear },
    reviewerMaterialReview: { ...before.reviewerMaterialReview },
    agentBudgetDiscipline: { ...before.agentBudgetDiscipline },
  };
  const goodOutcome = outcome.accepted && !outcome.reversed && outcome.downstreamQualityScore >= 0.8;
  const badOutcome = !outcome.accepted || outcome.reversed || outcome.downstreamQualityScore < 0.55;

  if (assessment.affectedScopes.includes("policy_auto_clear")) {
    const quality = policy.result === "auto_clear" && badOutcome ? 0.05 : outcome.downstreamQualityScore;
    after.policyAutoClear = updateMetric(before.policyAutoClear, quality, assessment.eventWeight);
  }

  if (assessment.affectedScopes.includes("reviewer_material_review")) {
    const quality = goodOutcome ? Math.max(0.88, outcome.downstreamQualityScore) : outcome.downstreamQualityScore;
    after.reviewerMaterialReview = updateMetric(before.reviewerMaterialReview, quality, assessment.eventWeight);
  }

  if (assessment.affectedScopes.includes("agent_budget_discipline")) {
    const quality = outcome.stayedWithinAdjustedSpendCap ? 0.9 : 0.25;
    after.agentBudgetDiscipline = updateMetric(before.agentBudgetDiscipline, quality, assessment.eventWeight);
  } else if (policy.result === "auto_clear" && goodOutcome && outcome.stayedWithinAdjustedSpendCap) {
    after.agentBudgetDiscipline = updateMetric(before.agentBudgetDiscipline, 0.9, 0.5);
  }

  return TrustStateSchema.parse(after);
}

function applyBandChange(trust: TrustState, scope: ResponsibilityScope, band: AuthorityBand): TrustState {
  const next = {
    policyAutoClear: { ...trust.policyAutoClear },
    reviewerMaterialReview: { ...trust.reviewerMaterialReview },
    agentBudgetDiscipline: { ...trust.agentBudgetDiscipline },
  };

  if (scope === "policy_auto_clear") next.policyAutoClear.band = band;
  if (scope === "reviewer_material_review") next.reviewerMaterialReview.band = band;
  if (scope === "agent_budget_discipline") next.agentBudgetDiscipline.band = band;

  return TrustStateSchema.parse(next);
}

function makeDecision(
  action: AuthorityChangeDecision["action"],
  scope: ResponsibilityScope,
  reason: string,
  evidence: string[],
  requiresHumanApproval: boolean,
): AuthorityChangeDecision {
  return {
    action,
    scope,
    reason,
    evidence,
    requiresHumanApproval,
  };
}

function evaluateAuthorityChange(
  before: TrustState,
  afterTrustUpdate: TrustState,
  policy: PolicyEvaluation,
  outcome: OutcomeObservation,
  assessment: OutcomeAssessment,
) {
  let after = afterTrustUpdate;
  const decisions: AuthorityChangeDecision[] = [];
  const policyRevisionCandidates: PolicyRevisionCandidate[] = [];
  const evidence = [
    `case:${outcome.caseId}`,
    `severity:${assessment.severity}`,
    `event_weight:${assessment.eventWeight}`,
    `comparable_failures:${outcome.comparableFailureCount}`,
  ];

  if (assessment.authoritySignal === "immediate_restriction") {
    for (const scope of assessment.affectedScopes.filter((scope) => scope !== "external_dependency")) {
      after = applyBandChange(after, scope, "restricted");
      decisions.push(
        makeDecision(
          "IMMEDIATE_RESTRICTION",
          scope,
          "Red-line event restricts authority pending human review.",
          evidence,
          true,
        ),
      );
    }
  }

  if (assessment.authoritySignal === "spend_cap_adjustment") {
    after = applyBandChange(after, "agent_budget_discipline", "supervised");
    decisions.push(
      makeDecision(
        "SPEND_CAP_ADJUSTMENT",
        "agent_budget_discipline",
        "Repeated spend overruns reduce autonomous spend authority while preserving verification scope.",
        evidence,
        false,
      ),
    );
  }

  if (assessment.authoritySignal === "policy_revision_candidate") {
    after = applyBandChange(after, "policy_auto_clear", "supervised");
    decisions.push(
      makeDecision(
        "CO_SIGN_REQUIRED",
        "policy_auto_clear",
        "Repeated failed auto-clears disable unsupervised auto-clear for this case class.",
        evidence,
        true,
      ),
    );
    policyRevisionCandidates.push({
      policyId: "api_milestone_auto_clear",
      policyVersion: policy.policyVersion,
      failurePattern: `${outcome.comparableFailureCount} comparable auto-cleared cases failed after release.`,
      affectedCaseClass: "api_integration_milestones",
      supportingOutcomes: [outcome.caseId],
      suggestedRevision: "Require post-deploy uptime evidence before API milestone auto-clear.",
      interimGuardrail: "Route comparable API milestones to supervised review until policy revision is approved.",
      requiresHumanApproval: true,
    });
  }

  if (assessment.authoritySignal === "one_band_downgrade") {
    for (const scope of assessment.affectedScopes.filter((scope) => scope !== "external_dependency")) {
      const currentBand =
        scope === "policy_auto_clear"
          ? after.policyAutoClear.band
          : scope === "reviewer_material_review"
            ? after.reviewerMaterialReview.band
            : after.agentBudgetDiscipline.band;
      after = applyBandChange(after, scope, downgradeBand(currentBand));
      decisions.push(
        makeDecision("ONE_BAND_DOWNGRADE", scope, "Severe high-confidence miss downgraded scoped authority.", evidence, true),
      );
    }
  }

  if (decisions.length === 0) {
    const scope = assessment.affectedScopes.find((item) => item !== "external_dependency") ?? "policy_auto_clear";
    decisions.push(makeDecision("NO_CHANGE", scope, "Trust updated, but authority evidence is not strong enough.", evidence, false));
  }

  return AuthorityEvaluationSchema.parse({
    before,
    after,
    decisions,
    policyRevisionCandidates,
    summary:
      decisions[0]?.action === "NO_CHANGE"
        ? "Scoped trust updated; authority unchanged."
        : decisions.map((decision) => `${decision.action}:${decision.scope}`).join(", "),
  });
}

export function scoreOutcome(
  policy: PolicyEvaluation,
  routing: RoutingDecision,
  trust: TrustState,
  input: OutcomeObservation,
): ScoreUpdate {
  const before = TrustStateSchema.parse(trust);
  const outcome = OutcomeObservationSchema.parse(input);
  const assessment = assessOutcome(policy, routing, outcome);
  const afterTrustUpdate = updateTrust(before, policy, routing, outcome, assessment);
  const authorityEvaluation = evaluateAuthorityChange(before, afterTrustUpdate, policy, outcome, assessment);

  const delta = {
    policyAutoClear: round(authorityEvaluation.after.policyAutoClear.mean - before.policyAutoClear.mean, 3),
    reviewerMaterialReview: round(
      authorityEvaluation.after.reviewerMaterialReview.mean - before.reviewerMaterialReview.mean,
      3,
    ),
    agentBudgetDiscipline: round(
      authorityEvaluation.after.agentBudgetDiscipline.mean - before.agentBudgetDiscipline.mean,
      3,
    ),
  };

  return ScoreUpdateSchema.parse({
    before,
    after: authorityEvaluation.after,
    delta,
    assessment,
    authorityEvaluation,
    interpretation: `${assessment.rationale} ${authorityEvaluation.summary}`,
  });
}
