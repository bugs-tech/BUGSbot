const botName = '🔥 BUGS-BOT 🔥';

export const name = 'tagall';
export const description = 'Tag all group members with a stylish message';
export const category = 'Group';

export async function execute(sock, msg, args, context) {
  const { isGroup, replyJid, sendReply } = context;
  const senderName = msg.pushName || 'User';

  if (!isGroup) {
    return await sendReply(replyJid, '❌ This command can only be used in groups.');
  }

  try {
    // Get group metadata
    const metadata = await sock.groupMetadata(replyJid);
    const participants = metadata.participants;

    if (!participants || participants.length === 0) {
      return await sendReply(replyJid, '⚠️ No members found in this group.');
    }

    const mentions = participants.map(p => p.id);
    const taggedText = participants.map((p, i) => {
      const username = p.id.split('@')[0]; // extract number part
      return `*${i + 1}.* @${username}`;
    }).join('\n');

    const tagAllMessage = `
╔══════════════════════╗
║      *👥 TAG ALL 👥*     ║
║       *${botName}*       
╠══════════════════════╣
║ Hello everyone! *${senderName}* just tagged all members.
║
${taggedText}
╚══════════════════════╝
`.trim();

    await sock.sendMessage(replyJid, {
      text: tagAllMessage,
      mentions
    });

  } catch (error) {
    console.error('❌ tagall command failed:', error);
    await sendReply(replyJid, `⚠️ Failed to tag all members.\nReason: ${error.message || 'Unknown error'}`);
  }
}
