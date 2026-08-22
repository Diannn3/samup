import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), "../../.env") });

import { Client, GatewayIntentBits } from "discord.js";
import { loadEnv } from "./env.js";
import { StewardService } from "./service.js";

const env = loadEnv();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
const service = new StewardService(client, env);

client.once("ready", async () => {
  try {
    console.log("Generating plan...");
    const plan = await service.generatePlan();
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
    
    console.log("Applying plan...");
    await service.applyPlan(plan.id, plan.confirmationCode, "SAM-UP Online Tambayan Migration");
    console.log("Plan applied successfully.");
  } catch (err) {
    console.error("Failed to apply plan:", err);
  } finally {
    client.destroy();
    process.exit(0);
  }
});

client.login(env.DISCORD_BOT_TOKEN).catch(console.error);
