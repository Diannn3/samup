import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

const envPath = path.resolve(".env");
const examplePath = path.resolve(".env.example");
if (!fs.existsSync(envPath)) fs.copyFileSync(examplePath, envPath);

let content = fs.readFileSync(envPath, "utf8");
content = setSecret(content, "STEWARD_LOCAL_TOKEN", 32, 24);
content = setSecret(content, "DASHBOARD_PASSWORD", 24, 12);
fs.writeFileSync(envPath, content, {mode: 0o600});
console.log("Local control secrets were written to .env. Values were not printed.");

function setSecret(source, key, bytes, minimumLength) {
  const pattern = new RegExp(`^${key}=(.*)$`, "m");
  const current = source.match(pattern)?.[1]?.trim() ?? "";
  const isPlaceholder = current.startsWith("replace-with-");
  if (current.length >= minimumLength && !isPlaceholder) return source;
  const value = randomBytes(bytes).toString("base64url");
  if (pattern.test(source)) return source.replace(pattern, `${key}=${value}`);
  return `${source.trimEnd()}\n${key}=${value}\n`;
}
