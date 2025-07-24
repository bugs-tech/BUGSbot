// commands/broadcast.js

export const name = 'broadcast';
export const description = 'Broadcast a message to all chats (owner only)';
export const category = 'Owner';

import fs from 'fs';

export async function execute(sock, msg, args, context) {
  const { senderJid, isBotOwner, sendReply } = context;

  if (!isBotOwner) {
    return sendReply(senderJid, '🚫 You are not authorized to use this command.');
  }

  if (args.length === 0) {
    return sendReply(senderJid, '⚠️ Please provide a message to broadcast.\nUsage: .broadcast Your message here');
  }

  const messageText = args.join(' ');

  try {
    // Load all chat IDs from the session folder or your chat storage
    // Here, we simulate loading chats from a file or a method:
    // You need to adjust this according to your implementation

    // Example: Assuming you save chat IDs in 'data/chats.json'
    let chatIds = [];
    if (fs.existsSync('./data/chats.json')) {
      const data = JSON.parse(fs.readFileSync('./data/chats.json'));
      if (Array.isArray(data)) {
        chatIds = data;
      }
    } else {
      return sendReply(senderJid, '⚠️ No chat list found to broadcast.');
    }

    let successCount = 0;
    let failCount = 0;

    for (const chatId of chatIds) {
      try {
        await sock.sendMessage(chatId, { text: messageText });
        successCount++;
      } catch {
        failCount++;
      }
    }

    return sendReply(senderJid,
      `📢 Broadcast completed.\n` +
      `Sent to: ${successCount} chats\n` +
      `Failed: ${failCount} chats`
    );

  } catch (err) {
    console.error('❌ Broadcast error:', err);
    return sendReply(senderJid, `❌ Failed to broadcast message.\nReason: ${err.message}`);
  }
}
