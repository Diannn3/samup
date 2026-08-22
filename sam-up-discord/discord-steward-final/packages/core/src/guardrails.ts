import type { DesiredServerConfig, GuildSnapshot, PlanOperation } from "@discord-steward/shared";

export function assertSingleGuild(actualId: string, expectedId: string) {
  if (actualId !== expectedId) throw new Error(`Guild ID mismatch: expected ${expectedId}, got ${actualId}`);
}

export function assertOperationAllowed(operation: PlanOperation, desired: DesiredServerConfig, liveSnapshot: GuildSnapshot) {
  if (operation.kind !== "updateRoleColor") return;
  const role = liveSnapshot.roles.find((item) => item.id === operation.payload.roleId);
  if (!role) throw new Error(`Role ${operation.payload.roleId} no longer exists. Generate a fresh plan.`);
  if (role.id === liveSnapshot.guildId || role.name === "@everyone") throw new Error("The @everyone role color cannot be changed.");
  if (role.managed) throw new Error(`Managed role ${role.name} cannot be changed.`);
  assertRoleColorTargetAllowed(role.id, desired);
}

export function assertRoleColorTargetAllowed(roleId: string, desired: DesiredServerConfig) {
  if (
    desired.protected.roleIds.includes(roleId)
    && !desired.protected.colorEditableRoleIds.includes(roleId)
  ) {
    throw new Error(`Protected role ${roleId} is not allowlisted for a color-only update.`);
  }
}

export function validateDesiredConfig(desired: DesiredServerConfig) {
  // Config validation logic here if needed
}

export function assertPermissionCeiling(permissions: string[]) {
  if (permissions.includes("Administrator")) {
    throw new Error("Administrator permission is restricted and cannot be granted.");
  }
}
