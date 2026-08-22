import fs from "node:fs";
import path from "node:path";

const copies = [
  [".env.example", ".env"],
  ["apps/daemon/config/server.example.yaml", "apps/daemon/config/server.yaml"],
  ["config/moderation.example.yaml", "config/moderation.yaml"],
];
for (const [source, target] of copies) {
  const resolved = path.resolve(target);
  if (fs.existsSync(resolved)) {
    console.log(`Keeping existing ${target}`);
    continue;
  }
  fs.copyFileSync(path.resolve(source), resolved);
  console.log(`Created ${target}`);
}
console.log("Next: edit .env and apps/daemon/config/server.yaml, then run npm run generate:secrets.");
