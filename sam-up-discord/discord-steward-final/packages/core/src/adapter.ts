import type {
  DesiredChannel,
  DesiredRole,
  DesiredAutoModRule,
  GuildSnapshot,
} from "@discord-steward/shared";

export interface ResolvedPermissionOverwrite {
  subjectId: string;
  subjectType: "role" | "member";
  allow: string[];
  deny: string[];
}

export interface StewardDiscordAdapter {
  readonly guildId: string;
  inspect(): Promise<GuildSnapshot>;
  createRole(role: DesiredRole, reason: string): Promise<{id: string; name: string}>;
  setRoleColor(roleId: string, color: string, reason: string): Promise<{id: string; name: string; color: string}>;
  deleteRole(roleId: string, reason: string): Promise<void>;
  createCategory(input: {name: string}, reason: string): Promise<{id: string; name: string}>;
  createChannel(input: DesiredChannel & {parentId?: string}, reason: string): Promise<{id: string; name: string}>;
  deleteChannel(channelId: string, reason: string): Promise<void>;
  createAutoModRule(rule: DesiredAutoModRule, reason: string): Promise<{id: string; name: string}>;
  deleteAutoModRule(ruleId: string, reason: string): Promise<void>;
  renameChannel(channelId: string, newName: string, reason: string): Promise<void>;
  getChannelOverwrites(channelId: string): Promise<ResolvedPermissionOverwrite[]>;
  setChannelOverwrites(channelId: string, overwrites: ResolvedPermissionOverwrite[], reason: string): Promise<void>;
}
