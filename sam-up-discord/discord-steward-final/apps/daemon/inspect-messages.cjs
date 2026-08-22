const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config({ path: "../../.env" });

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const channelsToCheck = [
  { name: "welcome-to-sam-up", id: "1523679970285846529" },
  { name: "verification", id: "1524461452856000693" },
  { name: "server-guidelines", id: "1530415617100877925" },
  { name: "roles-and-membership", id: "1530418366840574094" },
  { name: "channel-directory", id: "1530418368840994876" }
];

client.once("ready", async () => {
  try {
    for (const ch of channelsToCheck) {
      const channel = await client.channels.fetch(ch.id);
      console.log(`\n=================== #${ch.name} (${ch.id}) ===================`);
      if (channel) {
        const msgs = await channel.messages.fetch({ limit: 5 });
        if (msgs.size === 0) {
          console.log("[NO MESSAGES FOUND IN CHANNEL]");
        } else {
          msgs.reverse().forEach(m => {
            console.log(`--- Author: ${m.author.tag} (${m.author.id}) ---`);
            console.log(m.content);
          });
        }
      } else {
        console.log("[CHANNEL NOT FOUND]");
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
