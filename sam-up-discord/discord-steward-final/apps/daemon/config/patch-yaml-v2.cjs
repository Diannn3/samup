const fs = require('fs');
const yaml = require('yaml');

const doc = yaml.parse(fs.readFileSync('server.yaml', 'utf8'));

for (const c of doc.channels) {
  // 1. Announcements
  if (c.key === 'announcements' || c.key === 'members-announcements') {
    c.permissions = c.permissions || [];
    const evPerm = c.permissions.find(p => p.subject === 'everyone');
    if (evPerm) {
      evPerm.deny = [...new Set([...(evPerm.deny || []), 'SendMessages'])];
    } else {
      c.permissions.push({ subject: 'everyone', deny: ['SendMessages'] });
    }
  }

  // 2. Staff Channels
  const staffChannels = ['moderator-chat', 'verification-support', 'server-logs'];
  if (staffChannels.includes(c.key)) {
    c.permissions = c.permissions || [];
    for (const r of ['role:moderator', 'role:executive']) {
      const rPerm = c.permissions.find(p => p.subject === r);
      if (rPerm) {
        rPerm.allow = [...new Set([...(rPerm.allow || []), 'ViewChannel'])];
      } else {
        c.permissions.push({ subject: r, allow: ['ViewChannel'] });
      }
    }
  }

  // 3. Members-only Announcements
  if (c.key === 'members-announcements') {
    if (c.permissions) {
      const idx = c.permissions.findIndex(p => p.subject === 'role:applicant');
      if (idx !== -1) {
        c.permissions.splice(idx, 1);
      }
    }
  }
}

fs.writeFileSync('server.yaml', yaml.stringify(doc), 'utf8');
console.log('Applied v2 fixes to server.yaml!');
