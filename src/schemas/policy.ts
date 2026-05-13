import { z } from "zod";

export const PolicyConfigSchema = z.object({
  version: z.string().default("milestone_release_v1"),
  minChecklistCompletion: z.number().min(0).max(1).default(0.95),
  minConfidenceForAutoClear: z.number().min(0).max(1).default(0.88),
  minPolicyTrustForAutoClear: z.number().min(0).max(1).default(0.65),
  highMaterialityUsd: z.number().nonnegative().default(1000),
});

export const PolicyResultSchema = z.enum(["auto_clear", "request_evidence", "escalate", "block"]);
export const WorkVerificationResultSchema = z.enum(["verified", "incomplete", "blocked"]);
export const SpendGovernanceResultSchema = z.enum(["within_cap", "breach", "insufficient_budget"]);

export const PolicyEvaluationSchema = z.object({
  policyVersion: z.string().min(1),
  result: PolicyResultSchema,
  workVerificationResult: WorkVerificationResultSchema,
  spendGovernanceResult: SpendGovernanceResultSchema,
  reasons: z.array(z.string()),
  releaseAmountUsd: z.number().nonnegative(),
  confidence: z.number().min(0).max(1),
  policyTrustUsed: z.number().min(0).max(1),
});

export type PolicyConfig = z.infer<typeof PolicyConfigSchema>;
export type PolicyResult = z.infer<typeof PolicyResultSchema>;
export type PolicyEvaluation = z.infer<typeof PolicyEvaluationSchema>;
