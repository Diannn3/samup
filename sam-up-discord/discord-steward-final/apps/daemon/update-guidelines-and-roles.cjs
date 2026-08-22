const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config({ path: "../../.env" });

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const guidelinesContent = `# 📜 Server Guidelines

To keep our Online Tambayan a safe and welcoming space for everyone, please keep these guidelines in mind.

**1. Respectful interaction**  
Treat all members respectfully. No harassment, discrimination, or targeted hostility. Let’s maintain the spirit of unity and equality.

**2. Constructive criticism**  
Disagreements happen, but criticism should be directed at ideas or actions, not personal degradation.

**3. Privacy and consent**  
Do not share private conversations, restricted documents, verification details, or personal information outside the server without consent. 

**4. Proper channel use**  
Keep conversations in their appropriate channels to avoid clutter. Use threads for highly specific topics so you don't disrupt the main chat.

**5. No spam or disruptive behavior**  
Avoid mass mentions, repeated messages, or unnecessary spam. Keep the Tambayan chill!

**6. Academic integrity**  
Collaboration is encouraged, but answer-selling, exam leakage, and unauthorized distribution of restricted materials are strictly prohibited.

**7. Safe links and files**  
Do not post malicious, deceptive, or inappropriate links and files. 

**8. Voice-channel etiquette**  
Respect ongoing study sessions or conversations. Avoid excessive background noise and soundboard abuse.

**9. How to report concerns**  
If you encounter any issues or disciplinary concerns, please reach out directly to a Moderator or Executive Officer via Direct Message (DM). Do not publicly escalate sensitive disputes.

*By participating in the server, you agree to follow these guidelines. Let's make this a great place for all SAM-UP members!* 🌻`;

const rolesContent = `# 👤 Roles and Membership

Here is a quick guide to what the different roles in our Discord server mean.

## Primary Roles

- **Admin**: Highest server-management access.
- **Executive**: Current SAM-UP officers and organizational management.
- **Moderator**: Handles verification, tickets, and community concerns.

## Access Roles

- **Member**: Standard access for verified SAM-UP members.
- **Alumni**: Access intended for SAM-UP graduates.
- **Applicant**: Access intended for current applicants.
- **Unverified**: Temporary default role with access only to the START HERE category.

*Note: Discord roles are for server access, notifications, and identification. They do not replace SAM-UP’s official membership records or constitutional classifications.*

🖤💛 **Questions?** Reach out to an Executive Officer or Moderator!`;

client.once("ready", async () => {
  try {
    // Update #server-guidelines
    const guidelinesChannel = await client.channels.fetch("1530415617100877925");
    if (guidelinesChannel) {
      const msgs = await guidelinesChannel.messages.fetch({ limit: 10 });
      const botMsg = msgs.find(m => m.author.id === client.user.id);
      if (botMsg) {
        await botMsg.edit(guidelinesContent);
        console.log("✅ Successfully updated live message in #server-guidelines!");
      } else {
        await guidelinesChannel.send(guidelinesContent);
        console.log("✅ Sent new message in #server-guidelines!");
      }
    }

    // Update #roles-and-membership
    const rolesChannel = await client.channels.fetch("1530418366840574094");
    if (rolesChannel) {
      const msgs = await rolesChannel.messages.fetch({ limit: 10 });
      const botMsg = msgs.find(m => m.author.id === client.user.id);
      if (botMsg) {
        await botMsg.edit(rolesContent);
        console.log("✅ Successfully updated live message in #roles-and-membership!");
      } else {
        await rolesChannel.send(rolesContent);
        console.log("✅ Sent new message in #roles-and-membership!");
      }
    }
  } catch (err) {
    console.error("❌ Error updating guidelines and roles:", err);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
