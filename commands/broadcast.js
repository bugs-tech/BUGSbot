// commands/broadcast.js

export const name = 'broadcast';
export const description = 'Broadcast a message to all chats (owner only)';
export const category = 'Owner';

import fs from 'fs';

export async function execute(sock, msg, args, context) {
  const { isBotOwner, sendReply } = context;

  // Helper to reply directly to user's command message
  const reply = async (text) => {
    return sendReply(msg.key.remoteJid, text, { quoted: msg });
  };

  if (!isBotOwner) {
    return reply('🚫 You are not authorized to use this command.');
  }

  if (args.length === 0) {
    return reply('⚠️ Please provide a message to broadcast.\nUsage: .broadcast Your message here');
  }

  const messageText = args.join(' ');

  try {
    let chatIds = [];
    if (fs.existsSync('./data/chats.json')) {
      const data = JSON.parse(fs.readFileSync('./data/chats.json'));
      if (Array.isArray(data)) {
        chatIds = data;
      }
    } else {
      return reply('⚠️ No chat list found to broadcast.');
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

    return reply(
      `📢 Broadcast completed.\n` +
      `✅ Sent to: ${successCount} chats\n` +
      `❌ Failed: ${failCount} chats`
    );

  } catch (err) {
    console.error('❌ Broadcast error:', err);
    return reply(`❌ Failed to broadcast message.\nReason: ${err.message}`);
  }
}
