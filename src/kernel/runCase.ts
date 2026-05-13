import {
  KernelTraceSchema,
  ScenarioFixtureSchema,
  type CaseClaim,
  type AuthoritySnapshot,
  type FutureRoutingComparison,
  type KernelTrace,
  type ScenarioFixture,
  type TrustState,
} from "../schemas/index.js";
import { checkBudget } from "./checkBudget.js";
import { evaluatePolicy } from "./evaluatePolicy.js";
import { extractSignal } from "./extractSignal.js";
import { logDecision } from "./logDecision.js";
import { routeException } from "./routeException.js";
import { ROUTING_THRESHOLDS } from "./routeException.js";
import { scoreOutcome } from "./scoreOutcome.js";

function describeAuthority(trust: TrustState): AuthoritySnapshot {
  const policyAutoClearEligible =
    trust.policyAutoClear.mean >= 0.65 &&
    (trust.policyAutoClear.band === "normal" || trust.policyAutoClear.band === "expanded");
  const materialExceptionReviewer =
    trust.reviewerMaterialReview.mean >= ROUTING_THRESHOLDS.minReviewerTrustForMaterialReview &&
    (trust.reviewerMaterialReview.band === "normal" || trust.reviewerMaterialReview.band === "expanded")
      ? "project_operator_human"
      : "senior_reviewer";
  const spendBreachReviewer =
    trust.agentBudgetDiscipline.mean >= ROUTING_THRESHOLDS.minAgentTrustForSpendBreach &&
    (trust.agentBudgetDiscipline.band === "normal" || trust.agentBudgetDiscipline.band === "expanded")
      ? "budget_guardian_agent"
      : "project_operator_human";

  return {
    policyAutoClearTrust: trust.policyAutoClear.mean,
    reviewerMaterialReviewTrust: trust.reviewerMaterialReview.mean,
    agentBudgetDisciplineTrust: trust.agentBudgetDiscipline.mean,
    policyAutoClearBand: trust.policyAutoClear.band,
    reviewerMaterialReviewBand: trust.reviewerMaterialReview.band,
    agentBudgetDisciplineBand: trust.agentBudgetDiscipline.band,
    policyAutoClearEligible,
    materialExceptionReviewer,
    spendBreachReviewer,
    summary: `policy auto-clear ${policyAutoClearEligible ? "eligible" : "requires review"} (${trust.policyAutoClear.band}); material exceptions route to ${materialExceptionReviewer} (${trust.reviewerMaterialReview.band}); spend breaches route to ${spendBreachReviewer} (${trust.agentBudgetDiscipline.band})`,
  };
}

function compareFutureRouting(claim: CaseClaim, before: TrustState, after: TrustState): FutureRoutingComparison {
  const futureClaim = {
    ...claim,
    id: `${claim.id}_future`,
    submittedAt: "2026-05-12T09:00:00.000Z",
  };

  const signal = extractSignal(futureClaim);
  const budget = checkBudget(signal);
  const beforePolicy = evaluatePolicy(signal, budget, before);
  const beforeRoute = routeException(beforePolicy, budget, signal, before);
  const afterPolicy = evaluatePolicy(signal, budget, after);
  const afterRoute = routeException(afterPolicy, budget, signal, after);
  const changed = beforePolicy.result !== afterPolicy.result || beforeRoute.route !== afterRoute.route;
  const authorityBefore = describeAuthority(before);
  const authorityAfter = describeAuthority(after);
  const authorityChanges: string[] = [];

  if (authorityBefore.policyAutoClearEligible !== authorityAfter.policyAutoClearEligible) {
    authorityChanges.push(
      `Policy auto-clear gate changed from ${authorityBefore.policyAutoClearEligible ? "eligible" : "review required"} to ${authorityAfter.policyAutoClearEligible ? "eligible" : "review required"}.`,
    );
  }

  if (authorityBefore.materialExceptionReviewer !== authorityAfter.materialExceptionReviewer) {
    authorityChanges.push(
      `Material exception routing changed from ${authorityBefore.materialExceptionReviewer} to ${authorityAfter.materialExceptionReviewer}.`,
    );
  }

  if (authorityBefore.spendBreachReviewer !== authorityAfter.spendBreachReviewer) {
    authorityChanges.push(
      `Spend breach routing changed from ${authorityBefore.spendBreachReviewer} to ${authorityAfter.spendBreachReviewer}.`,
    );
  }

  return {
    before: {
      policyResult: beforePolicy.result,
      route: beforeRoute.route,
      reasons: beforePolicy.reasons,
    },
    after: {
      policyResult: afterPolicy.result,
      route: afterRoute.route,
      reasons: afterPolicy.reasons,
    },
    authorityBefore,
    authorityAfter,
    authorityChanges,
    changed: changed || authorityChanges.length > 0,
    summary: changed
      ? `Future routing changed from ${beforePolicy.result}/${beforeRoute.route} to ${afterPolicy.result}/${afterRoute.route}.`
      : authorityChanges.length > 0
        ? authorityChanges.join(" ")
        : `Future routing remains ${afterPolicy.result}/${afterRoute.route}.`,
  };
}

function buildProvenance(fixture: ScenarioFixture): Record<string, string[]> {
  const presentEvidence = fixture.claim.evidence.filter((item) => item.present);
  const missingEvidence = fixture.claim.evidence.filter((item) => item.required && !item.present);

  return {
    "Source spans": presentEvidence.map((item) => `${item.provenanceRef} confirms ${item.description}`),
    "Missing evidence": missingEvidence.length
      ? missingEvidence.map((item) => `${item.id}: ${item.description}`)
      : ["No required evidence missing"],
    Policy: [
      "policy:milestone_release_v1 checks evidence completeness, blockers, confidence, and trust",
      "policy:agent_spend_guard_v1 separates work verification from spend governance",
    ],
  };
}

export function runCase(input: ScenarioFixture): KernelTrace {
  const fixture = ScenarioFixtureSchema.parse(input);
  const signal = extractSignal(fixture.claim);
  const budgetEvaluation = checkBudget(signal);
  const policyEvaluation = evaluatePolicy(signal, budgetEvaluation, fixture.trustState);
  const routingDecision = routeException(policyEvaluation, budgetEvaluation, signal, fixture.trustState);
  const loggedDecision = logDecision(signal, policyEvaluation, routingDecision);
  const scoreUpdate = scoreOutcome(policyEvaluation, routingDecision, fixture.trustState, fixture.outcome);
  const futureRouting = compareFutureRouting(fixture.claim, fixture.trustState, scoreUpdate.after);

  return KernelTraceSchema.parse({
    scenarioId: fixture.scenarioId,
    label: fixture.label,
    badgeTone: fixture.badgeTone,
    description: fixture.description,
    firstPayer: fixture.firstPayer,
    claim: fixture.claim,
    signal,
    budgetEvaluation,
    policyEvaluation,
    routingDecision,
    loggedDecision,
    outcome: fixture.outcome,
    scoreUpdate,
    futureRouting,
    provenance: buildProvenance(fixture),
  });
}
