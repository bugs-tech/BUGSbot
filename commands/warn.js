import fs from 'fs';
import path from 'path';

const warnsPath = path.join('./data', 'warns.json');

// Load warnings database or initialize empty
function loadWarns() {
  try {
    return JSON.parse(fs.readFileSync(warnsPath, 'utf-8'));
  } catch {
    return {};
  }
}

// Save warnings database
function saveWarns(warns) {
  fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));
}

export const name = 'warn';
export const description = 'Warn a group member. After 5 warnings, user will be kicked.';
export const usage = '.warn @user';
export const category = 'Admin';

export async function execute(sock, msg, args, context) {
  const { isGroup, senderJid, sendReply } = context;

  const chatId = msg.key.remoteJid;

  if (!isGroup) {
    await sendReply(chatId, '❌ This command can only be used in groups.');
    return;
  }

  // Check if sender is admin
  const metadata = await sock.groupMetadata(chatId);
  const senderIsAdmin = metadata.participants.find(p => p.id === senderJid)?.admin;
  if (!senderIsAdmin) {
    await sendReply(chatId, '❌ Only group admins can use this command.');
    return;
  }

  // Get mentioned users safely
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (!mentioned || mentioned.length === 0) {
    await sendReply(chatId, '❌ Please mention the user you want to warn.');
    return;
  }

  const warnedUser = mentioned[0];
  if (!warnedUser || typeof warnedUser !== 'string' || !warnedUser.includes('@')) {
    await sendReply(chatId, '⚠️ Invalid user mention.');
    return;
  }

  const warns = loadWarns();
  warns[warnedUser] = (warns[warnedUser] || 0) + 1;
  saveWarns(warns);

  await sendReply(chatId, `⚠️ User @${warnedUser.split('@')[0]} has been warned.\nTotal warnings: ${warns[warnedUser]}`, {
    contextInfo: { mentionedJid: [warnedUser] }
  });

  // Kick user after 5 warnings
  if (warns[warnedUser] >= 5) {
    try {
      await sock.groupParticipantsUpdate(chatId, [warnedUser], 'remove');
      await sendReply(chatId, `❌ User @${warnedUser.split('@')[0]} has been removed for reaching 5 warnings.`, {
        contextInfo: { mentionedJid: [warnedUser] }
      });
      delete warns[warnedUser];
      saveWarns(warns);
    } catch (e) {
      console.error('Kick failed:', e);
      await sendReply(chatId, '⚠️ Failed to remove the user. Make sure I have admin rights.');
    }
  }
}
