// commands/gcbroadcast.js

import { isGroupBroadcastEnabled } from '../commands/broadcastgroup.js';

export const name = 'gcbroadcast';
export const description = 'Broadcast a message to all groups (admin only)';
export const type = 'admin';

export async function execute(sock, msg, args, context) {
  const { isGroup, senderJid, replyJid, sendReply } = context;

  if (!isGroup) {
    return sendReply(replyJid, '❌ This command can only be used in a group.');
  }

  if (!isGroupBroadcastEnabled()) {
    return sendReply(replyJid, '❌ Group broadcast is currently disabled.\nUse *groupbroadcast on* to enable it.');
  }

  const metadata = await sock.groupMetadata(replyJid);
  const senderIsAdmin = metadata.participants?.find(p =>
    p.id === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
  );

  if (!senderIsAdmin) {
    return sendReply(replyJid, '🚫 Only group admins can use this command.');
  }

  const message = args.join(' ');
  if (!message) {
    return sendReply(replyJid, '📝 Please provide a message to broadcast.\nExample: *.gcbroadcast Hello everyone!*');
  }

  const groups = await sock.groupFetchAllParticipating();
  const groupIds = Object.keys(groups);

  let count = 0;
  for (const groupId of groupIds) {
    try {
      await sock.sendMessage(groupId, { text: `📢 *Broadcast:*\n\n${message}` });
      count++;
    } catch (err) {
      console.error(`❌ Failed to send to group ${groupId}:`, err);
    }
  }

  return sendReply(replyJid, `✅ Broadcast sent to ${count} group(s).`);
}
