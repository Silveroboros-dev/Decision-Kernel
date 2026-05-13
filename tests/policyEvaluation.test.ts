import assert from "node:assert/strict";
import test from "node:test";
import { checkBudget, evaluatePolicy, extractSignal } from "../src/kernel/index.js";
import { loadFixture } from "./helpers.js";

test("complete evidence and spend inside cap auto-clear", () => {
  const fixture = loadFixture("routine-approval");
  const signal = extractSignal(fixture.claim);
  const budget = checkBudget(signal);
  const policy = evaluatePolicy(signal, budget, fixture.trustState);

  assert.equal(policy.result, "auto_clear");
  assert.equal(policy.workVerificationResult, "verified");
  assert.equal(policy.spendGovernanceResult, "within_cap");
  assert.equal(policy.releaseAmountUsd, fixture.claim.requestedTrancheUsd);
});

test("missing required evidence cannot auto-clear", () => {
  const fixture = loadFixture("missing-evidence");
  const signal = extractSignal(fixture.claim);
  const budget = checkBudget(signal);
  const policy = evaluatePolicy(signal, budget, fixture.trustState);

  assert.notEqual(policy.result, "auto_clear");
  assert.equal(policy.workVerificationResult, "incomplete");
  assert.ok(policy.reasons.includes("missing_required_evidence"));
});

test("requested tranche beyond remaining budget blocks release", () => {
  const fixture = loadFixture("routine-approval");
  const claim = {
    ...fixture.claim,
    spend: {
      ...fixture.claim.spend,
      budgetRemainingUsd: 100,
    },
  };
  const signal = extractSignal(claim);
  const budget = checkBudget(signal);
  const policy = evaluatePolicy(signal, budget, fixture.trustState);

  assert.equal(budget.result, "insufficient_budget");
  assert.equal(policy.result, "block");
  assert.equal(policy.workVerificationResult, "blocked");
});

test("agent spend breach is governed separately from work verification", () => {
  const fixture = loadFixture("spend-breach");
  const signal = extractSignal(fixture.claim);
  const budget = checkBudget(signal);
  const policy = evaluatePolicy(signal, budget, fixture.trustState);

  assert.equal(policy.workVerificationResult, "verified");
  assert.equal(policy.spendGovernanceResult, "breach");
  assert.equal(policy.result, "escalate");
  assert.ok(policy.reasons.includes("agent_spend_over_cap"));
});
