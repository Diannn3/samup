const fs = require('fs');
const yaml = require('yaml');

const doc = yaml.parse(fs.readFileSync('server.yaml', 'utf8'));

for (const c of doc.channels) {
  if (c.permissions) {
    for (const p of c.permissions) {
      if (p.subject === 'member') p.subject = 'role:member';
      if (p.subject === 'alumni') p.subject = 'role:alumni';
      if (p.subject === 'applicant') p.subject = 'role:applicant';
    }
  }
}

fs.writeFileSync('server.yaml', yaml.stringify(doc), 'utf8');
console.log('Fixed subjects in server.yaml!');
