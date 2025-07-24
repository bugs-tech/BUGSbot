// commands/removeowner.js
import settings from '../settings.js';
import fs from 'fs';

export const name = 'removeowner';
export const description = 'Remove an owner from the bot.';
export const execute = async (sock, msg, args, context) => {
  const { isBotOwner, sendReply } = context;

  if (!isBotOwner) {
    return sendReply(context.replyJid, '🚫 This command is restricted to bot owners only.');
  }

  const numberToRemove = args[0]?.replace(/\D/g, '');
  if (!numberToRemove) {
    return sendReply(context.replyJid, '❗ Please provide a phone number.\n\nUsage: .removeowner 237XXXXXXXXX');
  }

  const index = settings.botOwnerNumbers.findIndex(num => num.endsWith(numberToRemove));
  if (index === -1) {
    return sendReply(context.replyJid, `⚠️ ${numberToRemove} is not in the owner list.`);
  }

  settings.botOwnerNumbers.splice(index, 1);
  fs.writeFileSync('./settings.js', `export default ${JSON.stringify(settings, null, 2)};\n`);

  return sendReply(context.replyJid, `✅ ${numberToRemove} has been removed from bot owners.`);
};
