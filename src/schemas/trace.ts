import { z } from "zod";
import { BudgetEvaluationSchema } from "./budget.js";
import { CaseClaimSchema } from "./case.js";
import { LoggedDecisionSchema } from "./decision.js";
import { AuthorityBandSchema, OutcomeObservationSchema, ScoreUpdateSchema, TrustStateSchema } from "./outcome.js";
import { PolicyEvaluationSchema } from "./policy.js";
import { RoutingDecisionSchema } from "./routing.js";
import { ExtractedSignalSchema } from "./signal.js";

export const AuthoritySnapshotSchema = z.object({
  policyAutoClearTrust: z.number().min(0).max(1),
  reviewerMaterialReviewTrust: z.number().min(0).max(1),
  agentBudgetDisciplineTrust: z.number().min(0).max(1),
  policyAutoClearBand: AuthorityBandSchema,
  reviewerMaterialReviewBand: AuthorityBandSchema,
  agentBudgetDisciplineBand: AuthorityBandSchema,
  policyAutoClearEligible: z.boolean(),
  materialExceptionReviewer: z.enum(["project_operator_human", "senior_reviewer"]),
  spendBreachReviewer: z.enum(["budget_guardian_agent", "project_operator_human"]),
  summary: z.string().min(1),
});

export const ScenarioFixtureSchema = z.object({
  scenarioId: z.string().min(1),
  label: z.string().min(1),
  badgeTone: z.enum(["ok", "warn", "critical"]),
  description: z.string().min(1),
  firstPayer: z.string().min(1),
  claim: CaseClaimSchema,
  trustState: TrustStateSchema,
  outcome: OutcomeObservationSchema,
});

export const FutureRoutingComparisonSchema = z.object({
  before: z.object({
    policyResult: z.string().min(1),
    route: z.string().min(1),
    reasons: z.array(z.string()),
  }),
  after: z.object({
    policyResult: z.string().min(1),
    route: z.string().min(1),
    reasons: z.array(z.string()),
  }),
  authorityBefore: AuthoritySnapshotSchema,
  authorityAfter: AuthoritySnapshotSchema,
  authorityChanges: z.array(z.string()),
  changed: z.boolean(),
  summary: z.string().min(1),
});

export const KernelTraceSchema = z.object({
  scenarioId: z.string().min(1),
  label: z.string().min(1),
  badgeTone: z.enum(["ok", "warn", "critical"]),
  description: z.string().min(1),
  firstPayer: z.string().min(1),
  claim: CaseClaimSchema,
  signal: ExtractedSignalSchema,
  budgetEvaluation: BudgetEvaluationSchema,
  policyEvaluation: PolicyEvaluationSchema,
  routingDecision: RoutingDecisionSchema,
  loggedDecision: LoggedDecisionSchema,
  outcome: OutcomeObservationSchema,
  scoreUpdate: ScoreUpdateSchema,
  futureRouting: FutureRoutingComparisonSchema,
  provenance: z.record(z.string(), z.array(z.string())),
});

export type ScenarioFixture = z.infer<typeof ScenarioFixtureSchema>;
export type AuthoritySnapshot = z.infer<typeof AuthoritySnapshotSchema>;
export type FutureRoutingComparison = z.infer<typeof FutureRoutingComparisonSchema>;
export type KernelTrace = z.infer<typeof KernelTraceSchema>;
