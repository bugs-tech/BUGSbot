import fs from 'fs';

/**
 * Send video from file
 * @param {object} sock - Baileys socket
 * @param {string} jid - JID
 * @param {string} filePath - Path to video file
 * @param {string} title - Title/caption
 * @param {object} m - Message object
 */
export async function sendVideo(sock, jid, filePath, title = '', m) {
  const video = fs.readFileSync(filePath);
  await sock.sendMessage(jid, {
    video,
    caption: title,
    mimetype: 'video/mp4',
  }, { quoted: m });
}
