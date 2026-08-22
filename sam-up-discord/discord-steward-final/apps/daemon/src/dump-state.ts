import { Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import { resolve } from "path";
import { DiscordJsStewardAdapter } from "./discord-adapter.js";
import fs from "fs";

config({ path: resolve(process.cwd(), "../../.env") });

const token = process.env.DISCORD_BOT_TOKEN;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !guildId) {
  console.error("Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", async () => {
  console.log(`Logged in as ${client.user?.tag}`);
  const adapter = new DiscordJsStewardAdapter(client, guildId);
  try {
    const snapshot = await adapter.inspect();
    fs.writeFileSync("guild-snapshot.json", JSON.stringify(snapshot, null, 2));
    console.log("Dumped snapshot to guild-snapshot.json");
  } catch (error) {
    console.error("Error generating snapshot:", error);
  } finally {
    client.destroy();
  }
});

client.login(token).catch(console.error);
