import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const EnvSchema = z.object({
  DISCORD_BOT_TOKEN: z.string().min(20),
  DISCORD_GUILD_ID: z.string().regex(/^\d{5,25}$/),
  STEWARD_LOCAL_TOKEN: z.string().min(24),
  DASHBOARD_PASSWORD: z.string().min(12),
  STEWARD_HOST: z.literal("127.0.0.1").default("127.0.0.1"),
  STEWARD_PORT: z.coerce.number().int().min(1024).max(65535).default(4317),
  DATABASE_PATH: z.string().default("./data/steward.sqlite"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
  STEWARD_ENFORCEMENT_MODE: z.enum(["shadow", "enforce"]).default("shadow"),
  LOG_LEVEL: z.string().default("info"),
});

export type StewardEnv = z.infer<typeof EnvSchema>;

export function loadEnv(): StewardEnv {
  return EnvSchema.parse(process.env);
}
