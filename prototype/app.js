const steps = Array.from(document.querySelectorAll(".trace-step"));
const triggers = Array.from(document.querySelectorAll(".trace-trigger"));
const runButton = document.getElementById("run-demo");
const resetButton = document.getElementById("reset-demo");
const capitalResult = document.getElementById("capital-result");
const auditNote = document.getElementById("audit-note");
const whoFor = document.getElementById("who-for");
const provenanceContent = document.getElementById("provenance-content");
const scenarioBadge = document.getElementById("scenario-badge");
const scenarioSwitch = document.getElementById("scenario-switch");

let runTimer = null;
let scenarios = [];
let currentScenarioId = "";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function prettyJson(value) {
  return `<pre><code>${escapeHtml(JSON.stringify(value, null, 2))}</code></pre>`;
}

function money(value) {
  return `$${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function badgeClass(tone) {
  if (tone === "ok") return "badge badge-ok";
  if (tone === "critical") return "badge badge-critical";
  return "badge badge-warn";
}

function statusClass(value) {
  if (value === "auto_clear" || value === "within_cap" || value === "verified") return "status-amber";
  if (value === "block" || value === "insufficient_budget" || value === "breach") return "status-red";
  return "status-amber";
}

function sentenceList(items) {
  return `<ul class="plain-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderClaimStep(trace) {
  return `<p>A contributor asks the sponsor to release the next tranche and claims the milestone is complete.</p>
${prettyJson({
  case_id: trace.claim.id,
  requested_tranche_usd: trace.claim.requestedTrancheUsd,
  milestone_id: trace.claim.milestoneId,
  sponsor_type: trace.claim.sponsorType,
})}`;
}

function renderSignalStep(trace) {
  return `<p>Messy evidence is compressed into typed signal the policy engine can evaluate.</p>
${prettyJson({
  artifacts_present: trace.signal.artifactsPresent,
  artifacts_required: trace.signal.artifactsRequired,
  missing_required_evidence: trace.signal.requiredEvidenceMissing,
  checklist_completion: trace.signal.checklistCompletion,
  blocking_issues: trace.signal.blockingIssues,
  agent_spend_usd: trace.signal.agentSpendUsd,
  agent_spend_cap_usd: trace.signal.agentSpendCapUsd,
  confidence: trace.signal.confidence,
})}`;
}

function renderPolicyStep(trace) {
  return `<p>The kernel evaluates work evidence and spend constraints separately, then produces one routeable result.</p>
<div class="status-row">
  <span class="status-pill ${statusClass(trace.policyEvaluation.result)}">Policy: ${escapeHtml(trace.policyEvaluation.result)}</span>
  <span class="status-pill ${statusClass(trace.policyEvaluation.workVerificationResult)}">Work: ${escapeHtml(trace.policyEvaluation.workVerificationResult)}</span>
  <span class="status-pill ${statusClass(trace.policyEvaluation.spendGovernanceResult)}">Spend: ${escapeHtml(trace.policyEvaluation.spendGovernanceResult)}</span>
</div>
${prettyJson({
  reasons: trace.policyEvaluation.reasons,
  release_amount_usd: trace.policyEvaluation.releaseAmountUsd,
  budget_result: trace.budgetEvaluation.result,
  spend_over_cap_usd: trace.budgetEvaluation.spendOverCapUsd,
})}`;
}

function renderRoutingStep(trace) {
  const heading = trace.routingDecision.route === "no_review" ? "No exception" : "Exception routed";
  return `<p>The case either clears automatically or moves to the smallest authority that can safely resolve it.</p>
<div class="exception-box">
  <div>
    <p class="exception-label">Routing</p>
    <strong>${escapeHtml(heading)}</strong>
  </div>
  <span class="${badgeClass(trace.badgeTone)}">${escapeHtml(trace.routingDecision.authorityMode)}</span>
</div>
${prettyJson(trace.routingDecision)}`;
}

function renderDecisionStep(trace) {
  return `<p>The action is bounded, explicit, and tied back to the policy version that produced it.</p>
${prettyJson(trace.loggedDecision)}`;
}

function renderOutcomeStep(trace) {
  const authorityDecisions = trace.scoreUpdate.authorityEvaluation.decisions.map(
    (decision) => `${decision.action}: ${decision.scope} - ${decision.reason}`,
  );
  const policyRevisionCandidates = trace.scoreUpdate.authorityEvaluation.policyRevisionCandidates.map(
    (candidate) => `${candidate.policyVersion}: ${candidate.suggestedRevision}`,
  );

  return `<p>The later outcome updates scoped trust first. Authority changes only when the authority controller sees severe events, repeated patterns, or enough evidence.</p>
<div class="score-grid">
  <div>
    <span>Policy auto-clear</span>
    <strong>${trace.scoreUpdate.delta.policyAutoClear > 0 ? "+" : ""}${trace.scoreUpdate.delta.policyAutoClear}</strong>
  </div>
  <div>
    <span>Reviewer material review</span>
    <strong>${trace.scoreUpdate.delta.reviewerMaterialReview > 0 ? "+" : ""}${trace.scoreUpdate.delta.reviewerMaterialReview}</strong>
  </div>
  <div>
    <span>Agent budget discipline</span>
    <strong>${trace.scoreUpdate.delta.agentBudgetDiscipline > 0 ? "+" : ""}${trace.scoreUpdate.delta.agentBudgetDiscipline}</strong>
  </div>
</div>
<div class="authority-grid">
  <div>
    <span>Before</span>
    <strong>${escapeHtml(trace.futureRouting.authorityBefore.summary)}</strong>
  </div>
  <div>
    <span>After</span>
    <strong>${escapeHtml(trace.futureRouting.authorityAfter.summary)}</strong>
  </div>
</div>
${prettyJson({
  outcome: trace.outcome.notes,
  outcome_assessment: trace.scoreUpdate.assessment,
  score_interpretation: trace.scoreUpdate.interpretation,
  authority_decisions: authorityDecisions,
  policy_revision_candidates: policyRevisionCandidates,
  future_routing: trace.futureRouting.summary,
})}`;
}

