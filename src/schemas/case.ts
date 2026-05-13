import { z } from "zod";

export const EvidenceTypeSchema = z.enum([
  "artifact",
  "checklist",
  "commit",
  "deployment_url",
  "screenshot",
  "spend_ledger",
  "test_log",
  "workflow_event",
]);

export const EvidenceItemSchema = z.object({
  id: z.string().min(1),
  type: EvidenceTypeSchema,
  required: z.boolean(),
  present: z.boolean(),
  description: z.string().min(1),
  provenanceRef: z.string().min(1),
});

export const CaseClaimSchema = z.object({
  id: z.string().min(1),
  project: z.string().min(1),
  sponsorType: z.string().min(1),
  milestoneId: z.string().min(1),
  requestedTrancheUsd: z.number().nonnegative(),
  materialityUsd: z.number().nonnegative(),
  submittedBy: z.string().min(1),
  submittedAt: z.string().min(1),
  evidence: z.array(EvidenceItemSchema).min(1),
  workflow: z.object({
    completedItems: z.number().int().nonnegative(),
    totalItems: z.number().int().positive(),
    blockingIssues: z.number().int().nonnegative(),
  }),
  spend: z.object({
    agentSpendUsd: z.number().nonnegative(),
    agentSpendCapUsd: z.number().nonnegative(),
    budgetRemainingUsd: z.number().nonnegative(),
  }),
});

export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;
export type CaseClaim = z.infer<typeof CaseClaimSchema>;
