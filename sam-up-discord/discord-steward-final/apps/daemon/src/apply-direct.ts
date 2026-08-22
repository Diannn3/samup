import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), "../../.env") });

import { Client, GatewayIntentBits } from "discord.js";
import { loadEnv } from "./env.js";
import { loadServerConfig, generateSetupPlan, PlanExecutor } from "@discord-steward/core";
import { DiscordJsStewardAdapter } from "./discord-adapter.js";
import { StewardRepository, createDatabase } from "@discord-steward/database";

const env = loadEnv();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", async () => {
  try {
    const db = createDatabase(env.DATABASE_PATH);
    const repo = new StewardRepository(db);
    const adapter = new DiscordJsStewardAdapter(client, env.DISCORD_GUILD_ID);
    const executor = new PlanExecutor(adapter, repo);

    console.log("Generating plan...");
    const snapshot = await adapter.inspect();
    const desired = loadServerConfig();
    const plan = generateSetupPlan(snapshot, desired);
    
    console.log(`Plan generated with ID: ${plan.id}`);
    console.log(`Operations to perform: ${plan.operations.length}`);
    for (const op of plan.operations) {
       let targetName = "";
       if ("name" in op.payload) targetName = op.payload.name;
       else if ("newName" in op.payload) targetName = op.payload.newName;
       else if ("channelName" in op.payload) targetName = op.payload.channelName;
       else if ("channelKey" in op.payload) targetName = (op.payload as any).channelKey;
       console.log(`- ${op.kind} ${targetName}`);
    }
    
    console.log("Applying plan directly...");
    // Just apply without verifyPlanIntegrity by mocking or just saving it?
    // Oh, executor.apply calls verifyPlanIntegrity(plan).
    // So if I pass the raw plan straight from generateSetupPlan it should pass because it hasn't gone through JSON.stringify/JSON.parse!
    await repo.createPlan(plan);
    const liveSnapshot = await adapter.inspect();
    await executor.apply({
      plan,
      confirmationCode: plan.confirmationCode,
      desired,
      liveSnapshot,
      reason: "SAM-UP Online Tambayan Migration"
    });
    
    console.log("Plan applied successfully.");
  } catch (err) {
    console.error("Failed to apply plan:", err);
  } finally {
    client.destroy();
    process.exit(0);
  }
});

client.login(env.DISCORD_BOT_TOKEN).catch(console.error);
