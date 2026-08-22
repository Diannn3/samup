import { describe, expect, it } from "vitest";
import { generateRoleColorPlan, generateSetupPlan, snapshotStateHash, verifyPlanIntegrity } from "./planner.js";
import type { DesiredServerConfig, GuildSnapshot } from "@discord-steward/shared";

const snapshot: GuildSnapshot = {
  guildId: "12345", guildName: "Org", ownerId: "54321", generatedAt: new Date().toISOString(),
  verificationLevel: 1, memberCount: 10, roles: [], channels: [], automodRules: [], bots: [], ticketHints: [],
};
const desired: DesiredServerConfig = {
  version: 1, guildId: "12345", organizationName: "Org",
  protected: {roleIds: [], colorEditableRoleIds: [], channelIds: [], ticketKeywords: ["ticket"]},
  roles: [{key: "member", name: "Member", color: "#000000", hoist: false, mentionable: false, permissions: []}],
  categories: [{key: "community", name: "COMMUNITY"}],
  channels: [{key: "general", name: "general", type: "text", categoryKey: "community", permissions: []}],
  automodRules: [],
};

describe("generateSetupPlan", () => {
  it("generates ordered creation operations", () => {
    const plan = generateSetupPlan(snapshot, desired);
    expect(plan.operations.map((item) => item.kind)).toEqual(["createRole", "createCategory", "createChannel"]);
    expect(() => verifyPlanIntegrity(plan)).not.toThrow();
  });

  it("ignores normal member-count changes when locking plan state", () => {
    expect(snapshotStateHash(snapshot)).toBe(snapshotStateHash({...snapshot, memberCount: 99}));
  });

  it("normalizes structural array ordering", () => {
    const withRoles = {
      ...snapshot,
      roles: [
        {id: "11111", name: "A", color: "#000000", position: 1, managed: false, mentionable: false, hoist: false, permissions: ["SendMessages", "ViewChannel"]},
        {id: "22222", name: "B", color: "#000000", position: 2, managed: false, mentionable: false, hoist: false, permissions: []},
      ],
    };
    expect(snapshotStateHash(withRoles)).toBe(snapshotStateHash({
      ...withRoles,
      roles: [
        withRoles.roles[1]!,
        {...withRoles.roles[0]!, permissions: ["ViewChannel", "SendMessages"]},
      ],
    }));
  });

  it("generates only color updates for exact, editable human roles", () => {
    const colorSnapshot: GuildSnapshot = {
      ...snapshot,
      roles: [
        {id: "11111", name: "Member", color: "#000000", position: 1, managed: false, mentionable: false, hoist: false, permissions: []},
        {id: "22222", name: "Verified", color: "#0F766E", position: 2, managed: false, mentionable: false, hoist: false, permissions: []},
      ],
    };
    const colorDesired: DesiredServerConfig = {
      ...desired,
      protected: {roleIds: ["22222"], colorEditableRoleIds: ["22222"], channelIds: [], ticketKeywords: ["ticket"]},
      roles: [
        {...desired.roles[0]!, existingId: "11111", color: "#15803D"},
        {key: "verified", name: "Verified", existingId: "22222", color: "#0F766E", hoist: false, mentionable: false, permissions: []},
      ],
    };
    const plan = generateRoleColorPlan(colorSnapshot, colorDesired);
    expect(plan.operations).toHaveLength(1);
    expect(plan.operations[0]).toMatchObject({
      kind: "updateRoleColor",
      risk: "low",
      payload: {roleKey: "member", roleId: "11111", color: "#15803D", previousColor: "#000000"},
    });
    expect(() => verifyPlanIntegrity(plan)).not.toThrow();
  });

  it("rejects protected roles not explicitly allowlisted for color-only edits", () => {
    const protectedSnapshot: GuildSnapshot = {
      ...snapshot,
      roles: [{id: "11111", name: "Member", color: "#000000", position: 1, managed: false, mentionable: false, hoist: false, permissions: []}],
    };
    const protectedDesired: DesiredServerConfig = {
      ...desired,
      protected: {roleIds: ["11111"], colorEditableRoleIds: [], channelIds: [], ticketKeywords: ["ticket"]},
      roles: [{...desired.roles[0]!, existingId: "11111", color: "#15803D"}],
    };
    expect(() => generateRoleColorPlan(protectedSnapshot, protectedDesired)).toThrow("not allowlisted");
  });
});
