import {
  GuildSnapshotSchema,
  PlanSchema,
  newId,
  nowIso,
  type GuildSnapshot,
  type StewardPlan,
} from "@discord-steward/shared";
import type { StewardDatabase } from "./db.js";

interface PlanRow {
  id: string;
  status: string;
  plan_json: string;
}
interface OperationRow {
  id: string;
  plan_id: string;
  operation_index: number;
  operation_json: string;
  status: string;
  result_json: string | null;
  rollback_json: string | null;
  error: string | null;
}

export type VerificationParserMethod = "labeled" | "three-line" | "conversational";
export type VerificationRole = "member" | "alumni" | "applicant";
export type VerificationStatus =
  | "pending"
  | "processing"
  | "correction_requested"
  | "completed"
  | "delete_failed"
  | "ticket_deleted";

export interface VerificationRequest {
  id: string;
  guildId: string;
  userId: string;
  sourceMessageId: string;
  ticketChannelId: string;
  supportMessageId: string | null;
  fullName: string;
  orgBatch: string;
  preferredNickname: string;
  nickname: string;
  parserMethod: VerificationParserMethod;
  status: VerificationStatus;
  reviewerId: string | null;
  selectedRole: VerificationRole | null;
  createdAt: string;
  updatedAt: string;
  deleteAt: string | null;
  lastError: string | null;
}

export interface UpsertVerificationRequest {
  guildId: string;
  userId: string;
  sourceMessageId: string;
  ticketChannelId: string;
  fullName: string;
  orgBatch: string;
  preferredNickname: string;
  nickname: string;
  parserMethod: VerificationParserMethod;
}

interface VerificationRequestRow {
  id: string;
  guild_id: string;
  user_id: string;
  source_message_id: string;
  ticket_channel_id: string;
  support_message_id: string | null;
  full_name: string;
  org_batch: string;
  preferred_nickname: string;
  nickname: string;
  parser_method: VerificationParserMethod;
  status: VerificationStatus;
  reviewer_id: string | null;
  selected_role: VerificationRole | null;
  created_at: string;
  updated_at: string;
  delete_at: string | null;
  last_error: string | null;
}

function mapVerificationRequest(row: VerificationRequestRow): VerificationRequest {
  return {
    id: row.id,
    guildId: row.guild_id,
    userId: row.user_id,
    sourceMessageId: row.source_message_id,
    ticketChannelId: row.ticket_channel_id,
    supportMessageId: row.support_message_id,
    fullName: row.full_name,
    orgBatch: row.org_batch,
    preferredNickname: row.preferred_nickname,
    nickname: row.nickname,
    parserMethod: row.parser_method,
    status: row.status,
    reviewerId: row.reviewer_id,
    selectedRole: row.selected_role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deleteAt: row.delete_at,
    lastError: row.last_error,
  };
}

export class StewardRepository {
  constructor(private readonly database: StewardDatabase) {}

  async saveSnapshot(snapshot: GuildSnapshot): Promise<void> {
    this.database.sqlite.prepare(`INSERT INTO snapshots (id,guild_id,generated_at,snapshot_json) VALUES (?,?,?,?)`)
      .run(newId("snap"), snapshot.guildId, snapshot.generatedAt, JSON.stringify(snapshot));
  }

  async latestSnapshot(guildId: string): Promise<GuildSnapshot | null> {
    const row = this.database.sqlite.prepare(`SELECT snapshot_json FROM snapshots WHERE guild_id=? ORDER BY generated_at DESC LIMIT 1`)
      .get(guildId) as {snapshot_json: string} | undefined;
    return row ? GuildSnapshotSchema.parse(JSON.parse(row.snapshot_json)) : null;
  }

  async createPlan(plan: StewardPlan): Promise<void> {
    const insertPlan = this.database.sqlite.prepare(`
      INSERT INTO plans (id,guild_id,created_at,expires_at,status,hash,confirmation_code,current_state_hash,plan_json)
      VALUES (?,?,?,?,?,?,?,?,?)
    `);
    const insertOperation = this.database.sqlite.prepare(`
      INSERT INTO plan_operations (id,plan_id,operation_index,operation_json,status) VALUES (?,?,?,?,?)
    `);
    this.database.sqlite.exec("BEGIN IMMEDIATE");
    try {
      insertPlan.run(plan.id, plan.guildId, plan.createdAt, plan.expiresAt, plan.status, plan.hash, plan.confirmationCode, plan.currentStateHash, JSON.stringify(plan));
      plan.operations.forEach((operation, index) => insertOperation.run(operation.id, plan.id, index, JSON.stringify(operation), "pending"));
      this.database.sqlite.exec("COMMIT");
    } catch (error) {
      this.database.sqlite.exec("ROLLBACK");
      throw error;
    }
  }

