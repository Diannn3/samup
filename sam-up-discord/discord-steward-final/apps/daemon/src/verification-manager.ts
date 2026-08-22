import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  type ButtonInteraction,
  type Client,
  type GuildMember,
  type Message,
  type TextChannel,
} from "discord.js";
import type {
  StewardRepository,
  VerificationRequest,
  VerificationRole,
} from "@discord-steward/database";
import type { DesiredServerConfig } from "@discord-steward/shared";
import {
  applyVerificationMutation,
  isAuthorizedReviewer,
  parseVerificationMessage,
} from "./verification.js";

const DELETE_DELAY_MS = 5 * 60 * 1000;
const BUTTON_PREFIX = "verification";
const CORRECTION_FORMAT = [
  "I couldn't confidently read all three details. Please reply using exactly three lines:",
  "```",
  "Full Name",
  "Org Batch Name",
  "Preferred Nickname",
  "```",
].join("\n");

interface VerificationLogger {
  info(first: unknown, message?: string): void;
  warn(first: unknown, message?: string): void;
  error(first: unknown, message?: string): void;
}

interface VerificationIds {
  guildId: string;
  roles: Record<"admin" | "executive" | "moderator" | VerificationRole | "unverified", string>;
  channels: Record<"verification-support" | "server-logs", string>;
}

function requiredExistingId(
  entries: Array<{ key: string; existingId?: string }>,
  key: string,
  kind: string,
): string {
  const id = entries.find((entry) => entry.key === key)?.existingId;
  if (!id) throw new Error(`Verification requires ${kind} "${key}" to have an existingId in server.yaml.`);
  return id;
}

function resolveVerificationIds(config: DesiredServerConfig): VerificationIds {
  return {
    guildId: config.guildId,
    roles: {
      admin: requiredExistingId(config.roles, "admin", "role"),
      executive: requiredExistingId(config.roles, "executive", "role"),
      moderator: requiredExistingId(config.roles, "moderator", "role"),
      member: requiredExistingId(config.roles, "member", "role"),
      alumni: requiredExistingId(config.roles, "alumni", "role"),
      applicant: requiredExistingId(config.roles, "applicant", "role"),
      unverified: requiredExistingId(config.roles, "unverified", "role"),
    },
    channels: {
      "verification-support": requiredExistingId(config.channels, "verification-support", "channel"),
      "server-logs": requiredExistingId(config.channels, "server-logs", "channel"),
    },
  };
}

function reviewComponents(requestId: string, disabled = false) {
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${BUTTON_PREFIX}:member:${requestId}`)
        .setLabel("Approve as Member")
        .setStyle(ButtonStyle.Success)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`${BUTTON_PREFIX}:alumni:${requestId}`)
        .setLabel("Approve as Alumni")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`${BUTTON_PREFIX}:applicant:${requestId}`)
        .setLabel("Approve as Applicant")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(`${BUTTON_PREFIX}:correction:${requestId}`)
        .setLabel("Request correction")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(disabled),
    ),
  ];
}

function reviewEmbed(request: VerificationRequest, status = "Awaiting staff confirmation") {
  return new EmbedBuilder()
    .setTitle("SAM-UP verification review")
    .setDescription(`Applicant: <@${request.userId}>\nTicket: <#${request.ticketChannelId}>`)
    .addFields(
      { name: "Full name", value: request.fullName, inline: false },
      { name: "Org batch", value: request.orgBatch, inline: true },
      { name: "Preferred nickname", value: request.preferredNickname, inline: true },
      { name: "Nickname preview", value: request.nickname, inline: false },
      { name: "Parser", value: request.parserMethod, inline: true },
      { name: "Status", value: status, inline: true },
    )
    .setFooter({ text: `Request ${request.id}` })
    .setTimestamp(new Date(request.updatedAt));
}

