// commands/addowner.js
import settings from '../settings.js';
import fs from 'fs';

export const name = 'addowner';
export const description = 'Add a new owner to the bot.';
export const execute = async (sock, msg, args, context) => {
  const { isBotOwner, sendReply } = context;

  if (!isBotOwner) {
    return sendReply(context.replyJid, '🚫 This command is restricted to bot owners only.');
  }

  const newOwner = args[0]?.replace(/\D/g, '');
  if (!newOwner) {
    return sendReply(context.replyJid, '❗ Please provide a phone number.\n\nUsage: .addowner 237XXXXXXXXX');
  }

  if (settings.botOwnerNumbers.includes(newOwner)) {
    return sendReply(context.replyJid, `ℹ️ ${newOwner} is already an owner.`);
  }

  settings.botOwnerNumbers.push(newOwner);
  fs.writeFileSync('./settings.js', `export default ${JSON.stringify(settings, null, 2)};\n`);

  return sendReply(context.replyJid, `✅ ${newOwner} has been added as a bot owner.`);
};
