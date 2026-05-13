import assert from "node:assert/strict";
import test from "node:test";
import { runCase } from "../src/kernel/index.js";
import { loadFixture } from "./helpers.js";

test("good auto-clear increases policy trust", () => {
  const trace = runCase(loadFixture("routine-approval"));

  assert.ok(trace.scoreUpdate.delta.policyAutoClear > 0);
  assert.ok(trace.scoreUpdate.after.policyAutoClear.mean > trace.scoreUpdate.before.policyAutoClear.mean);
  assert.equal(trace.scoreUpdate.authorityEvaluation.decisions[0].action, "NO_CHANGE");
});

test("repeated bad auto-clear creates policy revision pressure and changes future routing", () => {
  const trace = runCase(loadFixture("bad-autoclear"));

  assert.equal(trace.policyEvaluation.result, "auto_clear");
  assert.ok(trace.scoreUpdate.delta.policyAutoClear < 0);
  assert.ok(trace.scoreUpdate.after.policyAutoClear.mean < trace.scoreUpdate.before.policyAutoClear.mean);
  assert.equal(trace.scoreUpdate.after.policyAutoClear.band, "supervised");
  assert.equal(trace.scoreUpdate.authorityEvaluation.policyRevisionCandidates.length, 1);
  assert.equal(trace.futureRouting.changed, true);
  assert.equal(trace.futureRouting.before.policyResult, "auto_clear");
  assert.notEqual(trace.futureRouting.after.policyResult, "auto_clear");
});

test("good escalation increases reviewer trust without automatically changing authority", () => {
  const trace = runCase(loadFixture("missing-evidence"));

  assert.notEqual(trace.policyEvaluation.result, "auto_clear");
  assert.equal(trace.routingDecision.authorityMode, "human_required");
  assert.ok(trace.scoreUpdate.delta.reviewerMaterialReview > 0);
  assert.equal(trace.scoreUpdate.authorityEvaluation.decisions[0].action, "NO_CHANGE");
  assert.equal(trace.futureRouting.authorityBefore.materialExceptionReviewer, "senior_reviewer");
  assert.equal(trace.futureRouting.authorityAfter.materialExceptionReviewer, "senior_reviewer");
});

test("repeated spend breach reduces spend authority without changing verification authority", () => {
  const trace = runCase(loadFixture("spend-breach"));

  assert.equal(trace.routingDecision.route, "budget_guardian_agent");
  assert.ok(trace.scoreUpdate.delta.agentBudgetDiscipline < 0);
  assert.equal(trace.scoreUpdate.after.agentBudgetDiscipline.band, "supervised");
  assert.equal(trace.scoreUpdate.authorityEvaluation.decisions[0].action, "SPEND_CAP_ADJUSTMENT");
  assert.equal(trace.futureRouting.authorityBefore.spendBreachReviewer, "budget_guardian_agent");
  assert.equal(trace.futureRouting.authorityAfter.spendBreachReviewer, "project_operator_human");
});
