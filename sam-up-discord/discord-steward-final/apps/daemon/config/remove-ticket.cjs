const fs = require('fs');
const yaml = require('yaml');

const doc = yaml.parse(fs.readFileSync('server.yaml', 'utf8'));

const channels = doc.channels;
const idxTicket = channels.findIndex(c => c.key === 'ticket-0020');
if (idxTicket !== -1) channels.splice(idxTicket, 1);

const protectedIds = doc.protected.channelIds;
const ticketId = '1530415126664970400';
const pIdx = protectedIds.indexOf(ticketId);
if (pIdx !== -1) protectedIds.splice(pIdx, 1);

fs.writeFileSync('server.yaml', yaml.stringify(doc), 'utf8');
console.log('Removed ticket-0020 from server.yaml!');
