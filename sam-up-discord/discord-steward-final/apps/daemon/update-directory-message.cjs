const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config({ path: "../../.env" });

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const part1 = `# 🪧 Channel Directory (Part 1/2)

Welcome to the complete map of the SAM-UP Online Tambayan! Click any channel to jump straight to it.

### 🚀 START HERE
- <#1523679970285846529> - Welcome message & onboarding steps.
- <#1524461452856000693> - Open a ticket for bot-assisted parsing and staff role confirmation.
- <#1530415617100877925> - Server rules and code of conduct.
- <#1530418366840574094> - Guide to server roles and access levels.
- <#1530418368840994876> - You are here! Complete map of the tambayan.
- <#1530465873746329651> - Automated join notifications & new member arrivals.

### 📣 OFFICIAL
- <#1524451849762246749> - Official org-wide SAM-UP announcements.
- <#1524453960348467290> - Important announcements strictly for Members & Alumni.
- <#1530418370439020615> - Schedule and updates on upcoming SAM-UP activities.
- <#1530418372137717851> - Internships, job posts, scholarships, and volunteer work.

### 🌻 TAMBAYAN
- <#1525915448158322830> - Main chat for anything and everything! Introduce yourself here!
- <#1524452707853795590> - Dedicated chat space for SAM-UP Alumni and Resident Members.
- <#1530418375795281933> - Off-topic discussions, random thoughts, and banter.
- <#1530418378785820765> - Share memes, videos, photos, and TikToks.
- <#1530418381755518979> - Feedback and suggestions for the Executive Committee.
- <#1524454471441186826> - Use bot commands here (music, games, tools).
- <#1530199758692683908> - Sports watch parties and e-sports tournaments.
- <#1530199213655195698> - Private sports discussion for Members & Alumni.`;

const part2 = `# 🪧 Channel Directory (Part 2/2)

### 📚 ACADEMICS
- <#1530418384192143461> - Ask questions about math courses, assignments, and concepts.
- <#1530418386239230003> - Casual chat about acads, professors, and study tips.
- <#1530418388038582383> - Textbooks, notes, past papers, and study materials.
- <#1530190754251673751> & <#1530190913953988608> - Voice rooms for study sessions & tutoring.
- <#1530445523863998525> - Stage channel for structured study lectures & reviews.

### 🎨 INTERESTS
- <#1530418391263871137> - Find a party for Valorant, League, ML, Genshin, etc.
- <#1530418393763676340> - Share music playlists, film recommendations, and reviews.

### 🔊 VOICE TAMBAYAN
- <#1523679970285846530> - Main voice channel for casual hanging out & kwentuhan.
- <#1530191848268759144> - General voice lounge for chilling before events or games.
- <#1530188771356573797> - Quiet or focus study sessions.
- <#1530418399698489507> - Hop in when playing games with fellow members.
- <#1530418401393115247> - Listen to tunes together using music bots.
- <#1524452983335813230> - Voice hangout room for SAM-UP Alumni and Members.
- <#1530199793937285270> - Voice channel for sports watch parties & tournaments.
- <#1530199135871963196> - Private sports voice hangout for Members & Alumni.

### 🔒 PRIVATE STAFF
*Only visible to Executive Officers & Moderators.*
- <#1530418403461038150> - Staff discussions & moderation coordination.
- <#1530418409752498328> - Staff review area with Member, Alumni, and Applicant confirmation controls.
- <#1530418413015531732> - Read-only automated audit trails & updates.

---
*Last updated: July 2026*  
🖤💛 **Questions?** Reach out to an Executive Officer or Moderator!`;

client.once("ready", async () => {
  try {
    console.log(`Part 1 length: ${part1.length} | Part 2 length: ${part2.length}`);
    const channelId = "1530418368840994876";
    const channel = await client.channels.fetch(channelId);
    if (channel) {
      const msgs = await channel.messages.fetch({ limit: 10 });
      const botMsgs = Array.from(msgs.values())
        .filter(m => m.author.id === client.user.id)
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp);

      if (botMsgs.length >= 2) {
        await botMsgs[0].edit(part1);
        await botMsgs[1].edit(part2);
        console.log("Successfully updated existing 2-part messages in #channel-directory!");
      } else if (botMsgs.length === 1) {
        await botMsgs[0].edit(part1);
        await channel.send(part2);
        console.log("Edited Part 1 and sent new Part 2 in #channel-directory!");
      } else {
        await channel.send(part1);
        await channel.send(part2);
        console.log("Sent new 2-part messages in #channel-directory!");
      }
    } else {
      console.error("Could not find #channel-directory channel.");
    }
  } catch (err) {
    console.error("Error updating directory message:", err);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
