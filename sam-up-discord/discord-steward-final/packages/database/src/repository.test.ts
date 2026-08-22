import { afterEach, describe, expect, it } from "vitest";
import { createDatabase } from "./db.js";
import { StewardRepository } from "./repository.js";
import type { GuildSnapshot } from "@discord-steward/shared";

const databases: ReturnType<typeof createDatabase>[] = [];
afterEach(() => databases.splice(0).forEach((db) => db.sqlite.close()));

describe("StewardRepository", () => {
  it("stores and reads snapshots", async () => {
    const db = createDatabase(":memory:");
    databases.push(db);
    const repo = new StewardRepository(db);
    const snapshot: GuildSnapshot = {
      guildId: "12345", guildName: "Test", ownerId: "54321", generatedAt: new Date().toISOString(),
      verificationLevel: 1, memberCount: 2, roles: [], channels: [], automodRules: [], bots: [], ticketHints: [],
    };
    await repo.saveSnapshot(snapshot);
    expect((await repo.latestSnapshot("12345"))?.guildName).toBe("Test");
  });

  it("creates and updates a pending verification request without storing raw text", async () => {
    const db = createDatabase(":memory:");
    databases.push(db);
    const repo = new StewardRepository(db);
    const first = await repo.upsertVerificationRequest({
      guildId: "12345",
      userId: "20001",
      sourceMessageId: "30001",
      ticketChannelId: "40001",
      fullName: "Lara Joy Gayeta",
      orgBatch: "Florentimus Vincula",
      preferredNickname: "Lara",
      nickname: "Lara | Florentimus Vincula",
      parserMethod: "three-line",
    });
    const corrected = await repo.upsertVerificationRequest({
      guildId: "12345",
      userId: "20001",
      sourceMessageId: "30002",
      ticketChannelId: "40001",
      fullName: "Lara Joy O Gayeta",
      orgBatch: "Florentimus Vincula",
      preferredNickname: "Lara",
      nickname: "Lara | Florentimus Vincula",
      parserMethod: "labeled",
    });

    expect(corrected.accepted).toBe(true);
    expect(corrected.request.id).toBe(first.request.id);
    expect(corrected.request.fullName).toBe("Lara Joy O Gayeta");
    expect(corrected.request).not.toHaveProperty("rawMessage");
  });

  it("allows only the first reviewer to atomically claim a pending request", async () => {
    const db = createDatabase(":memory:");
    databases.push(db);
    const repo = new StewardRepository(db);
    const { request } = await repo.upsertVerificationRequest({
      guildId: "12345",
      userId: "20001",
      sourceMessageId: "30001",
      ticketChannelId: "40001",
      fullName: "Lara Joy Gayeta",
      orgBatch: "Florentimus Vincula",
      preferredNickname: "Lara",
      nickname: "Lara | Florentimus Vincula",
      parserMethod: "three-line",
    });

    expect(await repo.claimVerificationRequest(request.id, "50001", "member")).toMatchObject({
      status: "processing",
      reviewerId: "50001",
      selectedRole: "member",
    });
    expect(await repo.claimVerificationRequest(request.id, "50002", "alumni")).toBeNull();
  });

  it("supports correction and restart-safe scheduled deletion", async () => {
    const db = createDatabase(":memory:");
    databases.push(db);
    const repo = new StewardRepository(db);
    const { request } = await repo.upsertVerificationRequest({
      guildId: "12345",
      userId: "20001",
      sourceMessageId: "30001",
      ticketChannelId: "40001",
      fullName: "Lara Joy Gayeta",
      orgBatch: "Florentimus Vincula",
      preferredNickname: "Lara",
      nickname: "Lara | Florentimus Vincula",
      parserMethod: "three-line",
    });

    expect(await repo.requestVerificationCorrection(request.id, "50001")).toBe(true);
    const refreshed = await repo.upsertVerificationRequest({
      guildId: "12345",
      userId: "20001",
      sourceMessageId: "30002",
      ticketChannelId: "40001",
      fullName: "Lara Joy O Gayeta",
      orgBatch: "Florentimus Vincula",
      preferredNickname: "Lara",
      nickname: "Lara | Florentimus Vincula",
      parserMethod: "labeled",
    });
    expect(refreshed.request.status).toBe("pending");

    expect(await repo.claimVerificationRequest(request.id, "50001", "member")).not.toBeNull();
    await repo.completeVerificationRequest(request.id, "2026-07-25T10:05:00.000Z");
    expect(await repo.listVerificationRequestsAwaitingDeletion()).toHaveLength(1);
    expect(await repo.listVerificationRequestsDueForDeletion("2026-07-25T10:04:59.000Z")).toEqual([]);
    expect(await repo.listVerificationRequestsDueForDeletion("2026-07-25T10:05:00.000Z")).toHaveLength(1);
    await repo.markVerificationTicketDeleted(request.id);
    expect(await repo.listVerificationRequestsAwaitingDeletion()).toEqual([]);
    expect(await repo.listVerificationRequestsDueForDeletion("2026-07-25T11:00:00.000Z")).toEqual([]);
  });
});
