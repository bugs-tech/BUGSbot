import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'play';
export const description = 'Search YouTube and send audio using GiftedTech YTA API';
export const usage = '.play <song name>';

export async function execute(sock, msg, args) {
  const query = args.join(' ').trim();
  if (!query) return sendReply(sock, msg, '❌ Usage: .play <song name>');

  try {
    // 1. Search for the video
    const searchUrl = `https://api.giftedtech.co.ke/api/search/yts?apikey=gifted&query=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl);
    const result = data.results?.[0];
    if (!result) return sendReply(sock, msg, `❌ No results found for *${query}*`);

    const videoUrl = result.url;
    if (!videoUrl) return sendReply(sock, msg, '❌ Video URL not found.');

    // 2. Styled info with thumbnail
    const caption = `
╭━━〔 🎧 𝙋𝙇𝘼𝙔 𝙍𝙀𝙎𝙐𝙇𝙏𝙎 〕━━⬣
┃🎵 *Title:* ${result.title}
┃📺 *Channel:* ${result.author?.name || 'Unknown'}
┃⏱ *Duration:* ${result.duration?.timestamp || result.timestamp || 'Unknown'}
┃👁 *Views:* ${result.views ? Number(result.views).toLocaleString() : 'Unknown'}
┃🔗 *URL:* ${videoUrl}
╰━━━⊰ BUGS BOT v1 ⊱━━━━⬣
    `.trim();

    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: result.thumbnail },
      caption
    }, { quoted: msg });

    // 3. Download audio using GiftedTech YTA API
    const downloadApi = `https://api.giftedtech.co.ke/api/download/yta?apikey=gifted&url=${encodeURIComponent(videoUrl)}`;
    const downloadResp = await axios.get(downloadApi);

    // Log full response for debug (remove later)
    console.log('Audio download API response:', downloadResp.data);

    // Fix here: use download_url (underscore)
    const audioUrl = downloadResp.data.result?.download_url;

    if (!audioUrl) return sendReply(sock, msg, '❌ Failed to fetch audio download link.');

    // 4. Send audio file
    await sock.sendMessage(msg.key.remoteJid, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg'
    }, { quoted: msg });

  } catch (err) {
    console.error('[PLAY ERROR]', err.response?.data || err.message || err);
    return sendReply(sock, msg, '⚠️ Error occurred while processing your request.');
  }
}
