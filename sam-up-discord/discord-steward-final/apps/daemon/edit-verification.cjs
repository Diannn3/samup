const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config({ path: "../../.env" });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const newContent = `# ✅ Get Verified

Welcome! To access the rest of the SAM-UP Online Tambayan, you’ll need to complete a quick identity verification.

## How it works

**1. Click the "Create ticket" button**  
Click the **Create ticket** button on the Ticket Tool panel to open a private verification ticket.

**2. Reply with exactly three lines**  
\`\`\`
Full Name
Org Batch Name
Preferred Nickname
\`\`\`
The bot will parse these details and send them to authorized staff for confirmation.

**3. Staff confirms your role**  
An Admin, Executive, or Moderator will review the request and select the appropriate role:
- **Member**
- **Applicant**
- **Alumni**

After approval, the bot will update your nickname, unlock the areas available to your role, and confirm success in your ticket. The completed ticket will be deleted after five minutes.

## Privacy reminder

Your ticket is private and can only be accessed by you and authorized verification staff.
Please do not send passwords, financial information, or unnecessary sensitive personal details.

Need help? Open a ticket, and authorized staff will assist you. 🌻`;

client.once("ready", async () => {
  try {
    const channelId = "1524461452856000693";
    const channel = await client.channels.fetch(channelId);
    if (channel) {
      const messages = await channel.messages.fetch({ limit: 10 });
      const botMessage = messages.find(m => m.author.id === client.user.id && m.content.includes("Get Verified"));
      if (botMessage) {
        await botMessage.edit(newContent);
        console.log("Message successfully updated!");
      } else {
        console.log("Could not find the bot message to edit. Posting a new one...");
        await channel.send(newContent);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
