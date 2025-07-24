// lib/sendReply.js

/**
 * Send a reply message with optional footer tag
 * @param {object} sock - Baileys socket instance
 * @param {string} jid - Recipient JID
 * @param {string} text - Message text
 * @param {object} extra - Additional message options
 */
export async function sendReply(sock, jid, text, extra = {}) {
  const tag = '\n\n— *BUGS-BOT support tech*';
  try {
    return await sock.sendMessage(jid, { text: text + tag, ...extra });
  } catch (err) {
    console.error('❌ sendReply() failed:', err);
  }
}
