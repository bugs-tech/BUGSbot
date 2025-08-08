// commands/ytmp4.js
import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'ytmp4';
export const description = 'Download YouTube video as MP4';
export const category = 'Downloader';
export const usage = '.ytmp4 <YouTube URL>';

export async function execute(sock, msg, args) {
  const query = args[0];
  if (!query || (!query.includes('youtube.com') && !query.includes('youtu.be'))) {
    return sendReply(sock, msg, '❌ Usage: .ytmp4 <YouTube video URL>');
  }

  try {
    const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp4?url=${encodeURIComponent(query)}`;
    const { data } = await axios.get(apiUrl);

    const result = data.result;
    if (!result?.url) {
      return sendReply(sock, msg, '❌ Failed to fetch download link.');
    }

    const caption = `
╭━━〔 🎬 𝙔𝙏𝙈𝙋𝟰 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿 〕━━⬣
┃🎵 *Title:* ${result.title}
┃📺 *Channel:* ${result.channel}
┃⏱ *Duration:* ${result.duration}
┃👁 *Views:* ${result.views}
┃🔗 *URL:* ${query}
╰━━━⊰ *BUGS-BOT* ⊱━━━━⬣
`.trim();

    // Send thumbnail + caption
    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: result.thumbnail },
      caption
    }, { quoted: msg });

    // Send video file
    await sock.sendMessage(msg.key.remoteJid, {
      video: { url: result.url },
      mimetype: 'video/mp4'
    }, { quoted: msg });

  } catch (err) {
    console.error('[YTMP4 ERROR]', err.response?.data || err.message || err);
    return sendReply(sock, msg, '⚠️ Error fetching MP4. Please try again.');
  }
}
