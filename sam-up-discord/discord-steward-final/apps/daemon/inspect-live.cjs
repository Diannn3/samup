const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config({ path: "../../.env" });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    await guild.roles.fetch();
    await guild.channels.fetch();

    console.log("=== ROLES ===");
    guild.roles.cache.forEach(r => {
      console.log(`${r.name} (${r.id}) - Color: ${r.hexColor}`);
    });

    console.log("\n=== CATEGORIES ===");
    guild.channels.cache.filter(c => c.type === 4).forEach(c => {
      console.log(`${c.name} (${c.id})`);
    });

    console.log("\n=== CHANNELS ===");
    guild.channels.cache.filter(c => c.type !== 4).forEach(c => {
      console.log(`${c.name} (${c.id}) - Parent: ${c.parent ? c.parent.name : 'None'} - Type: ${c.type}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
