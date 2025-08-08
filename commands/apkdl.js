import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'apkdl';
export const description = 'Download APK by app name using GiftedTech API';
export const usage = '.apkdl <app name>';

export async function execute(sock, msg, args) {
  const query = args.join(' ').trim();
  if (!query) return sendReply(sock, msg, '❌ Usage: .apkdl <app name>');

  try {
    const apiUrl = `https://api.giftedtech.co.ke/api/download/apkdl?apikey=gifted&appName=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);
    const result = data.result;

    if (!result || !result.name || !result.url) {
      return sendReply(sock, msg, `❌ APK not found for *${query}*.`);
    }

    const caption = `📱 *APK Downloading:*\n
🔹 *Name:* ${result.name}
🔹 *Size:* ${result.size || 'Unknown'}
🔹 *Version:* ${result.version || 'Unknown'}
🔗 *Link:* ${result.url}`.trim();

    // Send app info with reply
    await sendReply(sock, msg, caption);

    // Send the APK file directly
    await sock.sendMessage(msg.key.remoteJid, {
      document: { url: result.url },
      mimetype: 'application/vnd.android.package-archive',
      fileName: `${result.name || 'app'}.apk`
    }, { quoted: msg });

  } catch (err) {
    console.error('[APKDL ERROR]', err.response?.data || err.message);
    return sendReply(sock, msg, '⚠️ Failed to download APK. Please try again later.');
  }
}
