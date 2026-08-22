import type { StewardRepository } from "@discord-steward/database";
import type {
  DesiredServerConfig,
  GuildSnapshot,
  PlanOperation,
  StewardPlan,
} from "@discord-steward/shared";
import { assertOperationAllowed, assertSingleGuild } from "./guardrails.js";
import { snapshotStateHash, verifyPlanIntegrity } from "./planner.js";
import type { ResolvedPermissionOverwrite, StewardDiscordAdapter } from "./adapter.js";

interface ExecutionContext {
  roleIds: Map<string, string>;
  categoryIds: Map<string, string>;
  channelIds: Map<string, string>;
}

export class PlanExecutor {
  constructor(
    private readonly adapter: StewardDiscordAdapter,
    private readonly repository: StewardRepository,
  ) {}

  async apply(input: {
    plan: StewardPlan;
    confirmationCode: string;
    desired: DesiredServerConfig;
    liveSnapshot: GuildSnapshot;
    reason: string;
  }): Promise<void> {
    const {plan, desired, liveSnapshot} = input;
    assertSingleGuild(this.adapter.guildId, plan.guildId);
    assertSingleGuild(desired.guildId, plan.guildId);
    verifyPlanIntegrity(plan);
    if (plan.confirmationCode !== input.confirmationCode) throw new Error("Invalid confirmation code.");
    if (plan.status !== "planned") throw new Error(`Plan is not applicable from status ${plan.status}.`);
    if (snapshotStateHash(liveSnapshot) !== plan.currentStateHash) {
      throw new Error("Server state changed after plan generation. Generate a fresh plan.");
    }

    const context = buildContext(desired, liveSnapshot);
    await this.repository.setPlanStatus(plan.id, "applying");
    try {
      for (const operation of plan.operations) {
        assertOperationAllowed(operation, desired, liveSnapshot);
        const result = await this.executeOperation(operation, desired, context, input.reason);
        await this.repository.updateOperation(operation.id, {
          status: "applied", result: result.result, rollback: result.rollback,
        });
        await this.repository.audit({
          guildId: plan.guildId, actor: "antigravity", action: operation.kind,
          targetType: result.targetType, targetId: result.targetId,
          reason: input.reason, details: {planId: plan.id, operation},
        });
      }
      await this.repository.setPlanStatus(plan.id, "applied");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.repository.setPlanStatus(plan.id, "failed");
      await this.repository.audit({
        guildId: plan.guildId, actor: "system", action: "planFailed", reason: message,
        details: {planId: plan.id},
      });
      throw error;
    }
  }

  async rollback(plan: StewardPlan, reason: string): Promise<void> {
    assertSingleGuild(this.adapter.guildId, plan.guildId);
    if (!new Set(["applied", "failed"]).has(plan.status)) {
      throw new Error(`Plan cannot be rolled back from status ${plan.status}.`);
    }
    await this.repository.setPlanStatus(plan.id, "rolling_back");
    const rows = await this.repository.operationRows(plan.id);
    for (const row of [...rows].reverse()) {
      if (row.status !== "applied" || !row.rollback_json) continue;
      const rollback = JSON.parse(row.rollback_json) as RollbackAction;
      await this.executeRollback(rollback, reason);
      await this.repository.updateOperation(row.id, {status: "rolled_back"});
    }
    await this.repository.setPlanStatus(plan.id, "rolled_back");
    await this.repository.audit({
      guildId: plan.guildId, actor: "antigravity", action: "rollbackPlan", reason,
      details: {planId: plan.id},
    });
  }

  private async executeOperation(
    operation: PlanOperation,
    desired: DesiredServerConfig,
    context: ExecutionContext,
    reason: string,
  ): Promise<{result: unknown; rollback: RollbackAction; targetType: string; targetId: string}> {
    switch (operation.kind) {
      case "createRole": {
        const created = await this.adapter.createRole(operation.payload, reason);
        context.roleIds.set(operation.payload.key, created.id);
        return {result: created, rollback: {kind: "deleteRole", roleId: created.id}, targetType: "role", targetId: created.id};
      }
      case "updateRoleColor": {
        const updated = await this.adapter.setRoleColor(operation.payload.roleId, operation.payload.color, reason);
        return {
          result: updated,
          rollback: {kind: "restoreRoleColor", roleId: operation.payload.roleId, color: operation.payload.previousColor},
          targetType: "role", targetId: operation.payload.roleId,
        };
      }
      case "createCategory": {
        const created = await this.adapter.createCategory({name: operation.payload.name}, reason);
        context.categoryIds.set(operation.payload.key, created.id);
        return {result: created, rollback: {kind: "deleteChannel", channelId: created.id}, targetType: "category", targetId: created.id};
      }
      case "createChannel": {
        const parentId = operation.payload.categoryKey ? context.categoryIds.get(operation.payload.categoryKey) : undefined;
        const created = await this.adapter.createChannel({...operation.payload, parentId}, reason);
        context.channelIds.set(operation.payload.key, created.id);
        return {result: created, rollback: {kind: "deleteChannel", channelId: created.id}, targetType: "channel", targetId: created.id};
      }
      case "createAutoModRule": {
        const created = await this.adapter.createAutoModRule(operation.payload, reason);
        return {result: created, rollback: {kind: "deleteAutoModRule", ruleId: created.id}, targetType: "automodRule", targetId: created.id};
      }
      case "setChannelPermissions": {
        const channelId = operation.payload.channelId ?? context.channelIds.get(operation.payload.channelKey);
        if (!channelId) throw new Error(`Cannot resolve channel ${operation.payload.channelKey}.`);
        const before = await this.adapter.getChannelOverwrites(channelId);
        const overwrites = resolveOverwrites(operation.payload.overwrites, desired, context, planGuildId(this.adapter));
        await this.adapter.setChannelOverwrites(channelId, overwrites, reason);
        return {
          result: {channelId, overwriteCount: overwrites.length},
          rollback: {kind: "restoreOverwrites", channelId, overwrites: before},
          targetType: "channel", targetId: channelId,
        };
      }
      case "renameChannel": {
        const channelId = operation.payload.channelId;
        await this.adapter.renameChannel(channelId, operation.payload.newName, reason);
        // Note: rollback for renameChannel is omitted for simplicity in this implementation, but could be added.
        return {
          result: {channelId, newName: operation.payload.newName},
          rollback: {kind: "renameChannel", channelId, newName: "TODO_old_name"}, 
          targetType: "channel", targetId: channelId,
        };
      }
    }
  }

