import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import {
  DesiredServerConfigSchema,
  type DesiredServerConfig,
} from "@discord-steward/shared";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadServerConfig(filePath = path.resolve(__dirname, "../../../apps/daemon/config/server.yaml")): DesiredServerConfig {
  return readYaml(filePath, DesiredServerConfigSchema);
}

function readYaml<T>(filePath: string, schema: {parse(value: unknown): T}): T {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Missing configuration file: ${resolved}. Copy the matching .example.yaml file first.`);
  }
  return schema.parse(YAML.parse(fs.readFileSync(resolved, "utf8")));
}
