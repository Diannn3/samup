const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config({ path: "../../.env" });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  try {
    const channelId = "1523679970285846529"; // #【🌻】welcome-to-sam-up
    const channel = await client.channels.fetch(channelId);
    if (channel) {
      const messages = await channel.messages.fetch({ limit: 10 });
      const botMessage = messages.find(m => m.author.id === client.user.id && m.content.includes("SAM-UP is an academic and social organization"));
      if (botMessage) {
        const newContent = botMessage.content.replace(
          "SAM-UP is an academic and social organization",
          "SAM-UP is an academic organization"
        );
        await botMessage.edit(newContent);
        console.log("Welcome message successfully updated!");
      } else {
        console.log("Could not find the welcome message to edit.");
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
