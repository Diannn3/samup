const fs = require("fs");
const path = require("path");

const yamlPath = path.join(__dirname, "config", "server.yaml");
let content = fs.readFileSync(yamlPath, "utf8");

// 1. Define the thread denials block
const oldEveryoneDeny = `      - subject: everyone
        deny:
          - SendMessages`;

const newEveryoneDeny = `      - subject: everyone
        deny:
          - SendMessages
          - CreatePublicThreads
          - CreatePrivateThreads
          - SendMessagesInThreads`;

const oldEveryoneDenyViewSend = `      - subject: everyone
        deny:
          - ViewChannel
          - SendMessages`;

const newEveryoneDenyViewSend = `      - subject: everyone
        deny:
          - ViewChannel
          - SendMessages
          - CreatePublicThreads
          - CreatePrivateThreads
          - SendMessagesInThreads`;

// Let's replace specifically for our static channels:
// For START HERE channels (where deny is just SendMessages):
const startHereChannels = [
  "key: verification",
  "key: server-guidelines",
  "key: welcome-to-sam-up",
  "key: roles-and-membership",
  "key: channel-directory"
];

for (const chKey of startHereChannels) {
  const chIndex = content.indexOf(chKey);
  if (chIndex !== -1) {
    const nextPermsIndex = content.indexOf("permissions:", chIndex);
    const nextDenyIndex = content.indexOf("deny:\n          - SendMessages", nextPermsIndex);
    if (nextDenyIndex !== -1 && nextDenyIndex - chIndex < 400) {
      // Replace just this instance
      const before = content.slice(0, nextDenyIndex);
      const after = content.slice(nextDenyIndex + "deny:\n          - SendMessages".length);
      content = before + "deny:\n          - SendMessages\n          - CreatePublicThreads\n          - CreatePrivateThreads\n          - SendMessagesInThreads" + after;
    }
  }
}

// For OFFICIAL and ACADEMIC static channels (announcements, events-and-calendar, opportunities, members-announcements, resources):
const officialStaticChannels = [
  "key: announcements",
  "key: events-and-calendar",
  "key: opportunities",
  "key: members-announcements",
  "key: resources"
];

for (const chKey of officialStaticChannels) {
  const chIndex = content.indexOf(chKey);
  if (chIndex !== -1) {
    const nextPermsIndex = content.indexOf("permissions:", chIndex);
    const nextDenyIndex = content.indexOf("deny:\n          - ViewChannel\n          - SendMessages", nextPermsIndex);
    if (nextDenyIndex !== -1 && nextDenyIndex - chIndex < 400) {
      const before = content.slice(0, nextDenyIndex);
      const after = content.slice(nextDenyIndex + "deny:\n          - ViewChannel\n          - SendMessages".length);
      content = before + "deny:\n          - ViewChannel\n          - SendMessages\n          - CreatePublicThreads\n          - CreatePrivateThreads\n          - SendMessagesInThreads" + after;
    }
  }
}

// For server-logs, add thread denials to moderator and executive deny blocks
const logsIndex = content.indexOf("key: server-logs");
if (logsIndex !== -1) {
  const modDeny = content.indexOf("deny:\n          - SendMessages", content.indexOf("subject: role:moderator", logsIndex));
  if (modDeny !== -1 && modDeny - logsIndex < 500) {
    const before = content.slice(0, modDeny);
    const after = content.slice(modDeny + "deny:\n          - SendMessages".length);
    content = before + "deny:\n          - SendMessages\n          - CreatePublicThreads\n          - CreatePrivateThreads\n          - SendMessagesInThreads" + after;
  }
  const execDeny = content.indexOf("deny:\n          - SendMessages", content.indexOf("subject: role:executive", logsIndex));
  if (execDeny !== -1 && execDeny - logsIndex < 700) {
    const before = content.slice(0, execDeny);
    const after = content.slice(execDeny + "deny:\n          - SendMessages".length);
    content = before + "deny:\n          - SendMessages\n          - CreatePublicThreads\n          - CreatePrivateThreads\n          - SendMessagesInThreads" + after;
  }
}

// 2. Add 【👋】arrivals channel under START HERE right after channel-directory
const dirIndex = content.indexOf("key: channel-directory");
if (dirIndex !== -1) {
  // find the end of channel-directory block (where next channel starts or announcements starts)
  const nextChIndex = content.indexOf("  - key: announcements", dirIndex);
  if (nextChIndex !== -1) {
    const arrivalsBlock = `  - key: arrivals
    name: 【👋】arrivals
    type: text
    categoryKey: start-here
    permissions:
      - subject: everyone
        deny:
          - SendMessages
          - CreatePublicThreads
          - CreatePrivateThreads
          - SendMessagesInThreads
      - subject: role:moderator
        allow:
          - ViewChannel
          - ManageMessages
      - subject: role:executive
        allow:
          - ViewChannel
          - ManageMessages
`;
    content = content.slice(0, nextChIndex) + arrivalsBlock + content.slice(nextChIndex);
  }
}

fs.writeFileSync(yamlPath, content, "utf8");
console.log("✅ Successfully updated server.yaml with arrivals channel and thread denials!");