const stepRenderers = [
  ["Claim submitted", renderClaimStep],
  ["Signal extracted", renderSignalStep],
  ["Policy and budget evaluated", renderPolicyStep],
  ["Decision routed", renderRoutingStep],
  ["Bounded decision logged", renderDecisionStep],
  ["Outcome rescored", renderOutcomeStep],
];

function activeScenario() {
  return scenarios.find((scenario) => scenario.scenarioId === currentScenarioId) || scenarios[0];
}

function renderScenarioButtons() {
  scenarioSwitch.innerHTML = scenarios
    .map(
      (scenario) =>
        `<button class="scenario-button" data-scenario="${escapeHtml(scenario.scenarioId)}">${escapeHtml(scenario.label)}</button>`,
    )
    .join("");

  scenarioSwitch.querySelectorAll(".scenario-button").forEach((button) => {
    button.addEventListener("click", () => populateScenario(button.dataset.scenario));
  });
}

function populateScenario(id) {
  const scenario = scenarios.find((item) => item.scenarioId === id) || scenarios[0];
  currentScenarioId = scenario.scenarioId;

  document.getElementById("claim-project").textContent = scenario.claim.project;
  document.getElementById("claim-request").textContent = `Release next ${money(scenario.claim.requestedTrancheUsd)} milestone tranche`;
  document.getElementById("claim-milestone").textContent = scenario.claim.milestoneId;
  document.getElementById("claim-inputs").textContent = "Artifacts, checklist, spend ledger, workflow state";
  whoFor.textContent = scenario.firstPayer;

  scenarioBadge.textContent = scenario.label;
  scenarioBadge.className = badgeClass(scenario.badgeTone);

  steps.forEach((step, index) => {
    const [title, render] = stepRenderers[index];
    step.querySelector(".trace-title").textContent = title;
    step.querySelector(".trace-content").innerHTML = render(scenario);
  });

  provenanceContent.innerHTML = Object.entries(scenario.provenance)
    .map(
      ([label, entries]) => `<div class="provenance-group">
  <p class="provenance-group-title">${escapeHtml(label)}</p>
  ${sentenceList(entries)}
</div>`,
    )
    .join("");

  scenarioSwitch.querySelectorAll(".scenario-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.scenario === currentScenarioId);
  });

  resetDemo();
}

function openStep(stepNumber) {
  const scenario = activeScenario();

  steps.forEach((step) => {
    const stepId = Number(step.dataset.step);
    const isMatch = stepId === stepNumber;
    step.classList.toggle("is-open", isMatch || stepId < stepNumber);
  });

  const decisionAmount = scenario.loggedDecision.approvedNextTrancheUsd;
  capitalResult.textContent =
    stepNumber >= 5
      ? `Decision: ${scenario.loggedDecision.decision}. Approved release: ${money(decisionAmount)}.`
      : "Before the decision, no capital moves. The claim is pending policy and budget checks.";
  auditNote.textContent =
    stepNumber >= 6
      ? `${scenario.scoreUpdate.interpretation} ${scenario.futureRouting.summary}`
      : "No recommendation is hidden. Evidence, policy version, routing, and later outcomes are explicit and reviewable.";
}

function resetDemo() {
  window.clearInterval(runTimer);
  runTimer = null;
  steps.forEach((step) => step.classList.remove("is-open"));
  capitalResult.textContent = "Before the decision, no capital moves. The claim is pending policy and budget checks.";
  auditNote.textContent =
    "No recommendation is hidden. Evidence, policy version, routing, and later outcomes are explicit and reviewable.";
}

function runDemo() {
  resetDemo();
  let current = 1;
  openStep(current);
  runTimer = window.setInterval(() => {
    current += 1;
    if (current > steps.length) {
      window.clearInterval(runTimer);
      runTimer = null;
      return;
    }
    openStep(current);
  }, 900);
}

async function loadScenarios() {
  const response = await fetch("./traces/generated-demo-trace.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Trace load failed: ${response.status}`);
  }

  const payload = await response.json();
  scenarios = payload.scenarios || [];

  if (!scenarios.length) {
    throw new Error("Trace payload has no scenarios.");
  }

  currentScenarioId = scenarios[0].scenarioId;
  renderScenarioButtons();
  populateScenario(currentScenarioId);
}

triggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const target = Number(trigger.dataset.target);
    window.clearInterval(runTimer);
    runTimer = null;
    openStep(target);
  });
});

runButton.addEventListener("click", runDemo);
resetButton.addEventListener("click", resetDemo);

loadScenarios().catch((error) => {
  scenarioSwitch.innerHTML = "";
  scenarioBadge.textContent = "Trace missing";
  scenarioBadge.className = "badge badge-critical";
  steps[0].querySelector(".trace-content").innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  steps[0].classList.add("is-open");
  capitalResult.textContent = "Run npm run generate:traces, then reload the prototype server.";
  auditNote.textContent = "The UI expects generated kernel trace JSON, not hardcoded scenarios.";
});
