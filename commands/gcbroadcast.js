export const name = 'gcbroadcast';
export const description = 'Send a message privately to all group members (admins only)';
export const usage = '.gcbroadcast <message>';
export const category = 'Admin';

export async function execute(sock, msg, args, context) {
  const { isGroup, senderJid, replyJid, sendReply } = context;

  if (!isGroup) {
    await sendReply(replyJid, '❌ This command can only be used inside a group.');
    return;
  }

  if (!args.length) {
    await sendReply(replyJid, '❌ Please provide a message to broadcast.');
    return;
  }

  // Get group metadata and admins
  const metadata = await sock.groupMetadata(replyJid);
  const adminIds = metadata.participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id);

  if (!adminIds.includes(senderJid)) {
    await sendReply(replyJid, '❌ Only group admins can use this command.');
    return;
  }

  const broadcastMsg = args.join(' ');

  // Send private message to all participants except bot itself
  for (const participant of metadata.participants) {
    const jid = participant.id;
    try {
      if (jid !== sock.user.id) {
        await sock.sendMessage(jid, { text: `📢 *Group Broadcast*\n\n${broadcastMsg}` });
        await new Promise(r => setTimeout(r, 500));
      }
    } catch (err) {
      console.error(`Failed to send broadcast to ${jid}:`, err);
    }
  }

  await sendReply(replyJid, '✅ Broadcast message sent to all group members.');
}
