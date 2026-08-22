const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config({ path: "../../.env" });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const message = `
# 🌻 Welcome to the SAM-UP Online Tambayan!

Hi! Welcome to the official Discord server of the **Society of Applied Mathematics of UPLB**, or **SAM-UP**. ✨

This server serves as our **Online Tambayan**—a space where members, applicants, and alumni can connect, chill, ask for academic help, discover opportunities, and stay updated with the organization.

SAM-UP is an academic and social organization that promotes the appreciation and application of Applied Mathematics while supporting academic excellence, unity, and the development of its members.

## 🚪 New here? Start with these steps:

**1. Complete your verification**  
Head over to <#1524461452856000693> and click the verification button to open a private ticket.

Reply with your full name, org batch name, and preferred nickname on exactly three lines. The bot will parse your response, then an **Admin, Executive, or Moderator** will confirm the appropriate role:

- **Member**
- **Applicant**
- **Alumni**

After approval, the bot will update your nickname, remove **Unverified**, and confirm your access. The completed ticket will be deleted after five minutes. Until then, you can only access the **START HERE** category.

**2. Read the server guidelines**  
Please check <#1530415617100877925> before joining the conversations. These guidelines help keep the Online Tambayan safe, welcoming, and enjoyable for everyone.

**3. Learn about the server roles**  
Visit <#1530418366840574094> to understand what each role means and how server access works.

**4. Check the channel directory**  
Not sure where to go? <#1530418368840994876> contains a quick guide to the different categories and channels.

**5. Join the tambayan!**  
Once verified, feel free to introduce yourself, join conversations, ask for academic help, share your interests, or hang out in the voice channels.

## 🖤💛 Make yourself at home

Whether you’re here to study, makipagkwentuhan, find opportunities, play games, or simply spend time with fellow SAM-UP members, we hope this server feels like an extension of the physical tambayan.

**Welcome to SAM-UP. See you around the server! 🌻**
`;

client.once("ready", async () => {
  try {
    const channelId = "1523679970285846529";
    const channel = await client.channels.fetch(channelId);
    if (channel) {
      await channel.send(message.trim());
      console.log("Message sent successfully!");
    } else {
      console.error("Channel not found.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
