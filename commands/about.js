// commands/about.js

import settings from '../settings.js';

export const name = 'about';
export const description = 'Show information about BUGS-BOT';
export const category = 'General';

export async function execute(sock, msg) {
  const chatId = msg.key.remoteJid;

  const caption = `
┏━━━━━━━🔥 *BUGS-BOT* 🔥━━━━━━━┓
┃ 🤖 *Name:* BUGS-BOT
┃ 🧠 *Version:* ${settings.version || '1.0.0'}
┃ 👑 *Author:* BUGS-BOT Dev
┃ 🌍 *GitHub:* github.com/morel22/BUGSbot
┃ 💬 *Prefix:* ${settings.prefix || '.'}
┃ 📦 *Built With:* Baileys + OpenAI
┃ 📞 *Contact:* wa.me/237653871607
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

✨ *Features:*
• AI Chat (.chat, .ask, .img)
• Group Tools (.tagall, .kick, .ban)
• Owner Tools (.shutdown, .mode, .restart)
• Image Menu UI + Fast Responses

📌 Use *${settings.prefix || '.'}menu* to view all commands.
`;

  await sock.sendMessage(chatId, { text: caption });
}
