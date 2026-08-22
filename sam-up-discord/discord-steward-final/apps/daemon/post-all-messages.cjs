const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config({ path: "../../.env" });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const messages = [
  {
    channelId: "1524461452856000693", // #【✅】verification
    content: `# ✅ Get Verified

Welcome! To access the rest of the SAM-UP Online Tambayan, you’ll need to complete a quick identity verification.

## How it works

**1. Click the "Create ticket" button**  
A private verification ticket will be created for you.

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

Need help? Open a ticket below and authorized staff will assist you. 🌻`
  },
  {
    channelId: "1530415617100877925", // #【📜】server-guidelines
    content: `# 📜 Server Guidelines

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

*By participating in the server, you agree to follow these guidelines. Let's make this a great place for all SAM-UP members!* 🌻`
  },
  {
    channelId: "1530418366840574094", // #【👤】roles-and-membership
    content: `# 👤 Roles and Membership

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

🖤💛 **Questions?** Reach out to an Executive Officer or Moderator!`
  },
  {
    channelId: "1530418368840994876", // #【🪧】channel-directory
    content: `# 🪧 Channel Directory

Not sure where something belongs? Here’s a quick map of the Online Tambayan!

### 📣 OFFICIAL
Announcements, events, deadlines, and opportunities.
- <#1524451849762246749> 
- <#1530418370439020615>
- <#1530418372137717851>

### 🌻 TAMBAYAN
Main casual conversations, introductions, memes, suggestions, and member bonding.
- <#1525915448158322830>
- <#1530418378785820765>
- <#1530418381755518979>

### 📚 ACADEMICS
Academic questions, resources, study discussions, and registration help.
- <#1530418384192143461>
- <#1530418386239230003>
- <#1530418388038582383>

### 🎨 INTERESTS
Gaming, films, music, sports, fitness, technology, and personal projects.
- <#1530418391263871137>
- <#1530418393763676340>

### 🔊 VOICE TAMBAYAN
Casual calls, study sessions, gaming, and music hangouts.
- <#1523679970285846530>
- <#1530188771356573797>
- <#1530418399698489507>

*Last updated: July 2026*
🖤💛 Questions? Reach out to an Executive Officer or Moderator.`
  }
];

client.once("ready", async () => {
  try {
    for (const msg of messages) {
      const channel = await client.channels.fetch(msg.channelId);
      if (channel) {
        await channel.send(msg.content);
        console.log(`Sent message to ${channel.name}`);
      } else {
        console.error(`Channel ${msg.channelId} not found.`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
