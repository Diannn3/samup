const fs = require('fs');
const yaml = require('yaml');

const doc = yaml.parse(fs.readFileSync('server.yaml', 'utf8'));

// 1. Add existingIds to roles
for (const r of doc.roles) {
  if (r.key === 'moderator') r.existingId = "1530427891714621562";
  if (r.key === 'applicant') r.existingId = "1530427893489074266";
}

// 2. Add existingIds to channels missing them
for (const c of doc.channels) {
  if (c.key === 'acad-nights-stage') {
    c.existingId = "1530445523863998525";
  }
}

// 3. Add unmanaged members-only channels if not present
const hasMembersOnlyText = doc.channels.some(c => c.existingId === "1530199213655195698" || c.key === "sports-night-members-only");
if (!hasMembersOnlyText) {
  doc.channels.push({
    key: "sports-night-members-only",
    name: "【🏅】sports-night-members-only",
    type: "text",
    categoryKey: "interests",
    existingId: "1530199213655195698",
    permissions: [
      { subject: "everyone", deny: ["ViewChannel"] },
      { subject: "role:member", allow: ["ViewChannel"] },
      { subject: "role:alumni", allow: ["ViewChannel"] }
    ]
  });
}

const hasMembersOnlyVoice = doc.channels.some(c => c.existingId === "1530199135871963196" || c.key === "sports-night-members-only-voice");
if (!hasMembersOnlyVoice) {
  doc.channels.push({
    key: "sports-night-members-only-voice",
    name: "【🏅】sports night (members only)",
    type: "voice",
    categoryKey: "voice-tambayan",
    existingId: "1530199135871963196",
    permissions: [
      { subject: "everyone", deny: ["ViewChannel"] },
      { subject: "role:member", allow: ["ViewChannel"] },
      { subject: "role:alumni", allow: ["ViewChannel"] }
    ]
  });
}

// Helper to ensure role permission override exists and update allow/deny
function updatePerm(channel, roleSubject, allowList, denyList = []) {
  channel.permissions = channel.permissions || [];
  let perm = channel.permissions.find(p => p.subject === roleSubject);
  if (!perm) {
    perm = { subject: roleSubject };
    channel.permissions.push(perm);
  }
  if (allowList && allowList.length > 0) {
    perm.allow = [...new Set([...(perm.allow || []), ...allowList])];
  }
  if (denyList && denyList.length > 0) {
    perm.deny = [...new Set([...(perm.deny || []), ...denyList])];
  }
}

// 4. Deep Permissions Lockdown
for (const c of doc.channels) {
  // A. OFFICIAL Channels -> Give Executives ability to announce without root Admin
  if (c.categoryKey === 'official') {
    updatePerm(c, 'role:executive', ['ViewChannel', 'SendMessages', 'MentionEveryone', 'AttachFiles', 'EmbedLinks']);
  }

  // B. START HERE channels (verification & guidelines/directory) -> Give Moderator & Executive write/manage access for support
  if (c.categoryKey === 'start-here') {
    updatePerm(c, 'role:moderator', ['ViewChannel', 'SendMessages', 'ManageMessages']);
    updatePerm(c, 'role:executive', ['ViewChannel', 'SendMessages', 'ManageMessages']);
  }

  // C. SERVER LOGS -> Make read-only for Moderator & Executive to prevent chat clutter in audit trails
  if (c.key === 'server-logs') {
    updatePerm(c, 'role:moderator', ['ViewChannel'], ['SendMessages']);
    updatePerm(c, 'role:executive', ['ViewChannel'], ['SendMessages']);
  }
}

fs.writeFileSync('server.yaml', yaml.stringify(doc), 'utf8');
console.log('Successfully applied V4 Master Audit patches to server.yaml!');
