import { BudgetEvaluationSchema, type BudgetEvaluation, type ExtractedSignal } from "../schemas/index.js";
import { round } from "./math.js";

export function checkBudget(signal: ExtractedSignal): BudgetEvaluation {
  const spendOverCapUsd = round(Math.max(0, signal.agentSpendUsd - signal.agentSpendCapUsd), 2);
  const budgetShortfallUsd = round(Math.max(0, signal.requestedTrancheUsd - signal.budgetRemainingUsd), 2);
  const reasons: string[] = [];

  if (spendOverCapUsd > 0) {
    reasons.push("agent_spend_over_cap");
  }

  if (budgetShortfallUsd > 0) {
    reasons.push("requested_tranche_exceeds_remaining_budget");
  }

  const result =
    budgetShortfallUsd > 0 ? "insufficient_budget" : spendOverCapUsd > 0 ? "over_cap" : "within_cap";

  return BudgetEvaluationSchema.parse({
    result,
    agentSpendUsd: signal.agentSpendUsd,
    agentSpendCapUsd: signal.agentSpendCapUsd,
    spendOverCapUsd,
    budgetRemainingUsd: signal.budgetRemainingUsd,
    requestedTrancheUsd: signal.requestedTrancheUsd,
    budgetShortfallUsd,
    reasons,
  });
}
