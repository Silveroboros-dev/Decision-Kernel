import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ScenarioFixtureSchema, type ScenarioFixture } from "../src/schemas/index.js";

export function loadFixture(name: string): ScenarioFixture {
  const raw = JSON.parse(readFileSync(resolve("fixtures", `${name}.json`), "utf8")) as unknown;
  return ScenarioFixtureSchema.parse(raw);
}
