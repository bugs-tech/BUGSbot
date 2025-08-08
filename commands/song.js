import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'song';
export const description = 'Search & download audio using DavidCyrilTech Play API';
export const category = 'Downloader';
export const usage = '.song <song name>';

export async function execute(sock, msg, args) {
  const query = args.join(' ').trim();
  if (!query) return sendReply(sock, msg, '❌ Please provide a song name.');

  try {
    const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);
    const result = data?.result;

    if (!result || !result.download_url) {
      return sendReply(sock, msg, `❌ No results found for *${query}*`);
    }

    const caption = `
╭━━〔 🎧 𝙋𝙇𝘼𝙔 𝙍𝙀𝙎𝙐𝙇𝙏𝙎 〕━━⬣
┃🎵 *Title:* ${result.title}
┃📺 *Channel:* ${result.channel || result.artist_name || 'Unknown'}
┃⏱ *Duration:* ${result.duration || 'N/A'}
┃👁 *Views:* ${result.views || 'N/A'}
┃🔗 *URL:* ${result.video_url || result.url || '-'}
╰━━━⊰ BUGS BOT v2 ⊱━━━━⬣
    `.trim();

    // Send thumbnail with caption first
    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: result.thumbnail },
      caption
    }, { quoted: msg });

    // Then send audio file
    await sock.sendMessage(msg.key.remoteJid, {
      audio: { url: result.download_url },
      mimetype: 'audio/mp4'
    }, { quoted: msg });

  } catch (err) {
    console.error('[SONG ERROR]', err.response?.data || err.message);
    return sendReply(sock, msg, '⚠️ Error fetching song. Please try again later.');
  }
}
