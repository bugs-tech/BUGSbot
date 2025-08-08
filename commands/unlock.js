import { getGroupAdmins } from '../lib/utils.js';
import { sendReply } from '../lib/sendReply.js';

export const name = 'unlock';
export const description = 'Unlock the group so anyone can send messages';
export const usage = '.unlock';

export async function execute(sock, msg) {
  const { remoteJid, participant } = msg.key;

  try {
    const groupMetadata = await sock.groupMetadata(remoteJid);
    const admins = getGroupAdmins(groupMetadata.participants);

    // Check if the sender is an admin
    if (!admins.includes(participant)) {
      return sendReply(sock, msg, '❌ Only *group admins* can use this command.');
    }

    // Unlock the group
    await sock.groupSettingUpdate(remoteJid, 'not_announcement');

    return sendReply(sock, msg, '🔓 Group has been *unlocked* — everyone can send messages.');
  } catch (err) {
    console.error('unlock error:', err);
    return sendReply(sock, msg, '❌ Failed to unlock the group.');
  }
}
