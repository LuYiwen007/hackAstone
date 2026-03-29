import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { philosophers, regions, timePeriods } from "../src/app/data/philosophers";
import { battles } from "../src/app/data/battles";
import { debateTopicsByPhilosopher } from "../src/app/data/debateTopics";

const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, "../../hackAstone_backend/src/main/resources/arena");
mkdirSync(outDir, { recursive: true });
const catalog = {
  philosophers,
  regions,
  timePeriods,
  battles,
  debateTopics: debateTopicsByPhilosopher,
};
writeFileSync(join(outDir, "catalog.json"), JSON.stringify(catalog), "utf-8");
console.log("Wrote", join(outDir, "catalog.json"));
