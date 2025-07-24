// commands/listonline.js

export const name = 'listonline';
export const description = 'List online members in the group';
export const usage = '.listonline';

export async function execute(sock, msg, args, { isGroup, replyJid, sendReply, getName }) {
  if (!isGroup) return sendReply(replyJid, '❌ This command can only be used in groups.');

  const groupId = msg.key.remoteJid;
  const metadata = await sock.groupMetadata(groupId);
  const participants = metadata.participants;

  const onlineMembers = [];

  for (const p of participants) {
    try {
      const presence = await sock.presenceSubscribe(p.id);
      if (presence?.lastSeen || presence?.isOnline) {
        const name = await getName(p.id);
        onlineMembers.push(`- @${name || p.id.split('@')[0]}`);
      }
    } catch (e) {
      console.warn(`⚠️ Could not check presence of ${p.id}`);
    }
  }

  if (onlineMembers.length === 0) {
    return sendReply(replyJid, '📭 No online members found.');
  }

  await sendReply(replyJid, `🟢 *Online Members:*\n${onlineMembers.join('\n')}`, {
    mentions: participants.map(p => p.id),
  });
}