  async getPlan(planId: string): Promise<StewardPlan | null> {
    const row = this.database.sqlite.prepare(`SELECT id,status,plan_json FROM plans WHERE id=? LIMIT 1`).get(planId) as PlanRow | undefined;
    if (!row) return null;
    return {...PlanSchema.parse(JSON.parse(row.plan_json)), status: row.status as StewardPlan["status"]};
  }

  async listPlans(guildId: string, limit = 20): Promise<StewardPlan[]> {
    const rows = this.database.sqlite.prepare(`SELECT id,status,plan_json FROM plans WHERE guild_id=? ORDER BY created_at DESC LIMIT ?`)
      .all(guildId, limit) as unknown as PlanRow[];
    return rows.map((row) => ({...PlanSchema.parse(JSON.parse(row.plan_json)), status: row.status as StewardPlan["status"]}));
  }

  async setPlanStatus(planId: string, status: StewardPlan["status"]): Promise<void> {
    this.database.sqlite.prepare(`UPDATE plans SET status=? WHERE id=?`).run(status, planId);
  }

  async operationRows(planId: string): Promise<OperationRow[]> {
    return this.database.sqlite.prepare(`SELECT * FROM plan_operations WHERE plan_id=? ORDER BY operation_index`)
      .all(planId) as unknown as OperationRow[];
  }

  async updateOperation(operationId: string, update: {status: string; result?: unknown; rollback?: unknown; error?: string}): Promise<void> {
    this.database.sqlite.prepare(`UPDATE plan_operations SET status=?, result_json=?, rollback_json=?, error=? WHERE id=?`)
      .run(
        update.status,
        update.result === undefined ? null : JSON.stringify(update.result),
        update.rollback === undefined ? null : JSON.stringify(update.rollback),
        update.error ?? null,
        operationId,
      );
  }

  async audit(input: {guildId: string; actor: string; action: string; targetType?: string; targetId?: string; reason?: string; details?: unknown}): Promise<void> {
    this.database.sqlite.prepare(`
      INSERT INTO audit_events (id,guild_id,created_at,actor,action,target_type,target_id,reason,details_json)
      VALUES (?,?,?,?,?,?,?,?,?)
    `).run(newId("audit"), input.guildId, nowIso(), input.actor, input.action, input.targetType ?? null, input.targetId ?? null, input.reason ?? null, JSON.stringify(input.details ?? {}));
  }

  async listAudit(guildId: string, limit = 100) {
    const rows = this.database.sqlite.prepare(`SELECT * FROM audit_events WHERE guild_id=? ORDER BY created_at DESC LIMIT ?`)
      .all(guildId, limit) as unknown as Array<{
        id: string; guild_id: string; created_at: string; actor: string; action: string;
        target_type: string | null; target_id: string | null; reason: string | null; details_json: string;
      }>;
    return rows.map((row) => ({
      id: row.id, guildId: row.guild_id, createdAt: row.created_at, actor: row.actor, action: row.action,
      targetType: row.target_type, targetId: row.target_id, reason: row.reason, details: JSON.parse(row.details_json),
    }));
  }

  async getVerificationRequest(id: string): Promise<VerificationRequest | null> {
    const row = this.database.sqlite.prepare(`SELECT * FROM verification_requests WHERE id=? LIMIT 1`)
      .get(id) as VerificationRequestRow | undefined;
    return row ? mapVerificationRequest(row) : null;
  }

