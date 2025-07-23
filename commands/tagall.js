// commands/tagall.js

const botName = '🔥 BUGS-BOT 🔥';

export const name = 'tagall';
export const description = 'Tag all group members with a stylish message';
export const category = 'Group';

export async function execute(sock, msg, args, context) {
  const isGroup = msg.key.remoteJid.endsWith('@g.us');
  const chatId = msg.key.remoteJid;
  const senderName = msg.pushName || 'User';

  if (!isGroup) {
    await sock.sendMessage(chatId, {
      text: '❌ This command can only be used in groups.'
    });
    return;
  }

  try {
    // Fetch group metadata to get members
    const metadata = await sock.groupMetadata(chatId);
    const participants = metadata.participants;

    if (!participants || participants.length === 0) {
      await sock.sendMessage(chatId, {
        text: '⚠️ No members found in this group.'
      });
      return;
    }

    // Format each member's name with stars and bold
    const taggedUsersText = participants
      .map(p => `★ *${p.id.includes('@') ? (p.pushName || p.id.split('@')[0]) : p.id}* ★`)
      .join('\n');

    // Construct the full tagall message with box styling and bot name branding
    const tagAllMessage = `
╔══════════════════════╗
║      *👥 TAG ALL 👥*     ║
║       *${botName}*       
╠══════════════════════╣
║ Hello everyone! *${senderName}* just tagged all members.
║
║ ➤ Here are the users tagged:
${taggedUsersText}
╚══════════════════════╝
`.trim();

    // Send the message with mentions to notify users
    await sock.sendMessage(chatId, {
      text: tagAllMessage,
      mentions: participants.map(p => p.id)
    });

  } catch (error) {
    console.error('❌ tagall command failed:', error);
    await sock.sendMessage(chatId, {
      text: `⚠️ Failed to tag all members.\nReason: ${error.message || 'Unknown error'}`
    });
  }
}
