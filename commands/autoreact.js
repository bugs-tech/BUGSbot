// commands/autoreact.js

import fs from 'fs';
import path from 'path';

const dbPath = './data/database.json';

export const name = 'autoreact';

export async function execute(sock, msg, args, { isBotOwner, sendReply }) {
  if (!isBotOwner) {
    return sendReply(msg.key.remoteJid, '❌ *Only bot owners can use this command.*');
  }

  const sub = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(sub)) {
    return sendReply(msg.key.remoteJid, '⚠️ Usage: .autoreact on / off');
  }

  const database = JSON.parse(fs.readFileSync(dbPath));
  database.autoreact = sub === 'on';

  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));

  await sendReply(msg.key.remoteJid, `✅ Auto-react has been turned *${sub.toUpperCase()}*.`);
}
