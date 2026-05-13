import { z } from "zod";

export const RouteTargetSchema = z.enum([
  "no_review",
  "project_operator_human",
  "budget_guardian_agent",
  "senior_reviewer",
]);

export const AuthorityModeSchema = z.enum(["automatic", "bounded_agent", "human_required", "blocked"]);

export const RoutingDecisionSchema = z.object({
  route: RouteTargetSchema,
  authorityMode: AuthorityModeSchema,
  eligibleDecisionMakers: z.array(z.string()),
  reasons: z.array(z.string()),
});

export type RouteTarget = z.infer<typeof RouteTargetSchema>;
export type AuthorityMode = z.infer<typeof AuthorityModeSchema>;
export type RoutingDecision = z.infer<typeof RoutingDecisionSchema>;
