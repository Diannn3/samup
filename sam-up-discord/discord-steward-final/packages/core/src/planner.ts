import {
  PlanSchema,
  addMinutesIso,
  confirmationCode,
  newId,
  nowIso,
  stableHash,
  type DesiredServerConfig,
  type GuildSnapshot,
  type PlanOperation,
  type StewardPlan,
} from "@discord-steward/shared";
import { assertRoleColorTargetAllowed, assertSingleGuild, validateDesiredConfig } from "./guardrails.js";

export function generateSetupPlan(snapshot: GuildSnapshot, desired: DesiredServerConfig): StewardPlan {
  assertSingleGuild(desired.guildId, snapshot.guildId);
  validateDesiredConfig(desired);

  const operations: PlanOperation[] = [];

  for (const role of desired.roles) {
    const existing = resolveExisting(
      snapshot.roles,
      role.existingId,
      role.name,
      `role ${role.key}`,
    );
    if (!existing) {
      operations.push({
        id: newId("op"), kind: "createRole", risk: role.permissions.length ? "medium" : "low",
        description: `Create role ${role.name}`, dependsOn: [], payload: role,
      });
    }
  }

  for (const category of desired.categories) {
    const existing = resolveExisting(
      snapshot.channels.filter((channel) => channel.type === "GuildCategory"),
      category.existingId,
      category.name,
      `category ${category.key}`,
    );
    if (!existing) {
      operations.push({
        id: newId("op"), kind: "createCategory", risk: "low",
        description: `Create category ${category.name}`, dependsOn: [], payload: category,
      });
    } else if (existing.name !== category.name) {
      operations.push({
        id: newId("op"), kind: "renameChannel", risk: "low",
        description: `Rename category to ${category.name}`, dependsOn: [], payload: {
          channelKey: category.key,
          channelId: existing.id,
          newName: category.name,
        },
      });
    }
  }

  for (const channel of desired.channels) {
    const existing = resolveExisting(
      snapshot.channels.filter((item) => item.type !== "GuildCategory"),
      channel.existingId,
      channel.name,
      `channel ${channel.key}`,
    );
    if (!existing) {
      const categoryOperation = channel.categoryKey
        ? operations.find((operation) => operation.kind === "createCategory" && operation.payload.key === channel.categoryKey)
        : undefined;
      operations.push({
        id: newId("op"), kind: "createChannel", risk: "low",
        description: `Create ${channel.type} channel ${channel.name}`,
        dependsOn: categoryOperation ? [categoryOperation.id] : [],
        payload: channel,
      });
    } else if (existing.name !== channel.name) {
      operations.push({
        id: newId("op"), kind: "renameChannel", risk: "low",
        description: `Rename channel to ${channel.name}`,
        dependsOn: [],
        payload: {
          channelKey: channel.key,
          channelId: existing.id,
          newName: channel.name,
        },
      });
    }
    if (channel.permissions.length > 0) {
      const creationOperation = operations.find((operation) => operation.kind === "createChannel" && operation.payload.key === channel.key);
      operations.push({
        id: newId("op"), kind: "setChannelPermissions", risk: "high",
        description: `Set permission overwrites for #${channel.name}`,
        dependsOn: creationOperation ? [creationOperation.id] : [],
        payload: {
          channelKey: channel.key,
          channelId: existing?.id,
          channelName: channel.name,
          overwrites: channel.permissions,
        },
      });
    }
  }

  for (const rule of desired.automodRules) {
    const existing = resolveExisting(snapshot.automodRules, rule.existingId, rule.name, `AutoMod rule ${rule.key}`);
    if (!existing) {
      operations.push({
        id: newId("op"), kind: "createAutoModRule", risk: "medium",
        description: `Create AutoMod rule ${rule.name}`, dependsOn: [], payload: rule,
      });
    }
  }

  const unsigned = {
    id: newId("plan"),
    guildId: snapshot.guildId,
    createdAt: nowIso(),
    expiresAt: addMinutesIso(30),
    status: "planned" as const,
    currentStateHash: snapshotStateHash(snapshot),
    operations,
  };
  const plan = {
    ...unsigned,
    hash: stableHash(unsigned),
    confirmationCode: confirmationCode(),
  };
  return PlanSchema.parse(plan);
}

