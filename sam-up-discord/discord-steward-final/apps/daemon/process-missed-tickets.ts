import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Client, GatewayIntentBits, Partials, ChannelType, GuildMember } from "discord.js";
import { loadServerConfig } from "@discord-steward/core";
import { createDatabase, StewardRepository } from "@discord-steward/database";
import { loadEnv } from "./src/env.js";
import { VerificationManager } from "./src/verification-manager.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function main() {
  console.log("Starting missed ticket processor & approver...");
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

  const database = createDatabase(env.DATABASE_PATH);
  const repository = new StewardRepository(database);
  const desired = loadServerConfig(path.resolve(__dirname, "config/server.yaml"));

  const dummyLogger = {
    info: (...args: any[]) => console.log("[INFO]", ...args),
    warn: (...args: any[]) => console.warn("[WARN]", ...args),
    error: (...args: any[]) => console.error("[ERROR]", ...args),
    debug: (...args: any[]) => console.log("[DEBUG]", ...args),
  };

  const verification = new VerificationManager(client, repository, desired, dummyLogger as any);

  client.once("clientReady", async () => {
    console.log(`Connected as ${client.user?.tag}`);
    const guild = await client.guilds.fetch(env.DISCORD_GUILD_ID);
    await guild.members.fetch();
    const allChannels = await guild.channels.fetch();
    const activeThreads = await guild.channels.fetchActiveThreads();

    const ticketChannels: any[] = [];
    allChannels.forEach((ch) => {
      if (ch && ch.name && (ch.name.includes("ticket") || ch.name.includes("closed"))) {
        ticketChannels.push(ch);
      }
    });
    activeThreads.threads.forEach((ch) => {
      if (ch && ch.name && (ch.name.includes("ticket") || ch.name.includes("closed"))) {
        ticketChannels.push(ch);
      }
    });

    console.log(`Found ${ticketChannels.length} ticket channel(s). Scanning messages...`);

    for (const channel of ticketChannels) {
      if (!channel) continue;
      console.log(`Scanning #${channel.name} (${channel.id})...`);
      try {
        const messages = await channel.messages.fetch({ limit: 20 });
        const sorted = [...messages.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        for (const msg of sorted) {
          if (msg.author.bot) continue;
          console.log(` - Msg from ${msg.author.tag} (${msg.author.username}): "${msg.content.replace(/\n/g, " | ")}"`);
          
          let member: GuildMember | null = msg.member;
          if (!member) {
            try {
              member = await guild.members.fetch(msg.author.id);
            } catch (e) {
              console.log(`   Could not fetch member for ${msg.author.tag}`);
              continue;
            }
          }

          const roleNames = member?.roles.cache.map((r) => `${r.name} (${r.id})`).join(", ");
          console.log(`   Member roles (${member?.roles.cache.size}): ${roleNames}`);

          // If this is waw3nnn (Jimwell), let's approve them right now as Member!
          if (msg.author.username.toLowerCase().includes("waw") || msg.author.tag.toLowerCase().includes("waw")) {
            console.log(`   🌟 Found waw3nnn! Approving as Member right now...`);
            try {
              if (!member) continue;
              const memberRoleObj = (desired.roles as any[]).find(r => r.key === "member" || r.name?.toLowerCase() === "member");
              const unverifiedRoleObj = (desired.roles as any[]).find(r => r.key === "unverified" || r.name?.toLowerCase() === "unverified");
              const memberRoleId = memberRoleObj?.existingId || "1524451819647139981";
              const unverifiedRoleId = unverifiedRoleObj?.existingId || "1525514911646617811";

              await member.setNickname("Jim", "Approved via Antigravity request");
              console.log(`      Set nickname to 'Jim'`);
              await member.roles.add(memberRoleId, "Approved via Antigravity request");
              console.log(`      Added Member role (${memberRoleId})`);
              if (member.roles.cache.has(unverifiedRoleId)) {
                await member.roles.remove(unverifiedRoleId, "Approved via Antigravity request");
                console.log(`      Removed Unverified role (${unverifiedRoleId})`);
              }

              await channel.send("✅ You've been verified as Member! You now have access to the server.");
              console.log(`      Sent confirmation message to ticket channel`);

              // Send to server-logs
              const logsChObj = (desired.channels as any[]).find(c => c.key === "server-logs" || c.name?.includes("server-logs"));
              const logsChId = logsChObj?.existingId || "1530418413015531732";
              const logsCh = guild.channels.cache.get(logsChId);
              if (logsCh && logsCh.type === ChannelType.GuildText) {
                await logsCh.send(`🎓 Verified <@${member.id}> (Jimwell Lumaquez / Jim) as **Member**.`);
                console.log(`      Sent log to server-logs`);
              }
            } catch (appErr) {
              console.error(`      Failed to approve waw3nnn:`, appErr);
            }
          } else if (hasUnverified) {
            console.log(`   --> Feeding message from unverified user ${msg.author.tag} into VerificationManager...`);
            const oldName = msg.channel.name;
            Object.defineProperty(msg.channel, "name", { value: "ticket-override", configurable: true });
            await verification.handleMessage(msg);
            Object.defineProperty(msg.channel, "name", { value: oldName, configurable: true });
          }
        }
      } catch (err) {
        console.error(`Error scanning #${channel.name}:`, err);
      }
    }

    console.log("Finished processing missed tickets!");
    client.destroy();
    process.exit(0);
  });

  await client.login(env.DISCORD_BOT_TOKEN);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
