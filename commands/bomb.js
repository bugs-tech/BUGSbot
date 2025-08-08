// commands/bomb.js
export const name = 'bomb';
export const description = 'Send message spam to lag or overwhelm user (owner only)';
export const category = 'Owner';

export async function execute(sock, msg, args, context) {
  const { senderJid, isBotOwner, sendReply, mentionedJid } = context;

  const where = msg.key.remoteJid;

  if (!isBotOwner) return sendReply(where, '🚫 Owner only.');

  const target = mentionedJid?.[0];
  if (!target) return sendReply(where, '⚠️ Mention a user to bomb.\n\nUsage: .bomb @user');

  const count = 50; // Number of messages to send
  const delay = 50; // Delay between messages (ms)

  await sendReply(where, `💣 Launching message bomb on @${target.split('@')[0]}...`, {
    mentions: [target]
  });

  for (let i = 1; i < count; i++) {
    await sock.sendMessage(target, { text: `💥 Bomb ${i + 1}` });
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  return sendReply(where, '✅ Bombing complete.');
}
