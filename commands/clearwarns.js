import fs from 'fs';
import path from 'path';

const warnsPath = path.join('./data', 'warns.json');

function loadWarns() {
  try {
    return JSON.parse(fs.readFileSync(warnsPath, 'utf-8'));
  } catch {
    return {};
  }
}

function saveWarns(warns) {
  fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));
}

export const name = 'clearwarns';
export const description = 'Clear warnings of a user';
export const usage = '.clearwarns @user';
export const category = 'Admin';

export async function execute(sock, msg, args, context) {
  const { isGroup, senderJid, mentionedJid, sendReply } = context;

  if (!isGroup) {
    return await sendReply(msg.key.remoteJid, '❌ This command can only be used in groups.');
  }

  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  const senderIsAdmin = metadata.participants.find(p => p.id === senderJid)?.admin;

  if (!senderIsAdmin) {
    return await sendReply(msg.key.remoteJid, '❌ Only admins can clear warnings.');
  }

  if (!mentionedJid || mentionedJid.length === 0) {
    return await sendReply(msg.key.remoteJid, '❌ Please mention a user to clear their warnings.');
  }

  const target = mentionedJid[0];
  const warns = loadWarns();

  if (warns[target]) {
    delete warns[target];
    saveWarns(warns);

    const username = target.split('@')[0];
    await sendReply(msg.key.remoteJid, `✅ Cleared all warnings for @${username}.`, {
      contextInfo: { mentionedJid: [target] }
    });
  } else {
    await sendReply(msg.key.remoteJid, `ℹ️ User @${target.split('@')[0]} has no warnings.`, {
      contextInfo: { mentionedJid: [target] }
    });
  }
}
