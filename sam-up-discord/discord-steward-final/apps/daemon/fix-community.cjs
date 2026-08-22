const { Client, GatewayIntentBits, MessageType } = require('discord.js');
require('dotenv').config({ path: '../../.env' });

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', async () => {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    
    // Change public updates channel to server-logs instead of announcements
    await guild.edit({
      publicUpdatesChannel: '1530418413015531732' // 【📝】server-logs
    });
    console.log('Moved public updates channel to server-logs.');

    // Fetch messages in the announcements channel
    const channel = await client.channels.fetch('1524451849762246749');
    if (channel) {
      const messages = await channel.messages.fetch({ limit: 10 });
      for (const [id, msg] of messages) {
        // Delete messages from bots or system messages (Community Updates, AutoMod)
        if (msg.author.bot || msg.system || msg.author.id === '1326447990098939986') { 
          await msg.delete();
          console.log(`Deleted system/bot message in announcements: ${msg.content.substring(0, 30)}...`);
        }
      }
    }
  } catch(e) {
    console.error(e);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