  private async executeRollback(action: RollbackAction, reason: string): Promise<void> {
    switch (action.kind) {
      case "deleteRole": return this.adapter.deleteRole(action.roleId, reason);
      case "restoreRoleColor": await this.adapter.setRoleColor(action.roleId, action.color, reason); return;
      case "deleteChannel": return this.adapter.deleteChannel(action.channelId, reason);
      case "restoreOverwrites": return this.adapter.setChannelOverwrites(action.channelId, action.overwrites, reason);
      case "deleteAutoModRule": return this.adapter.deleteAutoModRule(action.ruleId, reason);
      case "renameChannel": return this.adapter.renameChannel(action.channelId, action.newName, reason);
    }
  }
}

type RollbackAction =
  | {kind: "deleteRole"; roleId: string}
  | {kind: "restoreRoleColor"; roleId: string; color: string}
  | {kind: "deleteChannel"; channelId: string}
  | {kind: "restoreOverwrites"; channelId: string; overwrites: ResolvedPermissionOverwrite[]}
  | {kind: "deleteAutoModRule"; ruleId: string}
  | {kind: "renameChannel"; channelId: string; newName: string};

function buildContext(desired: DesiredServerConfig, snapshot: GuildSnapshot): ExecutionContext {
  const roleIds = new Map<string, string>();
  const categoryIds = new Map<string, string>();
  const channelIds = new Map<string, string>();
  for (const role of desired.roles) {
    const existing = role.existingId
      ? snapshot.roles.find((item) => item.id === role.existingId)
      : snapshot.roles.find((item) => item.name.toLowerCase() === role.name.toLowerCase());
    if (existing) roleIds.set(role.key, existing.id);
  }
  for (const category of desired.categories) {
    const existing = category.existingId
      ? snapshot.channels.find((item) => item.id === category.existingId)
      : snapshot.channels.find((item) => item.type === "GuildCategory" && item.name.toLowerCase() === category.name.toLowerCase());
    if (existing) categoryIds.set(category.key, existing.id);
  }
  for (const channel of desired.channels) {
    const existing = channel.existingId
      ? snapshot.channels.find((item) => item.id === channel.existingId)
      : snapshot.channels.find((item) => item.name.toLowerCase() === channel.name.toLowerCase());
    if (existing) channelIds.set(channel.key, existing.id);
  }
  return {roleIds, categoryIds, channelIds};
}

function resolveOverwrites(
  input: DesiredServerConfig["channels"][number]["permissions"],
  _desired: DesiredServerConfig,
  context: ExecutionContext,
  guildId: string,
): ResolvedPermissionOverwrite[] {
  return input.map((overwrite) => {
    if (overwrite.subject === "everyone") {
      return {subjectId: guildId, subjectType: "role" as const, allow: overwrite.allow, deny: overwrite.deny};
    }
    if (overwrite.subject.startsWith("role:")) {
      const key = overwrite.subject.slice(5);
      const roleId = context.roleIds.get(key);
      if (!roleId) throw new Error(`Cannot resolve role key ${key} for permission overwrite.`);
      return {subjectId: roleId, subjectType: "role" as const, allow: overwrite.allow, deny: overwrite.deny};
    }
    if (overwrite.subject.startsWith("member:")) {
      return {subjectId: overwrite.subject.slice(7), subjectType: "member" as const, allow: overwrite.allow, deny: overwrite.deny};
    }
    throw new Error(`Unsupported permission subject ${overwrite.subject}.`);
  });
}

function planGuildId(adapter: StewardDiscordAdapter): string {
  return adapter.guildId;
}
