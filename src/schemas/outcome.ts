import { z } from "zod";

export const AuthorityBandSchema = z.enum(["restricted", "supervised", "normal", "expanded"]);

export const TrustMetricSchema = z.object({
  mean: z.number().min(0).max(1),
  evidenceStrength: z.number().nonnegative(),
  band: AuthorityBandSchema,
});

export const TrustStateSchema = z.object({
  policyAutoClear: TrustMetricSchema,
  reviewerMaterialReview: TrustMetricSchema,
  agentBudgetDiscipline: TrustMetricSchema,
});

export const TrustDeltaSchema = z.object({
  policyAutoClear: z.number().min(-1).max(1),
  reviewerMaterialReview: z.number().min(-1).max(1),
  agentBudgetDiscipline: z.number().min(-1).max(1),
});

export const OutcomeSeveritySchema = z.enum(["minor", "normal", "moderate", "severe", "critical"]);
export const EvidenceIssueSchema = z.enum(["none", "missing", "misleading", "falsified"]);
export const ResponsibilityScopeSchema = z.enum([
  "policy_auto_clear",
  "reviewer_material_review",
  "agent_budget_discipline",
  "external_dependency",
]);

export const OutcomeObservationSchema = z.object({
  caseId: z.string().min(1),
  accepted: z.boolean(),
  reversed: z.boolean(),
  remediationCostUsd: z.number().nonnegative(),
  downstreamQualityScore: z.number().min(0).max(1),
  stayedWithinAdjustedSpendCap: z.boolean(),
  severity: OutcomeSeveritySchema.default("normal"),
  evidenceIssue: EvidenceIssueSchema.default("none"),
  responsibilityScopes: z.array(ResponsibilityScopeSchema).default([]),
  comparableFailureCount: z.number().int().nonnegative().default(0),
  confidenceAtDecision: z.number().min(0).max(1).optional(),
  selfEscalated: z.boolean().default(false),
  externalDependencyFailure: z.boolean().default(false),
  notes: z.string().min(1),
});

export const OutcomeAssessmentSchema = z.object({
  severity: OutcomeSeveritySchema,
  outcomeQuality: z.number().min(0).max(1),
  eventWeight: z.number().nonnegative(),
  redLineEvent: z.boolean(),
  affectedScopes: z.array(ResponsibilityScopeSchema),
  authoritySignal: z.enum([
    "none",
    "routing_adjustment",
    "spend_cap_adjustment",
    "co_sign_required",
    "one_band_downgrade",
    "immediate_restriction",
    "policy_revision_candidate",
  ]),
  rationale: z.string().min(1),
});

export const AuthorityChangeDecisionSchema = z.object({
  action: z.enum([
    "NO_CHANGE",
    "ROUTING_ADJUSTMENT",
    "SPEND_CAP_ADJUSTMENT",
    "CO_SIGN_REQUIRED",
    "ONE_BAND_DOWNGRADE",
    "UPGRADE_CANDIDATE",
    "IMMEDIATE_RESTRICTION",
  ]),
  scope: ResponsibilityScopeSchema,
  reason: z.string().min(1),
  evidence: z.array(z.string()),
  requiresHumanApproval: z.boolean(),
});

export const PolicyRevisionCandidateSchema = z.object({
  policyId: z.string().min(1),
  policyVersion: z.string().min(1),
  failurePattern: z.string().min(1),
  affectedCaseClass: z.string().min(1),
  supportingOutcomes: z.array(z.string()).min(1),
  suggestedRevision: z.string().min(1),
  interimGuardrail: z.string().min(1),
  requiresHumanApproval: z.boolean(),
});

export const AuthorityEvaluationSchema = z.object({
  before: TrustStateSchema,
  after: TrustStateSchema,
  decisions: z.array(AuthorityChangeDecisionSchema),
  policyRevisionCandidates: z.array(PolicyRevisionCandidateSchema),
  summary: z.string().min(1),
});

export const ScoreUpdateSchema = z.object({
  before: TrustStateSchema,
  after: TrustStateSchema,
  delta: TrustDeltaSchema,
  assessment: OutcomeAssessmentSchema,
  authorityEvaluation: AuthorityEvaluationSchema,
  interpretation: z.string().min(1),
});

export type AuthorityBand = z.infer<typeof AuthorityBandSchema>;
export type TrustMetric = z.infer<typeof TrustMetricSchema>;
export type TrustState = z.infer<typeof TrustStateSchema>;
export type TrustDelta = z.infer<typeof TrustDeltaSchema>;
export type OutcomeSeverity = z.infer<typeof OutcomeSeveritySchema>;
export type EvidenceIssue = z.infer<typeof EvidenceIssueSchema>;
export type ResponsibilityScope = z.infer<typeof ResponsibilityScopeSchema>;
export type OutcomeObservation = z.infer<typeof OutcomeObservationSchema>;
export type OutcomeAssessment = z.infer<typeof OutcomeAssessmentSchema>;
export type AuthorityChangeDecision = z.infer<typeof AuthorityChangeDecisionSchema>;
export type PolicyRevisionCandidate = z.infer<typeof PolicyRevisionCandidateSchema>;
export type AuthorityEvaluation = z.infer<typeof AuthorityEvaluationSchema>;
export type ScoreUpdate = z.infer<typeof ScoreUpdateSchema>;
