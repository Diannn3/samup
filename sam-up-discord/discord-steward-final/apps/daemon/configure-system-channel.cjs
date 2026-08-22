const { Client, GatewayIntentBits, MessageType } = require("discord.js");
require("dotenv").config({ path: "../../.env" });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once("ready", async () => {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    console.log(`Connected to guild: ${guild.name}`);

    // 1. Point System Channel to 【👋】arrivals
    const arrivalsId = "1530465873746329651";
    await guild.setSystemChannel(arrivalsId, "Move system join messages to dedicated arrivals channel as requested by user");
    console.log(`✅ Successfully updated Guild System Channel to 【👋】arrivals (${arrivalsId})!`);

    // 2. Delete test thread in welcome-to-sam-up
    const threadId = "1530462227100991588";
    try {
      const thread = await client.channels.fetch(threadId).catch(() => null);
      if (thread && thread.isThread()) {
        await thread.delete("Clean up test thread from welcome channel");
        console.log(`✅ Successfully deleted test thread: "${thread.name}"`);
      } else {
        console.log("ℹ️ Test thread already deleted or not found.");
      }
    } catch (err) {
      console.warn("Could not delete test thread:", err.message);
    }

    // 3. Clean up any automated join messages or clutter in #welcome-to-sam-up so only the guide remains
    const welcomeId = "1523679970285846529";
    const welcomeChannel = await client.channels.fetch(welcomeId);
    if (welcomeChannel && welcomeChannel.isTextBased()) {
      const messages = await welcomeChannel.messages.fetch({ limit: 50 });
      let deletedCount = 0;
      for (const [id, msg] of messages) {
        // Delete if it is a GuildMemberJoin system message or if it's not from a bot and not our guide
        if (msg.type === MessageType.GuildMemberJoin || (msg.type === 7)) {
          await msg.delete().catch(() => {});
          deletedCount++;
        }
      }
      console.log(`✅ Cleaned up ${deletedCount} old system join messages from #welcome-to-sam-up!`);
    }

    // 4. Send an initial welcome explanation in 【👋】arrivals so it looks welcoming!
    const arrivalsChannel = await client.channels.fetch(arrivalsId);
    if (arrivalsChannel && arrivalsChannel.isTextBased()) {
      const msgs = await arrivalsChannel.messages.fetch({ limit: 5 });
      if (msgs.size === 0) {
        await arrivalsChannel.send(
          "👋 **Welcome to SAM-UP Online Tambayan!**\n\nThis feed logs our newest arrivals. If you just joined, please head over to <#1524461452856000693> and click the verification button to open your private verification ticket!"
        );
        console.log("✅ Sent initial welcome header to #arrivals!");
      }
    }

  } catch (err) {
    console.error("❌ Error configuring system channel:", err);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
