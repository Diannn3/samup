const fs = require('fs');
const yaml = require('yaml');

const doc = yaml.parse(fs.readFileSync('server.yaml', 'utf8'));

for (const c of doc.channels) {
  // 1. OFFICIAL Spam Loophole
  if (c.key === 'events-and-calendar' || c.key === 'opportunities') {
    c.permissions = c.permissions || [];
    const evPerm = c.permissions.find(p => p.subject === 'everyone');
    if (evPerm) {
      evPerm.deny = [...new Set([...(evPerm.deny || []), 'SendMessages'])];
    } else {
      c.permissions.push({ subject: 'everyone', deny: ['SendMessages'] });
    }
  }

  // 2. Applicants in Alumni Spaces
  if (c.key === 'alum-chat' || c.key === 'alumni-vc-voice') {
    if (c.permissions) {
      const idx = c.permissions.findIndex(p => p.subject === 'role:applicant');
      if (idx !== -1) {
        c.permissions.splice(idx, 1);
      }
    }
  }

  // 3. Verification Channel Clutter Risk
  if (c.key === 'verification') {
    c.permissions = c.permissions || [];
    const evPerm = c.permissions.find(p => p.subject === 'everyone');
    if (evPerm) {
      evPerm.deny = [...new Set([...(evPerm.deny || []), 'SendMessages'])];
    } else {
      c.permissions.push({ subject: 'everyone', deny: ['SendMessages'] });
    }
  }
}

fs.writeFileSync('server.yaml', yaml.stringify(doc), 'utf8');
console.log('Applied v3 fixes to server.yaml!');
