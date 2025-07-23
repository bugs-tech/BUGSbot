// commands/spam.js

export const name = 'spam';
export const description = 'Spam a message multiple times (owner only)';
export const usage = '.spam <count> <message>';
export const category = 'Owner';

export async function execute(sock, msg, args, context) {
  const { senderJid, isBotOwner } = context;

  // 🔐 Restrict command to bot owners only
  if (!isBotOwner) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: '🚫 This command is restricted to bot owners only.'
    });
    return;
  }

  const chatId = msg.key.remoteJid;

  // 🔢 Check if the user provided count and message
  if (args.length < 2) {
    await sock.sendMessage(chatId, {
      text: '❌ Usage: .spam <count> <message>\nExample: .spam 3 Hello!'
    });
    return;
  }

  // 🔁 Parse the repeat count and message
  const count = parseInt(args[0]);
  const spamMessage = args.slice(1).join(' ');

  const maxCount = 30; // 🔒 Limit to prevent abuse

  // 🚫 Validate input count
  if (isNaN(count) || count < 1 || count > maxCount) {
    await sock.sendMessage(chatId, {
      text: `❌ Please provide a number between 1 and ${maxCount}.`
    });
    return;
  }

  // 📨 Send the message multiple times
  for (let i = 0; i < count; i++) {
    await sock.sendMessage(chatId, { text: spamMessage });
  }
}
