const steps = Array.from(document.querySelectorAll(".trace-step"));
const triggers = Array.from(document.querySelectorAll(".trace-trigger"));
const runButton = document.getElementById("run-demo");
const resetButton = document.getElementById("reset-demo");
const capitalResult = document.getElementById("capital-result");
const auditNote = document.getElementById("audit-note");
const whoFor = document.getElementById("who-for");
const provenanceContent = document.getElementById("provenance-content");
const scenarioBadge = document.getElementById("scenario-badge");
const scenarioButtons = Array.from(document.querySelectorAll(".scenario-button"));

const scenarios = {
  escalation: {
    badgeText: "Escalation path",
    badgeClass: "badge badge-warn",
    claim: {
      project: "Protocol Foundation Grant 07",
      request: "Release next $1,500 milestone tranche",
      milestone: "Research Packet v1 complete",
      inputs: "Artifacts, checklist, spend ledger, workflow state",
    },
    firstPayer:
      "First payer: protocol foundations running milestone-based grant programs for hybrid human-agent contributor teams. First user: the program operator deciding whether verified work is good enough to release the next tranche.",
    capitalBefore:
      "Before the decision, no capital moves. The claim is held until the exception is reviewed.",
    capitalAfter:
      "Capital remains frozen until review. After the bounded approval, only $500 moves, not the full $1,500 request.",
    capitalStep: 5,
    auditBefore:
      "No recommendation is hidden. The escalation reason, bounded decision, and later outcome are all explicit and reviewable.",
    auditAfter:
      "The later outcome does not disappear into a postmortem. It updates policy quality, decision-maker quality, and future delegation.",
    auditStep: 6,
    provenance: {
      "Source spans": [
        "artifact:packet-v1-summary.md lines 18-44 confirm 8 of 10 required sections are present",
        "artifact:blockers.md lines 6-10 show one unresolved blocker on validation coverage",
      ],
      Events: [
        "workflow:task-run-447 recorded 92% checklist completion",
        "ledger:agent-spend-2026-04-21 recorded $182.40 against a $150 cap",
      ],
      Policy: [
        "policy:milestone_release_v1 requires complete artifacts before auto-clear",
        "policy:agent_spend_guard_v1 escalates spend above delegated run cap",
      ],
    },
    steps: [
      {
        title: "Claim submitted",
        content: `<p>The contributor asks the sponsor to release the next budget tranche and claims the milestone is complete.</p>
<pre><code>{
  "case_id": "mk_001",
  "requested_tranche_usd": 1500,
  "milestone_id": "research_packet_v1",
  "sponsor_type": "protocol_foundation"
}</code></pre>`,
      },
      {
        title: "Signal extracted",
        content: `<p>Messy inputs are compressed into decision-relevant state with provenance.</p>
<pre><code>{
  "artifacts_present": 8,
  "artifacts_required": 10,
  "checklist_completion": 0.92,
  "blocking_issues": 1,
  "agent_spend_usd": 182.4,
  "agent_spend_cap_usd": 150,
  "budget_remaining_usd": 1640,
  "confidence": 0.81
}</code></pre>`,
      },
      {
        title: "Policy and budget evaluated",
        content: `<p>The kernel checks evidence completeness, blocking issues, spend cap, and remaining budget.</p>
<div class="status-row">
  <span class="status-pill status-amber">Policy result: escalate</span>
  <span class="status-pill status-red">Spend over cap: +$32.40</span>
</div>
<pre><code>{
  "reasons": [
    "missing_required_artifacts",
    "blocking_issue_open",
    "agent_spend_over_cap"
  ],
  "eligible_decision_makers": [
    "project_operator_human",
    "budget_guardian_agent"
  ]
}</code></pre>`,
      },
      {
        title: "Exception routed",
        content: `<p>The case is too material to auto-clear, so Decision Kernel opens a review exception.</p>
<div class="exception-box">
  <div>
    <p class="exception-label">Exception</p>
    <strong>Milestone and spend review</strong>
  </div>
  <span class="badge badge-critical">High severity</span>
</div>
<ul class="plain-list">
  <li>2 required artifacts are missing</li>
  <li>1 blocking issue remains open</li>
  <li>Agent spend is above the delegated cap</li>
</ul>`,
      },
      {
        title: "Bounded decision logged",
        content: `<p>The reviewer approves limited continuation rather than the full release.</p>
<pre><code>{
  "decision": "approve_limited_continuation",
  "approved_next_tranche_usd": 500,
  "conditions": [
    "missing artifacts due within 24 hours",
    "agent spend cap tightened to 100 USD per run",
    "blocking issue must close before full release"
  ]
}</code></pre>`,
      },
      {
        title: "Outcome rescored",
        content: `<p>After the missing evidence is delivered and spend stays inside the tighter cap, the system updates trust.</p>
<div class="score-grid">
  <div>
    <span>Policy score</span>
    <strong>+0.04</strong>
  </div>
  <div>
    <span>Decision-maker score</span>
    <strong>+0.07</strong>
  </div>
  <div>
    <span>Agent trust</span>
    <strong>+0.03</strong>
  </div>
</div>`,
      },
    ],
  },
  autoclear: {
    badgeText: "Auto-clear path",
    badgeClass: "badge badge-ok",
    claim: {
      project: "Protocol Foundation Grant 08",
      request: "Release next $1,500 milestone tranche",
      milestone: "Research Packet v1 complete",
      inputs: "Artifacts, checklist, spend ledger, workflow state",
    },
    firstPayer:
      "First payer: protocol foundations running milestone-based grant programs for hybrid human-agent contributor teams. First user: the same program operator, but in this case the system clears routine releases without consuming review time.",
    capitalBefore:
      "Before evaluation, no capital moves. The claim is pending policy and budget checks.",
    capitalAfter:
      "The full $1,500 tranche moves automatically because evidence is complete and spend stays inside policy.",
    capitalStep: 4,
    auditBefore:
      "Even routine approvals are still legible. The auto-clear is policy-driven and leaves a provenance trail.",
    auditAfter:
      "The later outcome still updates policy quality and trust, even though no manual exception review was needed.",
    auditStep: 6,
    provenance: {
      "Source spans": [
        "artifact:packet-v1-summary.md lines 14-58 confirm all 10 required sections are present",
        "artifact:validation-report.md lines 3-22 show no open blockers",
      ],
      Events: [
        "workflow:task-run-512 recorded 100% checklist completion",
        "ledger:agent-spend-2026-04-24 recorded $118.20 against a $150 cap",
      ],
      Policy: [
        "policy:milestone_release_v1 auto-clears complete evidence packages",
        "policy:agent_spend_guard_v1 leaves routine cases inside delegated spend limits",
      ],
    },
    steps: [
      {
        title: "Claim submitted",
        content: `<p>The contributor asks for the next milestone tranche under the same sponsor program.</p>
<pre><code>{
  "case_id": "mk_002",
  "requested_tranche_usd": 1500,
  "milestone_id": "research_packet_v1",
  "sponsor_type": "protocol_foundation"
}</code></pre>`,
      },
      {
        title: "Signal extracted",
        content: `<p>The evidence bundle resolves cleanly into structured signal with no missing requirements.</p>
<pre><code>{
  "artifacts_present": 10,
  "artifacts_required": 10,
  "checklist_completion": 1.0,
  "blocking_issues": 0,
  "agent_spend_usd": 118.2,
  "agent_spend_cap_usd": 150,
  "budget_remaining_usd": 1640,
  "confidence": 0.93
}</code></pre>`,
      },
      {
        title: "Policy and budget evaluated",
        content: `<p>The kernel sees complete evidence, no blocker, and spend inside the delegated cap.</p>
<div class="status-row">
  <span class="status-pill status-amber">Policy result: auto-clear</span>
  <span class="status-pill status-amber">Spend within cap</span>
</div>
<pre><code>{
  "reasons": [],
  "policy_result": "auto_clear",
  "release_amount_usd": 1500
}</code></pre>`,
      },
      {
        title: "Routine case auto-clears",
        content: `<p>No human review is consumed. The milestone tranche is released automatically because the case stayed inside policy.</p>
<div class="exception-box">
  <div>
    <p class="exception-label">Outcome</p>
    <strong>Automatic release</strong>
  </div>
  <span class="badge badge-ok">No exception</span>
</div>
<ul class="plain-list">
  <li>All required artifacts are present</li>
  <li>No blocker remains open</li>
  <li>Agent spend stayed inside the delegated cap</li>
</ul>`,
      },
      {
        title: "Release logged with provenance",
        content: `<p>The system still records the release, policy version, and evidence used.</p>
<pre><code>{
  "decision": "auto_release",
  "approved_next_tranche_usd": 1500,
  "policy_version": "milestone_release_v1",
  "recorded_by": "decision_kernel"
}</code></pre>`,
      },
      {
        title: "Outcome rescored",
        content: `<p>After downstream acceptance confirms the milestone was genuinely complete, the system reinforces the policy and routing choice.</p>
<div class="score-grid">
  <div>
    <span>Policy score</span>
    <strong>+0.03</strong>
  </div>
  <div>
    <span>Decision-maker score</span>
    <strong>+0.01</strong>
  </div>
  <div>
    <span>Agent trust</span>
    <strong>+0.02</strong>
  </div>
</div>`,
      },
    ],
  },
};

