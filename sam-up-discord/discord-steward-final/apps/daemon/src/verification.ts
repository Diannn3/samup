export type VerificationParseMethod = "labeled" | "three-line" | "conversational";

export interface ParsedVerification {
  fullName: string;
  orgBatch: string;
  preferredNickname: string;
  nickname: string;
  method: VerificationParseMethod;
}

export interface VerificationMemberMutationAdapter {
  currentNickname(): string | null;
  currentRoleIds(): Set<string>;
  setNickname(nickname: string | null): Promise<void>;
  addRole(roleId: string): Promise<void>;
  removeRole(roleId: string): Promise<void>;
}

export interface VerificationMutation {
  nickname: string;
  selectedRoleId: string;
  accessRoleIds: string[];
  unverifiedRoleId: string;
}

const FIELD_LIMITS = {
  fullName: 100,
  orgBatch: 64,
  preferredNickname: 32,
} as const;

function normalizeField(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function buildParsed(
  fullNameInput: string,
  orgBatchInput: string,
  preferredNicknameInput: string,
  method: VerificationParseMethod,
): ParsedVerification | null {
  const fullName = normalizeField(fullNameInput);
  const orgBatch = normalizeField(orgBatchInput);
  const preferredNickname = normalizeField(preferredNicknameInput).replace(/[.!?]+$/, "");
  const nickname = `${preferredNickname} | ${orgBatch}`;
  const looksLikeChatter = /\b(?:hello|hi|help|please|thanks|thank you)\b/i;

  if (
    fullName.length < 2 ||
    fullName.length > FIELD_LIMITS.fullName ||
    orgBatch.length < 2 ||
    orgBatch.length > FIELD_LIMITS.orgBatch ||
    preferredNickname.length < 1 ||
    preferredNickname.length > FIELD_LIMITS.preferredNickname ||
    (method === "three-line" && (
      looksLikeChatter.test(`${fullName} ${orgBatch} ${preferredNickname}`) ||
      [fullName, orgBatch, preferredNickname].some((field) => field.includes(":"))
    )) ||
    nickname.length > 32
  ) {
    return null;
  }

  return { fullName, orgBatch, preferredNickname, nickname, method };
}

export function parseVerificationMessage(content: string): ParsedVerification | null {
  const labeled = new Map<string, string>();
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*(name|org batch name|preferred nickname)\s*:\s*(.+?)\s*$/i);
    if (match?.[1] && match[2]) {
      labeled.set(match[1].toLowerCase(), match[2].trim());
    }
  }

  const fullName = labeled.get("name");
  const orgBatch = labeled.get("org batch name");
  const preferredNickname = labeled.get("preferred nickname");
  if (fullName && orgBatch && preferredNickname) {
    return buildParsed(fullName, orgBatch, preferredNickname, "labeled");
  }

  const lines = content
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:(?:[-*•])|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
  if (lines.length === 3 && lines[0] && lines[1] && lines[2]) {
    return buildParsed(lines[0], lines[1], lines[2], "three-line");
  }

  const conversational = content.match(
    /\b(?:i['’]?m|i am)\s+(.+?)\s+from\s+(.+?)\s+batch[.!]?\s+(?:you can call me|call me)\s+(.+?)\s*$/i,
  );
  if (conversational?.[1] && conversational[2] && conversational[3]) {
    return buildParsed(conversational[1], conversational[2], conversational[3], "conversational");
  }

  return null;
}

export function isAuthorizedReviewer(
  memberRoleIds: ReadonlySet<string>,
  authorizedRoleIds: ReadonlySet<string>,
): boolean {
  return [...memberRoleIds].some((roleId) => authorizedRoleIds.has(roleId));
}

export async function applyVerificationMutation(
  member: VerificationMemberMutationAdapter,
  mutation: VerificationMutation,
): Promise<() => Promise<void>> {
  const originalNickname = member.currentNickname();
  const relevantRoleIds = [...new Set([...mutation.accessRoleIds, mutation.unverifiedRoleId])];
  const originalRoleIds = member.currentRoleIds();
  const restore = async () => {
    await member.setNickname(originalNickname);
    for (const roleId of relevantRoleIds) {
      const originallyAssigned = originalRoleIds.has(roleId);
      const currentlyAssigned = member.currentRoleIds().has(roleId);
      if (originallyAssigned && !currentlyAssigned) {
        await member.addRole(roleId);
      } else if (!originallyAssigned && currentlyAssigned) {
        await member.removeRole(roleId);
      }
    }
  };

  try {
    await member.setNickname(mutation.nickname);
    if (!member.currentRoleIds().has(mutation.selectedRoleId)) {
      await member.addRole(mutation.selectedRoleId);
    }
    for (const roleId of relevantRoleIds) {
      if (roleId !== mutation.selectedRoleId && member.currentRoleIds().has(roleId)) {
        await member.removeRole(roleId);
      }
    }
    return restore;
  } catch (error) {
    await restore().catch(() => undefined);
    throw error;
  }
}