  async upsertVerificationRequest(
    input: UpsertVerificationRequest,
  ): Promise<{ request: VerificationRequest; accepted: boolean }> {
    const existing = this.database.sqlite.prepare(`
      SELECT * FROM verification_requests WHERE ticket_channel_id=? AND user_id=? LIMIT 1
    `).get(input.ticketChannelId, input.userId) as VerificationRequestRow | undefined;
    const timestamp = nowIso();

    if (existing) {
      if (existing.status !== "pending" && existing.status !== "correction_requested") {
        return { request: mapVerificationRequest(existing), accepted: false };
      }
      this.database.sqlite.prepare(`
        UPDATE verification_requests
        SET source_message_id=?, full_name=?, org_batch=?, preferred_nickname=?, nickname=?,
            parser_method=?, status='pending', reviewer_id=NULL, selected_role=NULL,
            updated_at=?, delete_at=NULL, last_error=NULL
        WHERE id=?
      `).run(
        input.sourceMessageId,
        input.fullName,
        input.orgBatch,
        input.preferredNickname,
        input.nickname,
        input.parserMethod,
        timestamp,
        existing.id,
      );
      const request = await this.getVerificationRequest(existing.id);
      if (!request) throw new Error(`Verification request ${existing.id} disappeared after update.`);
      return { request, accepted: true };
    }

    const id = newId("verify");
    this.database.sqlite.prepare(`
      INSERT INTO verification_requests (
        id,guild_id,user_id,source_message_id,ticket_channel_id,support_message_id,
        full_name,org_batch,preferred_nickname,nickname,parser_method,status,
        reviewer_id,selected_role,created_at,updated_at,delete_at,last_error
      ) VALUES (?,?,?,?,?,NULL,?,?,?,?,?,'pending',NULL,NULL,?,?,NULL,NULL)
    `).run(
      id,
      input.guildId,
      input.userId,
      input.sourceMessageId,
      input.ticketChannelId,
      input.fullName,
      input.orgBatch,
      input.preferredNickname,
      input.nickname,
      input.parserMethod,
      timestamp,
      timestamp,
    );
    const request = await this.getVerificationRequest(id);
    if (!request) throw new Error(`Verification request ${id} was not persisted.`);
    return { request, accepted: true };
  }

  async setVerificationSupportMessage(id: string, supportMessageId: string): Promise<void> {
    this.database.sqlite.prepare(`
      UPDATE verification_requests SET support_message_id=?, updated_at=? WHERE id=?
    `).run(supportMessageId, nowIso(), id);
  }

  async claimVerificationRequest(
    id: string,
    reviewerId: string,
    selectedRole: VerificationRole,
  ): Promise<VerificationRequest | null> {
    const result = this.database.sqlite.prepare(`
      UPDATE verification_requests
      SET status='processing', reviewer_id=?, selected_role=?, updated_at=?, last_error=NULL
      WHERE id=? AND status='pending'
    `).run(reviewerId, selectedRole, nowIso(), id);
    if (result.changes !== 1) return null;
    return this.getVerificationRequest(id);
  }

  async requestVerificationCorrection(id: string, reviewerId: string): Promise<boolean> {
    const result = this.database.sqlite.prepare(`
      UPDATE verification_requests
      SET status='correction_requested', reviewer_id=?, selected_role=NULL, updated_at=?
      WHERE id=? AND status='pending'
    `).run(reviewerId, nowIso(), id);
    return result.changes === 1;
  }

  async releaseVerificationRequest(id: string, error: string): Promise<void> {
    this.database.sqlite.prepare(`
      UPDATE verification_requests
      SET status='pending', reviewer_id=NULL, selected_role=NULL, updated_at=?, last_error=?
      WHERE id=? AND status='processing'
    `).run(nowIso(), error, id);
  }

  async completeVerificationRequest(id: string, deleteAt: string): Promise<void> {
    this.database.sqlite.prepare(`
      UPDATE verification_requests
      SET status='completed', updated_at=?, delete_at=?, last_error=NULL
      WHERE id=? AND status='processing'
    `).run(nowIso(), deleteAt, id);
  }

  async listVerificationRequestsDueForDeletion(now: string): Promise<VerificationRequest[]> {
    const rows = this.database.sqlite.prepare(`
      SELECT * FROM verification_requests
      WHERE status IN ('completed','delete_failed') AND delete_at IS NOT NULL AND delete_at<=?
      ORDER BY delete_at
    `).all(now) as unknown as VerificationRequestRow[];
    return rows.map(mapVerificationRequest);
  }

  async listVerificationRequestsAwaitingDeletion(): Promise<VerificationRequest[]> {
    const rows = this.database.sqlite.prepare(`
      SELECT * FROM verification_requests
      WHERE status IN ('completed','delete_failed') AND delete_at IS NOT NULL
      ORDER BY delete_at
    `).all() as unknown as VerificationRequestRow[];
    return rows.map(mapVerificationRequest);
  }

  async markVerificationTicketDeleted(id: string): Promise<void> {
    this.database.sqlite.prepare(`
      UPDATE verification_requests
      SET status='ticket_deleted', updated_at=?, last_error=NULL WHERE id=?
    `).run(nowIso(), id);
  }

  async markVerificationTicketDeleteFailed(id: string, error: string): Promise<void> {
    this.database.sqlite.prepare(`
      UPDATE verification_requests
      SET status='delete_failed', updated_at=?, last_error=? WHERE id=?
    `).run(nowIso(), error, id);
  }
}