let runTimer = null;
let currentScenario = "escalation";

function populateScenario(name) {
  const scenario = scenarios[name];
  currentScenario = name;

  document.getElementById("claim-project").textContent = scenario.claim.project;
  document.getElementById("claim-request").textContent = scenario.claim.request;
  document.getElementById("claim-milestone").textContent = scenario.claim.milestone;
  document.getElementById("claim-inputs").textContent = scenario.claim.inputs;
  whoFor.textContent = scenario.firstPayer;

  scenarioBadge.textContent = scenario.badgeText;
  scenarioBadge.className = scenario.badgeClass;

  steps.forEach((step, index) => {
    step.querySelector(".trace-title").textContent = scenario.steps[index].title;
    step.querySelector(".trace-content").innerHTML = scenario.steps[index].content;
  });

  provenanceContent.innerHTML = Object.entries(scenario.provenance)
    .map(
      ([label, entries]) => `<div class="provenance-group">
  <p class="provenance-group-title">${label}</p>
  <ul class="plain-list">
    ${entries.map((entry) => `<li>${entry}</li>`).join("")}
  </ul>
</div>`
    )
    .join("");

  scenarioButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.scenario === name);
  });

  resetDemo();
}

function openStep(stepNumber) {
  const scenario = scenarios[currentScenario];

  steps.forEach((step) => {
    const stepId = Number(step.dataset.step);
    const isMatch = stepId === stepNumber;
    step.classList.toggle("is-open", isMatch || stepId < stepNumber);
  });

  capitalResult.textContent =
    stepNumber >= scenario.capitalStep ? scenario.capitalAfter : scenario.capitalBefore;
  auditNote.textContent = stepNumber >= scenario.auditStep ? scenario.auditAfter : scenario.auditBefore;
}

function resetDemo() {
  window.clearInterval(runTimer);
  runTimer = null;
  steps.forEach((step) => step.classList.remove("is-open"));
  capitalResult.textContent = scenarios[currentScenario].capitalBefore;
  auditNote.textContent = scenarios[currentScenario].auditBefore;
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

triggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const target = Number(trigger.dataset.target);
    window.clearInterval(runTimer);
    runTimer = null;
    openStep(target);
  });
});

scenarioButtons.forEach((button) => {
  button.addEventListener("click", () => {
    populateScenario(button.dataset.scenario);
  });
});

runButton.addEventListener("click", runDemo);
resetButton.addEventListener("click", resetDemo);

populateScenario(currentScenario);
