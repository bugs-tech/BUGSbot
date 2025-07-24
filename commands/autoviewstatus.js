// commands/autoviewstatus.js

import fs from 'fs';

const configPath = './data/autoviewstatus.json';

function isEnabled() {
  if (!fs.existsSync(configPath)) return false;
  const data = JSON.parse(fs.readFileSync(configPath));
  return data.enabled === true;
}

function setStatus(enabled) {
  const data = { enabled };
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

export const name = 'autoviewstatus';
export const description = 'Toggle auto view status ON or OFF';
export const category = 'Owner';

export async function execute(sock, msg, args, { isBotOwner, sendReply }) {
  if (!isBotOwner) {
    return await sendReply(msg.key.remoteJid, '❌ This command is for bot owners only.');
  }

  const arg = args[0]?.toLowerCase();
  if (!arg || !['on', 'off'].includes(arg)) {
    const current = isEnabled() ? '✅ ON' : '❌ OFF';
    return await sendReply(msg.key.remoteJid, `📌 *Current status:* ${current}\n\nUse \`.autoviewstatus on\` or \`.autoviewstatus off\` to toggle.`);
  }

  const turnOn = arg === 'on';
  setStatus(turnOn);

  const statusText = turnOn ? '✅ Auto view status is now *ON*.' : '❌ Auto view status is now *OFF*.';
  return await sendReply(msg.key.remoteJid, statusText);
}

export function isAutoViewStatusEnabled() {
  return isEnabled();
}
