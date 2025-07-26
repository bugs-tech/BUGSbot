// commands/autotyping.js
export const command = 'autotyping';
export const description = 'Toggle auto typing on/off (Group Admins only)';

export const execute = async (sock, msg, args, { sendReply, isGroup, isBotOwner, senderJid }) => {
  if (!isGroup) return sendReply('❌ This command can only be used in groups.');

  // Fetch group metadata to check admin status
  let metadata;
  try {
    metadata = await sock.groupMetadata(msg.key.remoteJid);
  } catch {
    return sendReply('❌ Failed to fetch group metadata.');
  }

  // Check if sender is admin or bot owner
  const participant = metadata.participants.find(p => p.id === senderJid);
  const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';

  if (!isAdmin && !isBotOwner) {
    return sendReply('🚫 Only group admins or the bot owner can toggle auto typing.');
  }

  const input = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(input)) {
    return sendReply('⚙️ Usage: *.autotyping on* or *.autotyping off*');
  }

  // Here you need your global settings store or database to save the toggle state
  // For example:
  global.autotypingEnabled = input === 'on';

  sendReply(`✅ Auto-typing is now *${input.toUpperCase()}*`);
};
