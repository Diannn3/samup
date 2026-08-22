const fs = require('fs');
const yaml = require('yaml');

const file = fs.readFileSync('server.yaml', 'utf8');
const data = yaml.parse(file);
const map = {};
for (const ch of data.channels) {
  if (ch.existingId) map[ch.key] = ch.existingId;
}
console.log(JSON.stringify(map, null, 2));
