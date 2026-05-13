import { z } from "zod";

export const ExtractedSignalSchema = z.object({
  caseId: z.string().min(1),
  milestoneId: z.string().min(1),
  artifactsPresent: z.number().int().nonnegative(),
  artifactsRequired: z.number().int().nonnegative(),
  requiredEvidenceMissing: z.array(z.string()),
  testLogsPresent: z.boolean(),
  deploymentUrlPresent: z.boolean(),
  checklistCompletion: z.number().min(0).max(1),
  blockingIssues: z.number().int().nonnegative(),
  agentSpendUsd: z.number().nonnegative(),
  agentSpendCapUsd: z.number().nonnegative(),
  budgetRemainingUsd: z.number().nonnegative(),
  requestedTrancheUsd: z.number().nonnegative(),
  materialityUsd: z.number().nonnegative(),
  confidence: z.number().min(0).max(1),
  provenanceRefs: z.array(z.string()),
});

export type ExtractedSignal = z.infer<typeof ExtractedSignalSchema>;
