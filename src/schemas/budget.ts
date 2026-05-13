import { z } from "zod";

export const BudgetResultSchema = z.enum(["within_cap", "over_cap", "insufficient_budget"]);

export const BudgetEvaluationSchema = z.object({
  result: BudgetResultSchema,
  agentSpendUsd: z.number().nonnegative(),
  agentSpendCapUsd: z.number().nonnegative(),
  spendOverCapUsd: z.number().nonnegative(),
  budgetRemainingUsd: z.number().nonnegative(),
  requestedTrancheUsd: z.number().nonnegative(),
  budgetShortfallUsd: z.number().nonnegative(),
  reasons: z.array(z.string()),
});

export type BudgetResult = z.infer<typeof BudgetResultSchema>;
export type BudgetEvaluation = z.infer<typeof BudgetEvaluationSchema>;
