import { describe, expect, it } from "vitest";
import type { StewardRepository } from "@discord-steward/database";
import type { DesiredServerConfig, GuildSnapshot } from "@discord-steward/shared";
import type { StewardDiscordAdapter } from "./adapter.js";
import { PlanExecutor } from "./executor.js";
import { generateRoleColorPlan } from "./planner.js";

const snapshot: GuildSnapshot = {
  guildId: "12345", guildName: "Org", ownerId: "54321", generatedAt: new Date().toISOString(),
  verificationLevel: 1, memberCount: 1, channels: [], automodRules: [], bots: [], ticketHints: [],
  roles: [{id: "11111", name: "Member", color: "#000000", position: 1, managed: false, mentionable: false, hoist: false, permissions: []}],
};

const desired: DesiredServerConfig = {
  version: 1, guildId: "12345", organizationName: "Org",
  protected: {roleIds: [], colorEditableRoleIds: [], channelIds: [], ticketKeywords: ["ticket"]},
  roles: [{key: "member", name: "Member", existingId: "11111", color: "#15803D", hoist: false, mentionable: false, permissions: []}],
  categories: [], channels: [], automodRules: [],
};

describe("PlanExecutor role color updates", () => {
  it("changes only the color and restores it during rollback", async () => {
    let liveColor = "#000000";
    const rows: Array<{id: string; status: string; rollback_json: string | null}> = [];
    const adapter = {
      guildId: "12345",
      setRoleColor: async (roleId: string, color: string) => {
        expect(roleId).toBe("11111");
        liveColor = color;
        return {id: roleId, name: "Member", color};
      },
    } as unknown as StewardDiscordAdapter;
    const repository = {
      setPlanStatus: async () => undefined,
      updateOperation: async (id: string, update: {status: string; rollback?: unknown}) => {
        rows.push({id, status: update.status, rollback_json: update.rollback === undefined ? null : JSON.stringify(update.rollback)});
      },
      audit: async () => undefined,
      operationRows: async () => rows,
    } as unknown as StewardRepository;
    const plan = generateRoleColorPlan(snapshot, desired);
    const executor = new PlanExecutor(adapter, repository);

    await executor.apply({plan, confirmationCode: plan.confirmationCode, desired, liveSnapshot: snapshot, reason: "Apply member color"});
    expect(liveColor).toBe("#15803D");

    await executor.rollback({...plan, status: "applied"}, "Restore member color");
    expect(liveColor).toBe("#000000");
  });
});
