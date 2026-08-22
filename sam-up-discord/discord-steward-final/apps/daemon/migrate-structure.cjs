const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config({ path: "../../.env" });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const CATEGORIES = {
  OFFICIAL: "1524451819647139980",
  TAMBAYAN: "1523679969836793929",
  START_HERE: "1530416136414433451",
  INTERESTS: "1523679970285846528",
  VOICE_TAMBAYAN: "1530198274311720970",
  ACADEMICS: "1525515376211922987",
  PRIVATE_STAFF: "1530418361618399272"
};

const CHANNELS_TO_MOVE = [
  { id: "1524452707853795590", name: "alum-chat", targetParent: CATEGORIES.TAMBAYAN },
  { id: "1524452983335813230", name: "Alumni VC", targetParent: CATEGORIES.VOICE_TAMBAYAN },
  { id: "1530199758692683908", name: "sports-night", targetParent: CATEGORIES.TAMBAYAN },
  { id: "1530199793937285270", name: "Sports Night (Voice)", targetParent: CATEGORIES.VOICE_TAMBAYAN },
  { id: "1524453960348467290", name: "members-announcements", targetParent: CATEGORIES.OFFICIAL },
  { id: "1530188771356573797", name: "Study Room", targetParent: CATEGORIES.VOICE_TAMBAYAN },
  { id: "1530191848268759144", name: "Lobby", targetParent: CATEGORIES.VOICE_TAMBAYAN },
  { id: "1523679970285846530", name: "Tambayan (Main Voice)", targetParent: CATEGORIES.VOICE_TAMBAYAN }
];

const CHANNELS_TO_DELETE = [
  { id: "1525515414652850296", reason: "Duplicate bot-commands in ACADEMICS" },
  { id: "1530440878349488130", reason: "Duplicate Acad Nights stage channel" }
];

client.once("ready", async () => {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    console.log(`Connected to guild: ${guild.name}`);

    // Move channels
    console.log("\n=== MOVING MISPLACED CHANNELS ===");
    for (const item of CHANNELS_TO_MOVE) {
      try {
        const ch = await guild.channels.fetch(item.id);
        if (ch) {
          if (ch.parentId !== item.targetParent) {
            await ch.setParent(item.targetParent, { lockPermissions: false, reason: "V4 Audit: Structure cleanup" });
            console.log(`Moved [${item.name}] (${item.id}) to category ${item.targetParent}`);
          } else {
            console.log(`[${item.name}] is already in the correct category.`);
          }
        } else {
          console.warn(`Channel ${item.name} (${item.id}) not found.`);
        }
      } catch (err) {
        console.error(`Failed to move ${item.name}:`, err.message);
      }
    }

    // Delete duplicate ghost channels
    console.log("\n=== DELETING DUPLICATE GHOST CHANNELS ===");
    for (const item of CHANNELS_TO_DELETE) {
      try {
        const ch = await guild.channels.fetch(item.id);
        if (ch) {
          await ch.delete(item.reason);
          console.log(`Deleted channel ${item.id} - Reason: ${item.reason}`);
        } else {
          console.log(`Channel ${item.id} already deleted or not found.`);
        }
      } catch (err) {
        console.error(`Failed to delete channel ${item.id}:`, err.message);
      }
    }

    console.log("\nLive structure migration completed successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    client.destroy();
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
