const fs = require('fs'); 
const data = JSON.parse(fs.readFileSync('guild-snapshot.json', 'utf8')); 
const categories = {
  '1530416136414433451': 'start-here', 
  '1524451819647139980': 'official', 
  '1523679969836793929': 'tambayan', 
  '1525515376211922987': 'academics', 
  '1523679970285846528': 'interests', 
  '1530198274311720970': 'voice-tambayan', 
  '1530418361618399272': 'private-staff'
}; 
const emojis = {
  'gen-chat': '💬', 
  'alum-chat': '🎓', 
  'lobby': '🛋️', 
  'Alumni VC': '🎓', 
  'sports-night-members-only': '🏅', 
  'sports-night': '🏅', 
  'members-announcements': '📢', 
  'acad nights 2': '📚', 
  'bot-commands': '🤖', 
  'sports night': '🏅', 
  'acad nights': '📚', 
  'sports night (members only)': '🏅'
}; 
const channels = data.channels.filter(c => c.type !== 'GuildCategory' && !c.name.includes('【')); 
for (const c of channels) { 
  let cat = categories[c.parentId] || 'official'; 
  let em = emojis[c.name] || '📌'; 
  let type = c.type === 'GuildVoice' ? 'voice' : 'text'; 
  let key = c.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''); 
  if (type === 'voice') key += '-voice'; 
  if (key === 'bot-commands') key = 'bot-commands-old'; 
  console.log(`  - key: ${key}\n    name: "【${em}】${c.name}"\n    type: ${type}\n    categoryKey: ${cat}\n    existingId: "${c.id}"`); 
}
