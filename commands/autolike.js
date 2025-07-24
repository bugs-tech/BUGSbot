// commands/autolike.js

export const name = 'autolike';
export const description = 'Toggle auto-like reactions to incoming messages (owner only)';
export const category = 'Owner';

let autoLikeEnabled = false; // Default off

export async function execute(sock, msg, args, context) {
  const { senderJid, isBotOwner, sendReply } = context;

  if (!isBotOwner) {
    return sendReply(senderJid, '🚫 You are not authorized to use this command.');
  }

  if (!args[0]) {
    return sendReply(senderJid, `Usage:\n.autolike on\n.autolike off`);
  }

  const action = args[0].toLowerCase();

  if (action === 'on') {
    autoLikeEnabled = true;
    return sendReply(senderJid, '✅ Auto-like reactions are now *ENABLED* for incoming messages.');
  } else if (action === 'off') {
    autoLikeEnabled = false;
    return sendReply(senderJid, '❌ Auto-like reactions are now *DISABLED* for incoming messages.');
  } else {
    return sendReply(senderJid, '⚠️ Invalid argument. Use "on" or "off".');
  }
}

// Export current state for the main event handler
export function isAutoLikeEnabled() {
  return autoLikeEnabled;
}
