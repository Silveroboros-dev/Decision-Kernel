import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ScenarioFixtureSchema, type ScenarioFixture } from "../schemas/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");

export const fixtureNames = [
  "routine-approval",
  "missing-evidence",
  "spend-breach",
  "bad-autoclear",
] as const;

export function loadFixture(name: (typeof fixtureNames)[number]): ScenarioFixture {
  const path = resolve(repoRoot, "fixtures", `${name}.json`);
  const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
  return ScenarioFixtureSchema.parse(raw);
}

export function loadAllFixtures(): ScenarioFixture[] {
  return fixtureNames.map(loadFixture);
}