function parseButton(customId: string): { action: VerificationRole | "correction"; requestId: string } | null {
  const match = customId.match(/^verification:(member|alumni|applicant|correction):(.+)$/);
  if (!match?.[1] || !match[2]) return null;
  return {
    action: match[1] as VerificationRole | "correction",
    requestId: match[2],
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export class VerificationManager {
  private readonly ids: VerificationIds;
  private readonly deletionTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly client: Client,
    private readonly repository: StewardRepository,
    config: DesiredServerConfig,
    private readonly logger: VerificationLogger,
  ) {
    this.ids = resolveVerificationIds(config);
  }

  async handleMessage(message: Message): Promise<void> {
    if (message.author.bot || message.guild?.id !== this.ids.guildId) return;
    if (
      !("name" in message.channel) ||
      typeof message.channel.name !== "string" ||
      !message.channel.name.startsWith("ticket-")
    ) return;
    if (!message.member?.roles.cache.has(this.ids.roles.unverified)) return;

    const parsed = parseVerificationMessage(message.content);
    if (!parsed) {
      await message.reply(CORRECTION_FORMAT);
      return;
    }

    const result = await this.repository.upsertVerificationRequest({
      guildId: message.guild.id,
      userId: message.author.id,
      sourceMessageId: message.id,
      ticketChannelId: message.channel.id,
      fullName: parsed.fullName,
      orgBatch: parsed.orgBatch,
      preferredNickname: parsed.preferredNickname,
      nickname: parsed.nickname,
      parserMethod: parsed.method,
    });
    if (!result.accepted) {
      await message.reply("Your verification is already being processed or has been completed.");
      return;
    }

    const supportChannel = await this.fetchTextChannel(this.ids.channels["verification-support"]);
    const payload = {
      embeds: [reviewEmbed(result.request)],
      components: reviewComponents(result.request.id),
      allowedMentions: { parse: [] as never[] },
    };
    let supportMessage = null;
    if (result.request.supportMessageId) {
      supportMessage = await supportChannel.messages.fetch(result.request.supportMessageId).catch(() => null);
    }
    if (supportMessage) {
      await supportMessage.edit(payload);
    } else {
      supportMessage = await supportChannel.send(payload);
      await this.repository.setVerificationSupportMessage(result.request.id, supportMessage.id);
    }

    await message.react("✅");
    await message.reply("Thanks! Your details were parsed and sent to authorized staff for role confirmation.");
    this.logger.info(
      { requestId: result.request.id, userId: result.request.userId, parserMethod: result.request.parserMethod },
      "Created or updated verification review",
    );
  }

  async handleInteraction(interaction: ButtonInteraction): Promise<void> {
    const button = parseButton(interaction.customId);
    if (!button || !interaction.guild) return;
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const reviewer = await interaction.guild.members.fetch(interaction.user.id);
    const authorized = new Set([
      this.ids.roles.admin,
      this.ids.roles.executive,
      this.ids.roles.moderator,
    ]);
    if (!isAuthorizedReviewer(new Set(reviewer.roles.cache.keys()), authorized)) {
      await interaction.editReply("Only an Admin, Executive, or Moderator may review verifications.");
      return;
    }

    const request = await this.repository.getVerificationRequest(button.requestId);
    if (!request) {
      await interaction.editReply("This verification request no longer exists.");
      return;
    }

    if (button.action === "correction") {
      const accepted = await this.repository.requestVerificationCorrection(request.id, reviewer.id);
      if (!accepted) {
        await interaction.editReply("This verification request has already been handled.");
        return;
      }
      const ticket = await this.fetchTextChannel(request.ticketChannelId);
      await ticket.send({ content: `<@${request.userId}>\n${CORRECTION_FORMAT}`, allowedMentions: { users: [request.userId] } });
      await interaction.message.edit({
        embeds: [reviewEmbed(request, `Correction requested by ${reviewer.user.tag}`)],
        components: reviewComponents(request.id, true),
      });
      await this.repository.audit({
        guildId: request.guildId,
        actor: reviewer.id,
        action: "verification.correction_requested",
        targetType: "member",
        targetId: request.userId,
        details: this.auditDetails(request),
      });
      await interaction.editReply("Correction requested. The member remains Unverified.");
      return;
    }

    const claimed = await this.repository.claimVerificationRequest(request.id, reviewer.id, button.action);
    if (!claimed) {
      await interaction.editReply("This verification request has already been handled.");
      return;
    }

    const deleteAt = new Date(Date.now() + DELETE_DELAY_MS).toISOString();
    let rollback: (() => Promise<void>) | null = null;
    try {
      rollback = await this.applyApproval(claimed, reviewer, button.action);
      await this.repository.audit({
        guildId: claimed.guildId,
        actor: reviewer.id,
        action: "verification.approved",
        targetType: "member",
        targetId: claimed.userId,
        details: { ...this.auditDetails(claimed), selectedRole: button.action, deleteAt },
      });
      await this.repository.completeVerificationRequest(claimed.id, deleteAt);
    } catch (error) {
      if (rollback) await rollback().catch((rollbackError) => {
        this.logger.error(rollbackError, "Failed to fully roll back verification member changes");
      });
      await this.repository.releaseVerificationRequest(claimed.id, errorMessage(error));
      this.logger.error(error, "Verification approval failed and was released for retry");
      await interaction.editReply(`Verification failed safely: ${errorMessage(error)}`);
      return;
    }

    await interaction.message.edit({
      embeds: [reviewEmbed(claimed, `Approved as ${button.action} by ${reviewer.user.tag}`)],
      components: reviewComponents(claimed.id, true),
    }).catch((error) => this.logger.error(error, "Failed to disable verification review buttons"));

    const ticket = await this.fetchTextChannel(claimed.ticketChannelId).catch((error) => {
      this.logger.error(error, "Failed to fetch approved verification ticket for confirmation");
      return null;
    });
    await ticket?.send(`✅ You've been verified as ${this.roleLabel(button.action)}! You now have access to the server.`)
      .catch((error) => this.logger.error(error, "Failed to post verification confirmation"));
    await this.sendServerLog(claimed, reviewer, button.action)
      .catch((error) => this.logger.error(error, "Failed to post verification server log"));
    this.scheduleDeletion(claimed.id, claimed.ticketChannelId, deleteAt);
    await interaction.editReply(`Verified <@${claimed.userId}> as ${this.roleLabel(button.action)}. The ticket will be deleted in five minutes.`);
  }

  async resumeScheduledDeletions(): Promise<void> {
    for (const request of await this.repository.listVerificationRequestsAwaitingDeletion()) {
      if (request.deleteAt) this.scheduleDeletion(request.id, request.ticketChannelId, request.deleteAt);
    }
  }

  private async applyApproval(
    request: VerificationRequest,
    reviewer: GuildMember,
    selectedRole: VerificationRole,
  ): Promise<() => Promise<void>> {
    const guild = reviewer.guild;
    const member = await guild.members.fetch(request.userId);
    if (!member.manageable) throw new Error("The member is not manageable by the bot role hierarchy.");

    const relevantRoleIds = [
      this.ids.roles.member,
      this.ids.roles.alumni,
      this.ids.roles.applicant,
      this.ids.roles.unverified,
    ];
    for (const roleId of relevantRoleIds) {
      const role = await guild.roles.fetch(roleId);
      if (!role) throw new Error(`Required role ${roleId} no longer exists.`);
      if (!role.editable) throw new Error(`Required role ${role.name} is not editable by the bot.`);
    }
    await this.fetchTextChannel(request.ticketChannelId);

    return applyVerificationMutation({
      currentNickname: () => member.nickname,
      currentRoleIds: () => new Set(member.roles.cache.keys()),
      setNickname: async (nickname) => { await member.setNickname(nickname, `Verification approved by ${reviewer.user.tag}`); },
      addRole: async (roleId) => { await member.roles.add(roleId, `Verification approved by ${reviewer.user.tag}`); },
      removeRole: async (roleId) => { await member.roles.remove(roleId, `Verification approved by ${reviewer.user.tag}`); },
    }, {
      nickname: request.nickname,
      selectedRoleId: this.ids.roles[selectedRole],
      accessRoleIds: [this.ids.roles.member, this.ids.roles.alumni, this.ids.roles.applicant],
      unverifiedRoleId: this.ids.roles.unverified,
    });
  }

  private async sendServerLog(
    request: VerificationRequest,
    reviewer: GuildMember,
    selectedRole: VerificationRole,
  ): Promise<void> {
    const channel = await this.fetchTextChannel(this.ids.channels["server-logs"]);
    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("Verification approved")
          .addFields(
            { name: "Full name", value: request.fullName },
            { name: "Org batch", value: request.orgBatch, inline: true },
            { name: "Preferred nickname", value: request.preferredNickname, inline: true },
            { name: "Role", value: this.roleLabel(selectedRole), inline: true },
            { name: "Parser", value: request.parserMethod, inline: true },
            { name: "User ID", value: request.userId },
            { name: "Ticket ID", value: request.ticketChannelId },
            { name: "Approved by", value: `${reviewer.user.tag} (${reviewer.id})` },
          )
          .setTimestamp(),
      ],
      allowedMentions: { parse: [] },
    });
  }

  private auditDetails(request: VerificationRequest) {
    return {
      requestId: request.id,
      sourceMessageId: request.sourceMessageId,
      ticketChannelId: request.ticketChannelId,
      fullName: request.fullName,
      orgBatch: request.orgBatch,
      preferredNickname: request.preferredNickname,
      nickname: request.nickname,
      parserMethod: request.parserMethod,
    };
  }

  private roleLabel(role: VerificationRole): string {
    return role[0]!.toUpperCase() + role.slice(1);
  }

  private async fetchTextChannel(channelId: string): Promise<TextChannel> {
    const channel = await this.client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased() || !("send" in channel) || !("messages" in channel)) {
      throw new Error(`Required text channel ${channelId} is unavailable.`);
    }
    return channel as TextChannel;
  }

  private scheduleDeletion(requestId: string, channelId: string, deleteAt: string): void {
    const existing = this.deletionTimers.get(requestId);
    if (existing) clearTimeout(existing);
    const delay = Math.max(0, new Date(deleteAt).getTime() - Date.now());
    const timer = setTimeout(() => {
      this.deletionTimers.delete(requestId);
      void this.deleteTicket(requestId, channelId);
    }, delay);
    timer.unref();
    this.deletionTimers.set(requestId, timer);
  }

  private async deleteTicket(requestId: string, channelId: string): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) {
        await this.repository.markVerificationTicketDeleted(requestId);
        return;
      }
      if (!("deletable" in channel) || !channel.deletable || !("delete" in channel)) {
        throw new Error(`Ticket channel ${channelId} is not deletable by the bot.`);
      }
      await channel.delete("SAM-UP verification completed; five-minute retention elapsed.");
      await this.repository.markVerificationTicketDeleted(requestId);
      this.logger.info({ requestId, channelId }, "Deleted completed verification ticket");
    } catch (error) {
      await this.repository.markVerificationTicketDeleteFailed(requestId, errorMessage(error));
      this.logger.error(error, "Failed to delete completed verification ticket");
    }
  }
}