export function generateRoleColorPlan(snapshot: GuildSnapshot, desired: DesiredServerConfig): StewardPlan {
  assertSingleGuild(desired.guildId, snapshot.guildId);
  validateDesiredConfig(desired);

  const operations: PlanOperation[] = desired.roles.flatMap((role) => {
    if (!role.existingId) throw new Error(`Role color target ${role.key} must use an exact existingId.`);
    const existing = snapshot.roles.find((item) => item.id === role.existingId);
    if (!existing) throw new Error(`Configured existingId ${role.existingId} for role ${role.key} was not found.`);
    if (existing.name !== role.name) {
      throw new Error(`Configured role ${role.key} no longer matches ${role.name}; resolve live role drift before planning.`);
    }
    if (existing.id === snapshot.guildId || existing.name === "@everyone") throw new Error("The @everyone role cannot be a color target.");
    if (existing.managed) throw new Error(`Managed role ${existing.name} cannot be a color target.`);
    assertRoleColorTargetAllowed(existing.id, desired);
    if (existing.color.toUpperCase() === role.color.toUpperCase()) return [];
    return [{
      id: newId("op"), kind: "updateRoleColor" as const, risk: "low" as const,
      description: `Set role color for ${role.name} to ${role.color.toUpperCase()}`,
      dependsOn: [],
      payload: {
        roleKey: role.key,
        roleId: existing.id,
        color: role.color.toUpperCase(),
        previousColor: existing.color.toUpperCase(),
      },
    }];
  });

  const unsigned = {
    id: newId("plan"), guildId: snapshot.guildId, createdAt: nowIso(), expiresAt: addMinutesIso(30),
    status: "planned" as const, currentStateHash: snapshotStateHash(snapshot), operations,
  };
  return PlanSchema.parse({...unsigned, hash: stableHash(unsigned), confirmationCode: confirmationCode()});
}

function resolveExisting<T extends {id: string; name: string}>(
  items: T[],
  existingId: string | undefined,
  desiredName: string,
  label: string,
): T | undefined {
  if (existingId) {
    const exact = items.find((item) => item.id === existingId);
    if (!exact) throw new Error(`Configured existingId ${existingId} for ${label} was not found.`);
    return exact;
  }
  const matches = items.filter((item) => item.name.toLowerCase() === desiredName.toLowerCase());
  if (matches.length > 1) {
    throw new Error(`Multiple existing resources match ${label} by name. Set existingId explicitly.`);
  }
  return matches[0];
}

export function snapshotStateHash(snapshot: GuildSnapshot): string {
  // Lock plans to canonical structural state only. Member count and discovery
  // hints can change during normal activity without making a setup plan unsafe.
  return stableHash({
    guildId: snapshot.guildId,
    ownerId: snapshot.ownerId,
    verificationLevel: snapshot.verificationLevel,
    roles: snapshot.roles
      .map((role) => ({...role, permissions: [...role.permissions].sort()}))
      .sort((a, b) => a.id.localeCompare(b.id)),
    channels: snapshot.channels
      .map((channel) => ({
        ...channel,
        permissionOverwrites: channel.permissionOverwrites
          .map((overwrite) => ({
            ...overwrite,
            allow: [...overwrite.allow].sort(),
            deny: [...overwrite.deny].sort(),
          }))
          .sort((a, b) => a.id.localeCompare(b.id)),
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    automodRules: snapshot.automodRules
      .map((rule) => ({
        ...rule,
        actions: [...rule.actions].sort(),
        exemptRoleIds: [...rule.exemptRoleIds].sort(),
        exemptChannelIds: [...rule.exemptChannelIds].sort(),
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  });
}

export function verifyPlanIntegrity(plan: StewardPlan): void {
  const unsigned = {
    id: plan.id,
    guildId: plan.guildId,
    createdAt: plan.createdAt,
    expiresAt: plan.expiresAt,
    status: "planned" as const,
    currentStateHash: plan.currentStateHash,
    operations: plan.operations,
  };
  if (stableHash(unsigned) !== plan.hash) throw new Error("Plan hash mismatch. The plan may have been modified.");
  if (new Date(plan.expiresAt).getTime() < Date.now()) throw new Error("Plan expired. Generate a fresh plan.");
}
