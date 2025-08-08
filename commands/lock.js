const { getGroupAdmins } = await import('../lib/utils.js');

export const name = 'lock';
export const description = 'Lock group so only admins can send messages';
export const category = 'group';

export async function execute(sock, msg, args, { isGroup, sendReply }) {
  if (!isGroup) {
    return sendReply('🚫 This command only works in *groups*.');
  }

  try {
    const groupId = msg.key.remoteJid;
    const senderId = msg.key.participant || msg.key.remoteJid;

    const metadata = await sock.groupMetadata(groupId);
    const admins = getGroupAdmins(metadata.participants);

    // Check admin status
    const isAdmin = admins.includes(senderId) || admins.includes(senderId.replace(/:.*$/, '') + '@s.whatsapp.net');

    if (!isAdmin) {
      return sendReply('❌ Only *group admins* can use this command.');
    }

    await sock.groupSettingUpdate(groupId, 'announcement');
    await sendReply('🔒 Group has been *locked*. Only admins can send messages.');
  } catch (e) {
    console.error('❌ Group lock error:', e);
    await sendReply('❌ Failed to lock the group.');
  }
}
