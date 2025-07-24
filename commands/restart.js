// commands/restart.js

export const name = 'restart';
export const description = 'Restart the bot (owner only)';
export const usage = '.restart';

export async function execute(sock, msg, args, { isBotOwner, replyJid, sendReply }) {
  if (!isBotOwner) return sendReply(replyJid, '🚫 Only bot owners can restart the bot.');

  await sendReply(replyJid, '♻️ Restarting the bot...');

  // Give time for message to send
  setTimeout(() => {
    process.exit(0); // PM2 will restart the process
  }, 1000);
}
