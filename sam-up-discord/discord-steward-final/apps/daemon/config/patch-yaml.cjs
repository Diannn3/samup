const fs = require('fs');
const yaml = require('yaml');

const doc = yaml.parse(fs.readFileSync('server.yaml', 'utf8'));

// 3. Add Unverified role if missing
if (!doc.roles.find(r => r.key === 'unverified')) {
  doc.roles.push({
    key: 'unverified',
    name: 'Unverified',
    color: '#95a5a6',
    hoist: false,
    mentionable: false,
    permissions: [],
    existingId: '1525514911646617811'
  });
}

// Ensure applicant is hoisted
const applicantRole = doc.roles.find(r => r.key === 'applicant');
if (applicantRole) applicantRole.hoist = true;

// Channel edits
const channels = doc.channels;

// 4. Delete bot-commands-old
const idxBotOld = channels.findIndex(c => c.key === 'bot-commands-old');
if (idxBotOld !== -1) channels.splice(idxBotOld, 1);

// 7. Delete redundant sports nights
const toDelete = ['sports-night-members-only', 'sports-night-members-only-voice'];
for (const key of toDelete) {
  const idx = channels.findIndex(c => c.key === key);
  if (idx !== -1) channels.splice(idx, 1);
}

// Process remaining channels
for (const c of channels) {
  // 1. Lock down START HERE channels
  if (c.categoryKey === 'start-here' && c.key !== 'verification' && c.key !== 'ticket-0020') {
    c.permissions = c.permissions || [];
    if (!c.permissions.find(p => p.subject === 'everyone' && p.deny?.includes('SendMessages'))) {
      c.permissions.push({
        subject: 'everyone',
        deny: ['SendMessages']
      });
    }
  }

  // 2. Hide everything else from Unverified, only allow Member/Alumni/Applicant
  const protectedCategories = ['official', 'tambayan', 'academics', 'interests', 'voice-tambayan'];
  if (protectedCategories.includes(c.categoryKey)) {
    c.permissions = c.permissions || [];
    // Deny ViewChannel for everyone
    const evPerm = c.permissions.find(p => p.subject === 'everyone');
    if (evPerm) {
      evPerm.deny = [...new Set([...(evPerm.deny || []), 'ViewChannel'])];
    } else {
      c.permissions.push({ subject: 'everyone', deny: ['ViewChannel'] });
    }
    // Allow ViewChannel for verified roles
    for (const r of ['member', 'alumni', 'applicant']) {
      const rPerm = c.permissions.find(p => p.subject === r);
      if (rPerm) {
        rPerm.allow = [...new Set([...(rPerm.allow || []), 'ViewChannel'])];
      } else {
        c.permissions.push({ subject: r, allow: ['ViewChannel'] });
      }
    }
  }

  // 5. Move members-announcements to official
  if (c.key === 'members-announcements') {
    c.categoryKey = 'official';
  }

  // 6. Move alum-chat and alumni-vc-voice to tambayan
  if (c.key === 'alum-chat' || c.key === 'alumni-vc-voice') {
    c.categoryKey = 'tambayan'; // wait, alumni-vc-voice should be voice-tambayan
    if (c.type === 'voice' || c.type === 'stage') {
      c.categoryKey = 'voice-tambayan';
    }
  }

  // Consolidate Sports Night
  if (c.key === 'sports-night') {
    c.categoryKey = 'tambayan';
  }
  if (c.key === 'sports-night-voice') {
    c.categoryKey = 'voice-tambayan';
  }

  // 8. Naming Consistency (Voice = Title Case)
  if (c.key === 'lobby-voice') c.name = '【🛋️】Lobby';
  if (c.key === 'acad-nights-2-voice') c.name = '【📚】Acad Nights 2';
  if (c.key === 'sports-night-voice') c.name = '【🏅】Sports Night';
  if (c.key === 'acad-nights-voice') c.name = '【📚】Acad Nights';
  if (c.key === 'acad-nights-stage') c.name = '【🎙️】Acad Nights (Tambay Only)';
}

fs.writeFileSync('server.yaml', yaml.stringify(doc), 'utf8');
console.log('Patched server.yaml!');
