/**
 * Send a reply message with optional footer tag
 * @param {object} sock - Baileys socket instance
 * @param {object|string} mOrJid - Message object (m) or recipient JID
 * @param {string} text - Message text
 * @param {object} extra - Additional message options
 */
export async function sendReply(sock, mOrJid, text, extra = {}) {
  const tag = '\n\n— *BUGS-BOT support tech*';
  try {
    let jid, quoted;

    if (typeof mOrJid === 'string') {
      jid = mOrJid;
    } else if (typeof mOrJid === 'object') {
      jid = mOrJid.key?.remoteJid || mOrJid.chat || mOrJid.jid;
      quoted = mOrJid;
    }

    if (typeof jid !== 'string') {
      throw new Error(`Invalid JID: ${JSON.stringify(jid)}`);
    }

    return await sock.sendMessage(jid, { text: text + tag, ...extra }, quoted ? { quoted } : {});
  } catch (err) {
    console.error('❌ sendReply() failed:', err);
  }
}
