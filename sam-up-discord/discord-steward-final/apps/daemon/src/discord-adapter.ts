import {
  ChannelType,
  OverwriteType,
  PermissionFlagsBits,
  PermissionsBitField,
  type Client,
  type Guild,
  type NonThreadGuildBasedChannel,
  type OverwriteResolvable,
  type PermissionResolvable,
  type GuildMember,
} from "discord.js";
import { nowIso, type DesiredAutoModRule, type DesiredChannel, type DesiredRole, type GuildSnapshot } from "@discord-steward/shared";
import type { ResolvedPermissionOverwrite, StewardDiscordAdapter } from "@discord-steward/core";
import { assertPermissionCeiling, assertSingleGuild } from "@discord-steward/core";

export class DiscordJsStewardAdapter implements StewardDiscordAdapter {
  constructor(private readonly client: Client, public readonly guildId: string) {}

  async inspect(): Promise<GuildSnapshot> {
    const guild = await this.getGuild();
    await Promise.allSettled([guild.roles.fetch(), guild.channels.fetch(), guild.autoModerationRules.fetch(), guild.members.fetch()]);
    const automodRules = await guild.autoModerationRules.fetch().catch(() => guild.autoModerationRules.cache);
    const bots = guild.members.cache.filter((member) => member.user.bot).map((member) => ({
      id: member.id,
      username: member.user.username,
      displayName: member.displayName,
      topRolePosition: member.roles.highest.position,
    }));
    const channels = Array.from(guild.channels.cache.values())
      .filter((c) => !c.isThread())
      .map((c) => c as NonThreadGuildBasedChannel)
      .map((channel) => ({
      id: channel.id,
      name: channel.name,
      type: ChannelType[channel.type] ?? String(channel.type),
      parentId: channel.parentId,
      position: channel.rawPosition,
      topic: "topic" in channel && typeof channel.topic === "string" ? channel.topic : null,
      permissionOverwrites: channel.permissionOverwrites.cache.map((overwrite: any) => ({
        id: overwrite.id,
        type: overwrite.type === OverwriteType.Role ? "role" as const : "member" as const,
        allow: overwrite.allow.toArray(),
        deny: overwrite.deny.toArray(),
      })),
    }));
    const roles = guild.roles.cache.map((role) => ({
      id: role.id,
      name: role.name,
      color: role.hexColor,
      position: role.position,
      managed: role.managed,
      mentionable: role.mentionable,
      hoist: role.hoist,
      permissions: role.permissions.toArray(),
    }));
    const ticketKeywords = ["ticket", "verify", "verification", "support"];
    const ticketHints = [
      ...channels.filter((channel) => ticketKeywords.some((word) => channel.name.toLowerCase().includes(word))).map((channel) => ({
        kind: channel.type === "GuildCategory" ? "category" as const : "channel" as const,
        id: channel.id, name: channel.name, reason: "Name matches a common ticket or verification pattern.",
      })),
      ...roles.filter((role) => ticketKeywords.some((word) => role.name.toLowerCase().includes(word))).map((role) => ({
        kind: "role" as const, id: role.id, name: role.name, reason: "Role name suggests ticket or verification access.",
      })),
      ...bots.filter((bot) => ticketKeywords.some((word) => `${bot.username} ${bot.displayName}`.toLowerCase().includes(word))).map((bot) => ({
        kind: "bot" as const, id: bot.id, name: bot.displayName, reason: "Bot name suggests ticket or verification ownership.",
      })),
    ];
    return {
      guildId: guild.id,
      guildName: guild.name,
      ownerId: guild.ownerId,
      generatedAt: nowIso(),
      verificationLevel: guild.verificationLevel,
      memberCount: guild.memberCount,
      roles,
      channels,
      automodRules: automodRules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        enabled: rule.enabled,
        eventType: rule.eventType,
        triggerType: rule.triggerType,
        actions: rule.actions.map((action) => String(action.type)),
        exemptRoleIds: [...rule.exemptRoles.keys()],
        exemptChannelIds: [...rule.exemptChannels.keys()],
      })),
      bots,
      ticketHints,
    };
  }

  async createRole(role: DesiredRole, reason: string) {
    assertPermissionCeiling(role.permissions);
    const guild = await this.getGuild();
    const created = await guild.roles.create({
      name: role.name,
      color: role.color as `#${string}`,
      hoist: role.hoist,
      mentionable: role.mentionable,
      permissions: resolvePermissions(role.permissions),
      reason,
    });
    return {id: created.id, name: created.name};
  }

  async setRoleColor(roleId: string, color: string, reason: string) {
    const guild = await this.getGuild();
    const role = await guild.roles.fetch(roleId);
    if (!role) throw new Error(`Role ${roleId} not found.`);
    if (role.id === guild.id || role.name === "@everyone") throw new Error("The @everyone role color cannot be changed.");
    if (role.managed) throw new Error(`Managed role ${role.name} cannot be changed.`);
    if (!role.editable) throw new Error(`Discord role hierarchy does not allow editing ${role.name}.`);
    const updated = await role.edit({color: color as `#${string}`, reason});
    return {id: updated.id, name: updated.name, color: updated.hexColor};
  }

  async deleteRole(roleId: string, reason: string): Promise<void> {
    const guild = await this.getGuild();
    const role = await guild.roles.fetch(roleId);
    if (role?.managed) throw new Error("Managed roles cannot be deleted.");
    await role?.delete(reason);
  }

  async createCategory(input: {name: string}, reason: string) {
    const guild = await this.getGuild();
    const created = await guild.channels.create({name: input.name, type: ChannelType.GuildCategory, reason});
    return {id: created.id, name: created.name};
  }

  async createChannel(input: DesiredChannel & {parentId?: string}, reason: string) {
    const guild = await this.getGuild();
    if (input.type === "voice" || input.type === "stage") {
      const created = await guild.channels.create({
        name: input.name,
        type: input.type === "stage" ? ChannelType.GuildStageVoice : ChannelType.GuildVoice,
        parent: input.parentId,
        reason,
      });
      return {id: created.id, name: created.name};
    }
    const created = await guild.channels.create({
      name: input.name,
      type: input.type === "announcement" ? ChannelType.GuildAnnouncement : ChannelType.GuildText,
      parent: input.parentId,
      topic: input.topic,
      reason,
    });
    return {id: created.id, name: created.name};
  }


  async createAutoModRule(rule: DesiredAutoModRule, reason: string) {
    const guild = await this.getGuild();
    const actions: Array<Record<string, unknown>> = [];
    if (rule.actions.blockMessage) actions.push({type: 1, metadata: rule.actions.customMessage ? {customMessage: rule.actions.customMessage} : {}});
    if (rule.actions.alertChannelId) actions.push({type: 2, metadata: {channel: rule.actions.alertChannelId}});
    if (rule.actions.timeoutSeconds) actions.push({type: 3, metadata: {durationSeconds: rule.actions.timeoutSeconds}});
    const triggerMetadata = rule.trigger.type === "keyword"
      ? {keywordFilter: rule.trigger.keywords, regexPatterns: rule.trigger.regexPatterns, allowList: rule.trigger.allowList}
      : {mentionTotalLimit: rule.trigger.mentionTotalLimit, mentionRaidProtectionEnabled: rule.trigger.raidProtectionEnabled};
    const created = await guild.autoModerationRules.create({
      name: rule.name,
      enabled: rule.enabled,
      eventType: 1,
      triggerType: rule.trigger.type === "keyword" ? 1 : 5,
      triggerMetadata,
      actions,
      exemptRoles: rule.exemptRoleIds,
      exemptChannels: rule.exemptChannelIds,
      reason,
    } as never);
    return {id: created.id, name: created.name};
  }

  async deleteAutoModRule(ruleId: string, reason: string): Promise<void> {
    const guild = await this.getGuild();
    await guild.autoModerationRules.delete(ruleId, reason);
  }

  async deleteChannel(channelId: string, reason: string): Promise<void> {
    const guild = await this.getGuild();
    const channel = await guild.channels.fetch(channelId);
    await channel?.delete(reason);
  }

  async renameChannel(channelId: string, newName: string, reason: string): Promise<void> {
    const channel = await this.getChannel(channelId);
    await channel.setName(newName, reason);
  }

  async getChannelOverwrites(channelId: string): Promise<ResolvedPermissionOverwrite[]> {
    const channel = await this.getChannel(channelId);
    return channel.permissionOverwrites.cache.map((overwrite) => ({
      subjectId: overwrite.id,
      subjectType: overwrite.type === OverwriteType.Role ? "role" : "member",
      allow: overwrite.allow.toArray(),
      deny: overwrite.deny.toArray(),
    }));
  }



  async setChannelOverwrites(channelId: string, overwrites: ResolvedPermissionOverwrite[], reason: string): Promise<void> {
    const channel = await this.getChannel(channelId);
    const payload: OverwriteResolvable[] = overwrites.map((overwrite) => ({
      id: overwrite.subjectId,
      type: overwrite.subjectType === "role" ? OverwriteType.Role : OverwriteType.Member,
      allow: resolvePermissions(overwrite.allow),
      deny: resolvePermissions(overwrite.deny),
    }));
    await channel.permissionOverwrites.set(payload, reason);
  }

  private async getGuild(): Promise<Guild> {
    const guild = await this.client.guilds.fetch(this.guildId);
    assertSingleGuild(this.guildId, guild.id);
    return guild;
  }



  private async getChannel(channelId: string): Promise<NonThreadGuildBasedChannel> {
    const guild = await this.getGuild();
    const channel = await guild.channels.fetch(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found.`);
    if (channel.isThread()) throw new Error(`Thread ${channelId} cannot be used for structural permission operations.`);
    return channel;
  }
}

function resolvePermissions(names: string[]): bigint {
  assertPermissionCeiling(names);
  let bitfield = 0n;
  for (const name of names) {
    const flag = (PermissionFlagsBits as unknown as Record<string, bigint>)[name];
    if (flag === undefined) throw new Error(`Unknown Discord permission: ${name}`);
    bitfield |= flag;
  }
  return PermissionsBitField.resolve(bitfield as PermissionResolvable);
}
