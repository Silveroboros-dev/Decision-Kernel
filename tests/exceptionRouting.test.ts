import assert from "node:assert/strict";
import test from "node:test";
import { checkBudget, evaluatePolicy, extractSignal, routeException } from "../src/kernel/index.js";
import { loadFixture } from "./helpers.js";

test("routine auto-clear routes to no review", () => {
  const fixture = loadFixture("routine-approval");
  const signal = extractSignal(fixture.claim);
  const budget = checkBudget(signal);
  const policy = evaluatePolicy(signal, budget, fixture.trustState);
  const routing = routeException(policy, budget, signal, fixture.trustState);

  assert.equal(routing.route, "no_review");
  assert.equal(routing.authorityMode, "automatic");
});

test("missing evidence routes to senior review when reviewer trust is low", () => {
  const fixture = loadFixture("missing-evidence");
  const signal = extractSignal(fixture.claim);
  const budget = checkBudget(signal);
  const policy = evaluatePolicy(signal, budget, fixture.trustState);
  const routing = routeException(policy, budget, signal, fixture.trustState);

  assert.equal(routing.route, "senior_reviewer");
  assert.equal(routing.authorityMode, "human_required");
  assert.ok(routing.reasons.includes("high_materiality_requires_human_review"));
  assert.ok(routing.reasons.includes("reviewer_trust_below_material_review_threshold"));
});

test("high reviewer trust keeps material exceptions with the project operator", () => {
  const fixture = loadFixture("missing-evidence");
  const signal = extractSignal(fixture.claim);
  const budget = checkBudget(signal);
  const policy = evaluatePolicy(signal, budget, fixture.trustState);
  const routing = routeException(policy, budget, signal, {
    ...fixture.trustState,
    reviewerMaterialReview: {
      ...fixture.trustState.reviewerMaterialReview,
      mean: 0.72,
      band: "normal",
    },
  });

  assert.equal(routing.route, "project_operator_human");
  assert.equal(routing.authorityMode, "human_required");
});

test("low-materiality spend breach can route to a bounded budget guardian agent", () => {
  const fixture = loadFixture("spend-breach");
  const signal = extractSignal(fixture.claim);
  const budget = checkBudget(signal);
  const policy = evaluatePolicy(signal, budget, fixture.trustState);
  const routing = routeException(policy, budget, signal, fixture.trustState);

  assert.equal(routing.route, "budget_guardian_agent");
  assert.equal(routing.authorityMode, "bounded_agent");
});

test("high materiality prevents bounded agent-only approval", () => {
  const fixture = loadFixture("spend-breach");
  const claim = {
    ...fixture.claim,
    materialityUsd: 2500,
  };
  const signal = extractSignal(claim);
  const budget = checkBudget(signal);
  const policy = evaluatePolicy(signal, budget, fixture.trustState);
  const routing = routeException(policy, budget, signal, fixture.trustState);

  assert.equal(routing.route, "project_operator_human");
  assert.equal(routing.authorityMode, "human_required");
});

test("low agent trust sends spend breaches to human review", () => {
  const fixture = loadFixture("spend-breach");
  const signal = extractSignal(fixture.claim);
  const budget = checkBudget(signal);
  const policy = evaluatePolicy(signal, budget, fixture.trustState);
  const routing = routeException(policy, budget, signal, {
    ...fixture.trustState,
    agentBudgetDiscipline: {
      ...fixture.trustState.agentBudgetDiscipline,
      mean: 0.7,
      band: "supervised",
    },
  });

  assert.equal(routing.route, "project_operator_human");
  assert.equal(routing.authorityMode, "human_required");
  assert.ok(routing.reasons.includes("agent_trust_below_spend_review_threshold"));
});
