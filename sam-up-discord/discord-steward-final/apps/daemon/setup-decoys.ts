import { loadEnv } from "./src/env.ts";
import { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits, OverwriteType } from "discord.js";

async function main() {
  const env = loadEnv();
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  });

  await new Promise<void>((resolve, reject) => {
    client.once("clientReady", () => resolve());
    client.once("ready", () => resolve());
    client.login(env.DISCORD_BOT_TOKEN).catch(reject);
  });

  console.log(`Connected as ${client.user?.tag}`);

  const guildId = env.DISCORD_GUILD_ID || "1523679969836793926";
  const guild = await client.guilds.fetch(guildId);
  await guild.roles.fetch();
  await guild.channels.fetch();

  // Find Alumnis role
  const alumnisRole = guild.roles.cache.find(r => r.name.toLowerCase() === "alumnis" || r.id === "1530887109223776346");
  if (!alumnisRole) {
    throw new Error("Could not find role 'Alumnis'!");
  }
  console.log(`Found Alumnis role: ${alumnisRole.name} (${alumnisRole.id})`);

  // Staff roles
  const adminRole = guild.roles.cache.find(r => r.name.toLowerCase() === "admin" || r.id === "1530427891714621562");
  const execRole = guild.roles.cache.find(r => r.name.toLowerCase() === "executive" || r.id === "1523679969836793927");
  const modRole = guild.roles.cache.find(r => r.name.toLowerCase() === "moderator" || r.id === "1524451842887786526");
  const everyoneRole = guild.roles.everyone;

  // 1. Deny ViewChannel on channel-directory
  const directoryCh = guild.channels.cache.get("1530418368840994876") || guild.channels.cache.find(c => c.name.includes("channel-directory"));
  if (directoryCh && "permissionOverwrites" in directoryCh) {
    console.log(`Denying ViewChannel for Alumnis on ${directoryCh.name}...`);
    await directoryCh.permissionOverwrites.edit(alumnisRole, {
      ViewChannel: false,
    }, { reason: "Deny channel directory access for Alumnis decoy role" });
    console.log(`✅ Denied ViewChannel on channel-directory`);
  } else {
    console.warn(`⚠️ Could not find channel-directory!`);
  }

  // Helper for permission overwrites on decoy channels/categories
  const buildOverwrites = (isVoice: boolean) => {
    const overwrites: any[] = [
      {
        id: everyoneRole.id,
        type: OverwriteType.Role,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: alumnisRole.id,
        type: OverwriteType.Role,
        allow: isVoice
          ? [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
          : [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      },
    ];

    for (const staff of [adminRole, execRole, modRole]) {
      if (staff) {
        overwrites.push({
          id: staff.id,
          type: OverwriteType.Role,
          allow: isVoice
            ? [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.MoveMembers]
            : [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages],
        });
      }
    }
    return overwrites;
  };

  // 2. Create Decoy TAMBAYAN Category
  let decoyTambayanCat = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === "TAMBAYAN" && c.id !== "1523679969836793929");
  if (!decoyTambayanCat) {
    console.log(`Creating decoy TAMBAYAN category...`);
    decoyTambayanCat = await guild.channels.create({
      name: "TAMBAYAN",
      type: ChannelType.GuildCategory,
      permissionOverwrites: buildOverwrites(false),
      reason: "Decoy category for toxic alumni",
    });
  }
  console.log(`✅ Decoy TAMBAYAN category ID: ${decoyTambayanCat.id}`);

  // 3. Create Decoy VOICE TAMBAYAN Category
  let decoyVoiceCat = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === "VOICE TAMBAYAN" && c.id !== "1530198274311720970");
  if (!decoyVoiceCat) {
    console.log(`Creating decoy VOICE TAMBAYAN category...`);
    decoyVoiceCat = await guild.channels.create({
      name: "VOICE TAMBAYAN",
      type: ChannelType.GuildCategory,
      permissionOverwrites: buildOverwrites(true),
      reason: "Decoy voice category for toxic alumni",
    });
  }
  console.log(`✅ Decoy VOICE TAMBAYAN category ID: ${decoyVoiceCat.id}`);

  // 4. Create Decoy Text Channels under Decoy TAMBAYAN
  let memberChat = guild.channels.cache.find(c => c.parentId === decoyTambayanCat!.id && c.name.includes("member-chat"));
  if (!memberChat) {
    console.log(`Creating decoy Member-chat...`);
    memberChat = await guild.channels.create({
      name: "【💬】member-chat",
      type: ChannelType.GuildText,
      parent: decoyTambayanCat.id,
      permissionOverwrites: buildOverwrites(false),
      reason: "Decoy member-chat for toxic alumni",
    });
  }
  console.log(`✅ Decoy Member-chat ID: ${memberChat.id}`);

  let alumChat = guild.channels.cache.find(c => c.parentId === decoyTambayanCat!.id && c.name.includes("alum-chat"));
  if (!alumChat) {
    console.log(`Creating decoy Alum-chat...`);
    alumChat = await guild.channels.create({
      name: "【🎓】alum-chat",
      type: ChannelType.GuildText,
      parent: decoyTambayanCat.id,
      permissionOverwrites: buildOverwrites(false),
      reason: "Decoy alum-chat for toxic alumni",
    });
  }
  console.log(`✅ Decoy Alum-chat ID: ${alumChat.id}`);

  // 5. Create Decoy Voice Channel under Decoy VOICE TAMBAYAN
  let tambayanVc = guild.channels.cache.find(c => c.parentId === decoyVoiceCat!.id && c.name.toLowerCase().includes("tambayan"));
  if (!tambayanVc) {
    console.log(`Creating decoy Tambayan VC...`);
    tambayanVc = await guild.channels.create({
      name: "【🔊】Tambayan",
      type: ChannelType.GuildVoice,
      parent: decoyVoiceCat.id,
      permissionOverwrites: buildOverwrites(true),
      reason: "Decoy Tambayan voice channel for toxic alumni",
    });
  }
  console.log(`✅ Decoy Tambayan VC ID: ${tambayanVc.id}`);

  console.log("\n--- SUMMARY FOR YAML ---");
  console.log(`alumnisRoleId: ${alumnisRole.id}`);
  console.log(`decoyTambayanCatId: ${decoyTambayanCat.id}`);
  console.log(`decoyVoiceCatId: ${decoyVoiceCat.id}`);
  console.log(`decoyMemberChatId: ${memberChat.id}`);
  console.log(`decoyAlumChatId: ${alumChat.id}`);
  console.log(`decoyTambayanVcId: ${tambayanVc.id}`);

  client.destroy();
}

main().catch((err) => {
  console.error("Error setting up decoys:", err);
  process.exit(1);
});
