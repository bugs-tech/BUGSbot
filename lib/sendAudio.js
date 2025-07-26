import fs from 'fs';

/**
 * Send audio from file
 * @param {object} sock - Baileys socket
 * @param {string} jid - Recipient JID
 * @param {string} filePath - Path to audio file
 * @param {string} title - Optional title for caption
 * @param {object} m - Original message object
 */
export async function sendAudio(sock, jid, filePath, title = '', m) {
  const audio = fs.readFileSync(filePath);
  await sock.sendMessage(jid, {
    audio,
    mimetype: 'audio/mp4',
    ptt: false,
    fileName: title,
  }, { quoted: m });
}
