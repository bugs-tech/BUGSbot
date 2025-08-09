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

    if (!result || !result.appname || !result.download_url) {
      return sendReply(sock, msg, `❌ APK not found for *${query}*.`);
    }

    const caption = `📱 *APK Downloading:*\n
🔹 *Name:* ${result.appname}
🔹 *Developer:* ${result.developer || 'Unknown'}
🔹 *MIME Type:* ${result.mimetype || 'Unknown'}
🔗 *Download Link:* ${result.download_url}`.trim();

    // Send app info with reply
    await sendReply(sock, msg, caption);

    // Send the APK file document from URL
    await sock.sendMessage(msg.key.remoteJid, {
      document: { url: result.download_url },
      mimetype: result.mimetype || 'application/vnd.android.package-archive',
      fileName: `${result.appname || 'app'}.apk`
    }, { quoted: msg });

  } catch (err) {
    console.error('[APKDL ERROR]', err.response?.data || err.message);
    return sendReply(sock, msg, '⚠️ Failed to download APK. Please try again later.');
  }
}
