import type { Client } from "discord.js";
import { createDatabase, StewardRepository } from "@discord-steward/database";
import {
  PlanExecutor,
  generateRoleColorPlan,
  generateSetupPlan,
  loadServerConfig,
} from "@discord-steward/core";
import {
  newId,
  nowIso,
  type GuildSnapshot,
  type Health,
} from "@discord-steward/shared";
import type { GuildMember, Message } from "discord.js";
import { DiscordJsStewardAdapter } from "./discord-adapter.js";
import type { StewardEnv } from "./env.js";

export class StewardService {
  readonly repository: StewardRepository;
  readonly adapter: DiscordJsStewardAdapter;
  readonly executor: PlanExecutor;
  readonly startedAt = nowIso();
  private guildName: string | null = null;

  constructor(private readonly client: Client, readonly env: StewardEnv) {
    const database = createDatabase(env.DATABASE_PATH);
    this.repository = new StewardRepository(database);
    this.adapter = new DiscordJsStewardAdapter(client, env.DISCORD_GUILD_ID);
    this.executor = new PlanExecutor(this.adapter, this.repository);

  }

  health(): Health {
    return {
      status: this.client.isReady() ? "ready" : "starting",
      discordConnected: this.client.isReady(),
      guildId: this.env.DISCORD_GUILD_ID,
      guildName: this.guildName,
      startedAt: this.startedAt,
      version: "1.0.0",
    };
  }

  async inspect(): Promise<GuildSnapshot> {
    const snapshot = await this.adapter.inspect();
    this.guildName = snapshot.guildName;
    await this.repository.saveSnapshot(snapshot);
    return snapshot;
  }

  async generatePlan() {
    const snapshot = await this.inspect();
    const desired = loadServerConfig();
    const plan = generateSetupPlan(snapshot, desired);
    await this.repository.createPlan(plan);
    return plan;
  }

  async generateRoleColorPlan() {
    const snapshot = await this.inspect();
    const desired = loadServerConfig();
    const plan = generateRoleColorPlan(snapshot, desired);
    await this.repository.createPlan(plan);
    return plan;
  }

  async applyPlan(planId: string, confirmationCode: string, reason: string) {
    const plan = await this.repository.getPlan(planId);
    if (!plan) throw new Error(`Plan ${planId} not found.`);
    const desired = loadServerConfig();
    const liveSnapshot = await this.adapter.inspect();
    await this.executor.apply({plan, confirmationCode, desired, liveSnapshot, reason});
    return this.inspect();
  }

  async rollbackPlan(planId: string, reason: string) {
    const plan = await this.repository.getPlan(planId);
    if (!plan) throw new Error(`Plan ${planId} not found.`);
    await this.executor.rollback(plan, reason);
    return this.inspect();
  }

}
