import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadAllFixtures } from "./loadFixtures.js";
import { runCase } from "../kernel/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");
const outDir = resolve(repoRoot, "prototype", "traces");
const outPath = resolve(outDir, "generated-demo-trace.json");

const payload = {
  generatedAt: "static-fixture-build",
  source: "src/demo/generatePrototypeTrace.ts",
  scenarios: loadAllFixtures().map((fixture) => runCase(fixture)),
};

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);

console.log(`Generated ${outPath}`);
