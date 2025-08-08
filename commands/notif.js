// commands/notif.js
import fs from 'fs';
import path from 'path';

export const name = 'notif';
export const description = 'Toggle group join/leave notifications (admins only)';
export const usage = '.notif';
export const category = 'Group';

const dbPath = path.join('./data', 'database.json');

function saveDatabase(database) {
  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
}

export async function execute(sock, msg, args, context) {
  const { isGroup, sendReply, senderJid } = context;
  if (!isGroup) return sendReply('❌ This command can only be used in groups.');

  // Load database
  let database = {};
  try {
    database = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  } catch {
    database = { notifications: {} };
  }

  // Check if sender is group admin
  let metadata;
  try {
    metadata = await sock.groupMetadata(msg.key.remoteJid);
  } catch {
    return sendReply('❌ Failed to fetch group metadata.');
  }

  const participant = metadata.participants.find(p => p.id === senderJid);
  if (!participant || !['admin', 'superadmin'].includes(participant.admin)) {
    return sendReply('❌ Only group admins can toggle notifications.');
  }

  if (!database.notifications) database.notifications = {};

  // Toggle notification state for this group
  const currentState = database.notifications[msg.key.remoteJid] || false;
  const newState = !currentState;
  database.notifications[msg.key.remoteJid] = newState;

  saveDatabase(database);

  const stateText = newState ? 'enabled' : 'disabled';

  await sendReply(`✅ Group join/leave notifications are now *${stateText}*.`);
}
