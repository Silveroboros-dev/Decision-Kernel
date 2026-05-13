import { CaseClaimSchema, type CaseClaim, ExtractedSignalSchema, type ExtractedSignal } from "../schemas/index.js";
import { clamp, round } from "./math.js";

export function extractSignal(input: CaseClaim): ExtractedSignal {
  const claim = CaseClaimSchema.parse(input);
  const requiredEvidence = claim.evidence.filter((item) => item.required);
  const presentRequiredEvidence = requiredEvidence.filter((item) => item.present);
  const requiredEvidenceMissing = requiredEvidence.filter((item) => !item.present).map((item) => item.id);
  const checklistCompletion = claim.workflow.completedItems / claim.workflow.totalItems;
  const spendWithinCap = claim.spend.agentSpendUsd <= claim.spend.agentSpendCapUsd;
  const evidenceRatio = requiredEvidence.length === 0 ? 1 : presentRequiredEvidence.length / requiredEvidence.length;
  const testLogsPresent = claim.evidence.some((item) => item.type === "test_log" && item.present);
  const deploymentUrlPresent = claim.evidence.some((item) => item.type === "deployment_url" && item.present);

  const confidence = round(
    clamp(
      0.45 +
        evidenceRatio * 0.25 +
        checklistCompletion * 0.18 +
        (claim.workflow.blockingIssues === 0 ? 0.06 : 0) +
        (spendWithinCap ? 0.04 : 0) +
        (testLogsPresent && deploymentUrlPresent ? 0.03 : 0),
      0,
      0.98,
    ),
    2,
  );

  return ExtractedSignalSchema.parse({
    caseId: claim.id,
    milestoneId: claim.milestoneId,
    artifactsPresent: presentRequiredEvidence.length,
    artifactsRequired: requiredEvidence.length,
    requiredEvidenceMissing,
    testLogsPresent,
    deploymentUrlPresent,
    checklistCompletion: round(checklistCompletion, 2),
    blockingIssues: claim.workflow.blockingIssues,
    agentSpendUsd: claim.spend.agentSpendUsd,
    agentSpendCapUsd: claim.spend.agentSpendCapUsd,
    budgetRemainingUsd: claim.spend.budgetRemainingUsd,
    requestedTrancheUsd: claim.requestedTrancheUsd,
    materialityUsd: claim.materialityUsd,
    confidence,
    provenanceRefs: claim.evidence.filter((item) => item.present).map((item) => item.provenanceRef),
  });
}
