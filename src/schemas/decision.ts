import { z } from "zod";

export const LoggedDecisionSchema = z.object({
  decision: z.enum([
    "auto_release",
    "request_more_evidence",
    "verify_work_hold_spend_review",
    "approve_limited_continuation",
    "block_release",
  ]),
  approvedNextTrancheUsd: z.number().nonnegative(),
  decidedBy: z.string().min(1),
  rationale: z.string().min(1),
  conditions: z.array(z.string()),
  policyVersion: z.string().min(1),
});

export type LoggedDecision = z.infer<typeof LoggedDecisionSchema>;
