import { describe, expect, it } from "vitest";
import {
  applyVerificationMutation,
  isAuthorizedReviewer,
  parseVerificationMessage,
} from "./verification.js";

describe("parseVerificationMessage", () => {
  it("parses labeled fields case-insensitively in any order", () => {
    expect(parseVerificationMessage([
      "preferred nickname: Lara",
      "NAME: Lara Joy O Gayeta",
      "Org Batch Name: Florentimus Vincula",
    ].join("\n"))).toEqual({
      fullName: "Lara Joy O Gayeta",
      orgBatch: "Florentimus Vincula",
      preferredNickname: "Lara",
      nickname: "Lara | Florentimus Vincula",
      method: "labeled",
    });
  });

  it("parses three plain lines and removes list prefixes", () => {
    expect(parseVerificationMessage([
      "1. Lara Joy O Gayeta",
      "- Florentimus Vincula",
      "• Lara",
    ].join("\n"))?.method).toBe("three-line");
  });

  it("parses the supported conversational form", () => {
    expect(parseVerificationMessage(
      "Hi! I'm Lara Joy Gayeta from Florentimus Vincula batch. You can call me Lara.",
    )).toMatchObject({
      fullName: "Lara Joy Gayeta",
      orgBatch: "Florentimus Vincula",
      preferredNickname: "Lara",
      method: "conversational",
    });
  });

  it.each([
    ["two lines", "Lara Joy\nFlorentimus Vincula"],
    ["four lines", "Lara Joy\nFlorentimus Vincula\nLara\nExtra"],
    ["unrelated prose", "Hello, I need some help with verification."],
    ["ambiguous three-line chatter", "Hello there\nNeed some help\nThanks"],
    ["label-like ambiguous lines", "Name: Lara Joy\nBatch: Florentimus Vincula\nNickname: Lara"],
    ["oversized full name", `${"A".repeat(101)}\nBatch\nNick`],
    ["oversized nickname", `Lara Joy\n${"B".repeat(28)}\nNickname`],
  ])("rejects %s", (_label, content) => {
    expect(parseVerificationMessage(content)).toBeNull();
  });
});

describe("verification workflow safety", () => {
  it("authorizes only configured staff roles", () => {
    expect(isAuthorizedReviewer(new Set(["moderator"]), new Set(["admin", "executive", "moderator"]))).toBe(true);
    expect(isAuthorizedReviewer(new Set(["member"]), new Set(["admin", "executive", "moderator"]))).toBe(false);
  });

  it("sets the nickname and leaves exactly the selected access role", async () => {
    const current = new Set(["unverified", "alumni"]);
    const calls: string[] = [];
    const rollback = await applyVerificationMutation({
      currentNickname: () => null,
      currentRoleIds: () => new Set(current),
      setNickname: async (nickname) => { calls.push(`nickname:${nickname ?? "null"}`); },
      addRole: async (roleId) => { current.add(roleId); calls.push(`add:${roleId}`); },
      removeRole: async (roleId) => { current.delete(roleId); calls.push(`remove:${roleId}`); },
    }, {
      nickname: "Lara | Florentimus Vincula",
      selectedRoleId: "member",
      accessRoleIds: ["member", "alumni", "applicant"],
      unverifiedRoleId: "unverified",
    });

    expect(calls[0]).toBe("nickname:Lara | Florentimus Vincula");
    expect(current).toEqual(new Set(["member"]));
    await rollback();
    expect(current).toEqual(new Set(["unverified", "alumni"]));
  });

  it("restores nickname and access roles after a partial mutation failure", async () => {
    const current = new Set(["unverified"]);
    let nickname: string | null = "Original";
    let failOnce = true;
    await expect(applyVerificationMutation({
      currentNickname: () => nickname,
      currentRoleIds: () => new Set(current),
      setNickname: async (value) => { nickname = value; },
      addRole: async (roleId) => { current.add(roleId); },
      removeRole: async (roleId) => {
        if (roleId === "unverified" && failOnce) {
          failOnce = false;
          throw new Error("Discord role removal failed");
        }
        current.delete(roleId);
      },
    }, {
      nickname: "Lara | Batch",
      selectedRoleId: "member",
      accessRoleIds: ["member", "alumni", "applicant"],
      unverifiedRoleId: "unverified",
    })).rejects.toThrow("Discord role removal failed");

    expect(nickname).toBe("Original");
    expect(current).toEqual(new Set(["unverified"]));
  });
});
