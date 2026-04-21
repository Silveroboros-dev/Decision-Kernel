const steps = Array.from(document.querySelectorAll(".trace-step"));
const triggers = Array.from(document.querySelectorAll(".trace-trigger"));
const runButton = document.getElementById("run-demo");
const resetButton = document.getElementById("reset-demo");
const capitalResult = document.getElementById("capital-result");
const auditNote = document.getElementById("audit-note");

let runTimer = null;

function openStep(stepNumber) {
  steps.forEach((step) => {
    const isMatch = Number(step.dataset.step) === stepNumber;
    step.classList.toggle("is-open", isMatch || Number(step.dataset.step) < stepNumber);
  });

  if (stepNumber >= 5) {
    capitalResult.textContent =
      "Capital remains frozen until review. After the bounded approval, only $500 moves, not the full $1,500 request.";
  }

  if (stepNumber >= 6) {
    auditNote.textContent =
      "The later outcome does not disappear into a postmortem. It updates policy quality, decision-maker quality, and future delegation.";
  }
}

function resetDemo() {
  window.clearInterval(runTimer);
  runTimer = null;
  steps.forEach((step) => step.classList.remove("is-open"));
  capitalResult.textContent = "Before the decision, no capital moves. After the bounded approval, only $500 is released.";
  auditNote.textContent =
    "No recommendation is hidden. The escalation reason, bounded decision, and later outcome are all explicit and reviewable.";
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

runButton.addEventListener("click", runDemo);
resetButton.addEventListener("click", resetDemo);
