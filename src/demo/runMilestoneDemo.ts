import { loadAllFixtures } from "./loadFixtures.js";
import { runCase } from "../kernel/index.js";

function formatReasons(reasons: string[]): string {
  return reasons.length ? reasons.join(", ") : "none";
}

for (const fixture of loadAllFixtures()) {
  const trace = runCase(fixture);

  console.log(`\n${trace.label}`);
  console.log(`Case opened: ${trace.claim.id}`);
  console.log(
    `Signal extracted: ${trace.signal.artifactsPresent}/${trace.signal.artifactsRequired} required evidence present, confidence ${trace.signal.confidence}`,
  );
  console.log(
    `Policy evaluated: ${trace.policyEvaluation.result} (${formatReasons(trace.policyEvaluation.reasons)})`,
  );
  console.log(
    `Budget checked: ${trace.budgetEvaluation.result}, spend over cap $${trace.budgetEvaluation.spendOverCapUsd}`,
  );
  console.log(
    `Decision routed: ${trace.routingDecision.route} / ${trace.routingDecision.authorityMode}`,
  );
  console.log(
    `Decision logged: ${trace.loggedDecision.decision}, approved $${trace.loggedDecision.approvedNextTrancheUsd}`,
  );
  console.log(`Outcome observed: ${trace.outcome.notes}`);
  console.log(
    `Scoped trust updated: policy_auto_clear ${trace.scoreUpdate.delta.policyAutoClear}, reviewer_material_review ${trace.scoreUpdate.delta.reviewerMaterialReview}, agent_budget_discipline ${trace.scoreUpdate.delta.agentBudgetDiscipline}`,
  );
  console.log(`Authority controller: ${trace.scoreUpdate.authorityEvaluation.summary}`);
  if (trace.scoreUpdate.authorityEvaluation.policyRevisionCandidates.length > 0) {
    console.log(
      `Policy revision candidate: ${trace.scoreUpdate.authorityEvaluation.policyRevisionCandidates[0].suggestedRevision}`,
    );
  }
  console.log(`Authority before: ${trace.futureRouting.authorityBefore.summary}`);
  console.log(`Authority after: ${trace.futureRouting.authorityAfter.summary}`);
  console.log(`Future routing: ${trace.futureRouting.summary}`);
}
