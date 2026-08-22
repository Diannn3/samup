import { z } from "zod";

export const SnowflakeSchema = z.string().regex(/^\d{5,25}$/, "Expected a Discord snowflake ID");

export const PermissionNameSchema = z.string().min(1);

export const RoleSnapshotSchema = z.object({
  id: SnowflakeSchema,
  name: z.string(),
  color: z.string(),
  position: z.number().int(),
  managed: z.boolean(),
  mentionable: z.boolean(),
  hoist: z.boolean(),
  permissions: z.array(z.string()),
});

export const PermissionOverwriteSnapshotSchema = z.object({
  id: SnowflakeSchema,
  type: z.enum(["role", "member"]),
  allow: z.array(z.string()),
  deny: z.array(z.string()),
});

export const ChannelSnapshotSchema = z.object({
  id: SnowflakeSchema,
  name: z.string(),
  type: z.string(),
  parentId: SnowflakeSchema.nullable(),
  position: z.number().int(),
  topic: z.string().nullable(),
  permissionOverwrites: z.array(PermissionOverwriteSnapshotSchema),
});

export const AutoModRuleSnapshotSchema = z.object({
  id: SnowflakeSchema,
  name: z.string(),
  enabled: z.boolean(),
  eventType: z.number().int(),
  triggerType: z.number().int(),
  actions: z.array(z.string()),
  exemptRoleIds: z.array(SnowflakeSchema),
  exemptChannelIds: z.array(SnowflakeSchema),
});

export const BotSnapshotSchema = z.object({
  id: SnowflakeSchema,
  username: z.string(),
  displayName: z.string(),
  topRolePosition: z.number().int(),
});

export const TicketHintSchema = z.object({
  kind: z.enum(["channel", "category", "role", "bot"]),
  id: SnowflakeSchema,
  name: z.string(),
  reason: z.string(),
});

export const GuildSnapshotSchema = z.object({
  guildId: SnowflakeSchema,
  guildName: z.string(),
  ownerId: SnowflakeSchema,
  generatedAt: z.string().datetime(),
  verificationLevel: z.number().int(),
  memberCount: z.number().int().nonnegative(),
  roles: z.array(RoleSnapshotSchema),
  channels: z.array(ChannelSnapshotSchema),
  automodRules: z.array(AutoModRuleSnapshotSchema),
  bots: z.array(BotSnapshotSchema),
  ticketHints: z.array(TicketHintSchema),
});
export type GuildSnapshot = z.infer<typeof GuildSnapshotSchema>;

export const DesiredPermissionOverwriteSchema = z.object({
  subject: z.string().min(1),
  allow: z.array(PermissionNameSchema).default([]),
  deny: z.array(PermissionNameSchema).default([]),
});

export const DesiredRoleSchema = z.object({
  key: z.string().regex(/^[a-z0-9-]+$/),
  existingId: SnowflakeSchema.optional(),
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#000000"),
  hoist: z.boolean().default(false),
  mentionable: z.boolean().default(false),
  permissions: z.array(PermissionNameSchema).default([]),
});
export type DesiredRole = z.infer<typeof DesiredRoleSchema>;

export const DesiredCategorySchema = z.object({
  key: z.string().regex(/^[a-z0-9-]+$/),
  existingId: SnowflakeSchema.optional(),
  name: z.string().min(1).max(100),
});
export type DesiredCategory = z.infer<typeof DesiredCategorySchema>;

export const DesiredChannelSchema = z.object({
  key: z.string().regex(/^[a-z0-9-]+$/),
  existingId: SnowflakeSchema.optional(),
  name: z.string().min(1).max(100),
  type: z.enum(["text", "announcement", "voice", "stage"]),
  categoryKey: z.string().regex(/^[a-z0-9-]+$/).optional(),
  topic: z.string().max(1024).optional(),
  permissions: z.array(DesiredPermissionOverwriteSchema).default([]),
});
export type DesiredChannel = z.infer<typeof DesiredChannelSchema>;

