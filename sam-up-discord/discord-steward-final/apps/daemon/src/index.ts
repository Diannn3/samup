import { loadServerConfig } from "@discord-steward/core";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { createApi } from "./api.js";
import { loadEnv } from "./env.js";
import { StewardService } from "./service.js";
import { VerificationManager } from "./verification-manager.js";

const env = loadEnv();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember],
});
const service = new StewardService(client, env);
const api = await createApi(service);
const verification = new VerificationManager(client, service.repository, loadServerConfig(), api.log);

client.on("messageCreate", async (message) => {
  await verification.handleMessage(message).catch((error) => {
    api.log.error(error, "Verification message handling failed");
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  await verification.handleInteraction(interaction).catch((error) => {
    api.log.error(error, "Verification interaction handling failed");
  });
});

client.once("ready", async () => {
  const guilds = [...client.guilds.cache.keys()];
  if (!guilds.includes(env.DISCORD_GUILD_ID)) {
    api.log.error({ guilds }, "Configured guild is not available to the bot.");
  }
  for (const guildId of guilds) {
    if (guildId !== env.DISCORD_GUILD_ID) {
      api.log.warn({ guildId }, "Bot is present in a non-target guild. No events or mutations will be processed there.");
    }
  }
  await service.inspect().catch((error) => api.log.error(error, "Initial guild inspection failed"));
  await verification.resumeScheduledDeletions().catch((error) => {
    api.log.error(error, "Failed to resume verification ticket deletions");
  });
  api.log.info({ user: client.user?.tag }, "Discord Steward connected");
});

await api.listen({ host: env.STEWARD_HOST, port: env.STEWARD_PORT });
await client.login(env.DISCORD_BOT_TOKEN);

async function shutdown(signal: string) {
  api.log.info({ signal }, "Shutting down Discord Steward");
  client.destroy();
  await api.close();
  process.exit(0);
}
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
