export const name = 'welcome';

// In-memory map to track welcome status per group
const welcomeStatus = new Map();

export async function execute(sock, msg, args) {
  const isGroup = msg.key.remoteJid.endsWith('@g.us');
  if (!isGroup) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: '❌ This command can only be used in groups.'
    }, { quoted: msg });
  }

  // Check if user is admin
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  const participant = msg.key.participant || msg.participant;
  const isAdmin = metadata.participants.some(p => p.id === participant && (p.admin === 'admin' || p.admin === 'superadmin'));

  if (!isAdmin) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: '❌ Only group admins can toggle the welcome message.'
    }, { quoted: msg });
  }

  const arg = args[0]?.toLowerCase();
  if (arg !== 'on' && arg !== 'off') {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: '⚠️ Usage: .welcome on  OR  .welcome off'
    }, { quoted: msg });
  }

  welcomeStatus.set(msg.key.remoteJid, arg === 'on');

  await sock.sendMessage(msg.key.remoteJid, {
    text: `✅ Welcome messages are now *${arg.toUpperCase()}* for this group!`
  }, { quoted: msg });
}

// Export the map to use elsewhere (like event listeners)
export function isWelcomeEnabled(groupId) {
  return welcomeStatus.get(groupId) || false;
}