export const DesiredAutoModRuleSchema = z.object({
  key: z.string().regex(/^[a-z0-9-]+$/),
  existingId: SnowflakeSchema.optional(),
  name: z.string().min(1).max(100),
  enabled: z.boolean().default(true),
  trigger: z.discriminatedUnion("type", [
    z.object({type: z.literal("keyword"), keywords: z.array(z.string().min(1)).min(1).max(1000), regexPatterns: z.array(z.string()).max(10).default([]), allowList: z.array(z.string()).max(100).default([])}),
    z.object({type: z.literal("mentionSpam"), mentionTotalLimit: z.number().int().min(1).max(50), raidProtectionEnabled: z.boolean().default(true)}),
  ]),
  actions: z.object({blockMessage: z.boolean().default(true), customMessage: z.string().max(150).optional(), alertChannelId: SnowflakeSchema.optional(), timeoutSeconds: z.number().int().min(1).max(2419200).optional()}),
  exemptRoleIds: z.array(SnowflakeSchema).default([]),
  exemptChannelIds: z.array(SnowflakeSchema).default([]),
});
export type DesiredAutoModRule = z.infer<typeof DesiredAutoModRuleSchema>;


export const DesiredServerConfigSchema = z.object({
  version: z.literal(1),
  guildId: SnowflakeSchema,
  organizationName: z.string().min(1),
  protected: z.object({
    roleIds: z.array(SnowflakeSchema).default([]),
    colorEditableRoleIds: z.array(SnowflakeSchema).default([]),
    channelIds: z.array(SnowflakeSchema).default([]),
    ticketKeywords: z.array(z.string()).default(["ticket", "verify", "verification"]),
  }),
  roles: z.array(DesiredRoleSchema).default([]),
  categories: z.array(DesiredCategorySchema).default([]),
  channels: z.array(DesiredChannelSchema).default([]),
  automodRules: z.array(DesiredAutoModRuleSchema).default([]),
});
export type DesiredServerConfig = z.infer<typeof DesiredServerConfigSchema>;


const BaseOperationSchema = z.object({
  id: z.string().min(1),
  risk: z.enum(["low", "medium", "high"]),
  description: z.string(),
  dependsOn: z.array(z.string()).default([]),
});

export const PlanOperationSchema = z.discriminatedUnion("kind", [
  BaseOperationSchema.extend({
    kind: z.literal("createRole"),
    payload: DesiredRoleSchema,
  }),
  BaseOperationSchema.extend({
    kind: z.literal("updateRoleColor"),
    payload: z.object({
      roleKey: z.string().regex(/^[a-z0-9-]+$/),
      roleId: SnowflakeSchema,
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      previousColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    }),
  }),
  BaseOperationSchema.extend({
    kind: z.literal("createCategory"),
    payload: DesiredCategorySchema,
  }),
  BaseOperationSchema.extend({
    kind: z.literal("createChannel"),
    payload: DesiredChannelSchema,
  }),
  BaseOperationSchema.extend({
    kind: z.literal("createAutoModRule"),
    payload: DesiredAutoModRuleSchema,
  }),
  BaseOperationSchema.extend({
    kind: z.literal("setChannelPermissions"),
    payload: z.object({
      channelKey: z.string(),
      channelId: SnowflakeSchema.optional(),
      channelName: z.string(),
      overwrites: z.array(DesiredPermissionOverwriteSchema),
    }),
  }),
  BaseOperationSchema.extend({
    kind: z.literal("renameChannel"),
    payload: z.object({
      channelKey: z.string(),
      channelId: SnowflakeSchema,
      newName: z.string(),
    }),
  }),
]);
export type PlanOperation = z.infer<typeof PlanOperationSchema>;

export const PlanSchema = z.object({
  id: z.string().min(1),
  guildId: SnowflakeSchema,
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  status: z.enum(["planned", "applying", "applied", "failed", "rolling_back", "rolled_back"]),
  hash: z.string().min(16),
  confirmationCode: z.string().min(6),
  currentStateHash: z.string().min(16),
  operations: z.array(PlanOperationSchema),
});
export type StewardPlan = z.infer<typeof PlanSchema>;


export const HealthSchema = z.object({
  status: z.enum(["starting", "ready", "degraded"]),
  discordConnected: z.boolean(),
  guildId: z.string(),
  guildName: z.string().nullable(),
  startedAt: z.string().datetime(),
  version: z.string(),
});
export type Health = z.infer<typeof HealthSchema>;
