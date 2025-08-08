// lib/sendReply.js

/**
 * Send a reply message with optional footer tag
 * @param {object} sock - Baileys socket instance
 * @param {string} jid - Recipient JID
 * @param {string} text - Message text
 * @param {object} extra - Additional message options
 */
export async function sendReply(sock, msg, replyText, extra = {}) {
  const tag = '\n\n— *BUGS-BOT support tech*';
  return sock.sendMessage(msg.key.remoteJid, {
    text: replyText + tag,
    ...extra
  }, {
    quoted: msg
  });
}
