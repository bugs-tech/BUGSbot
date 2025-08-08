// commands/owner.js

import settings from '../settings.js';

export const name = 'owner';
export const description = 'Show the owner of BUGS-BOT';
export const category = 'General';

export async function execute(sock, msg) {
  const chatId = msg.key.remoteJid;

  const ownerNumbers = settings.botOwnerNumbers || [];
  const contactList = ownerNumbers
    .map((num, index) => `╰➤ *${index + 1}.* wa.me/${num}`)
    .join('\n');

  const caption = `
┏━━━👑 *BOT OWNER INFO* 👑━━━┓
┃ 🔥 *Bot Name:* BUGS-BOT
┃ 📞 *Contact(s):*
${contactList}
┃ 🌐 *GitHub:* github.com/bugs-tech/BUGSbot
┗━━━━━━━━━━━━━━━━━━━━━━┛

💡 *Use this command to contact the bot author directly.*
`;

  await sock.sendMessage(chatId, { text: caption });
}
