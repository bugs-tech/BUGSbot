// commands/tagall.js

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
    // Fetch group metadata to get participants
    const metadata = await sock.groupMetadata(replyJid);
    const participants = metadata.participants;

    if (!participants || participants.length === 0) {
      return await sendReply(replyJid, '⚠️ No members found in this group.');
    }

    // Map participant names with formatting
    const taggedUsersText = participants
      .map((p, i) => {
        const name = p?.name || p?.notify || p?.id?.split('@')[0];
        return `*${i + 1}.* ${name}`;
      })
      .join('\n');

    const tagAllMessage = `
╔══════════════════════╗
║      *👥 TAG ALL 👥*     ║
║       *${botName}*       
╠══════════════════════╣
║ Hello everyone! *${senderName}* just tagged all members.
║
${taggedUsersText}
╚══════════════════════╝
`.trim();

    // Send with mentions
    await sock.sendMessage(replyJid, {
      text: tagAllMessage,
      mentions: participants.map(p => p.id)
    });

  } catch (error) {
    console.error('❌ tagall command failed:', error);
    await sendReply(replyJid, `⚠️ Failed to tag all members.\nReason: ${error.message || 'Unknown error'}`);
  }
}
