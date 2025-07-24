// commands/play.js
import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';
import settings from '../settings.js';

export const name = 'play';
export const description = 'Search YouTube and get audio download link';
export const category = 'Downloader';
export const usage = '.play <song name>';

export async function execute(sock, msg, args, context) {
  const query = args.join(' ');
  const { senderJid, commandName } = context;

  if (!query) {
    return sendReply(sock, msg, `❌ Usage: *${settings.prefix}${commandName} song name*`);
  }

  try {
    const ytKey = settings.youtube.apiKey;
    if (!ytKey) {
      return sendReply(sock, msg, '❌ YouTube API key not configured.');
    }

    const ytSearchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
      query
    )}&key=${ytKey}&maxResults=1`;

    const { data } = await axios.get(ytSearchURL);
    const video = data.items?.[0];
    if (!video) {
      return sendReply(sock, msg, `❌ No results found for *${query}*`);
    }

    const videoId = video.id.videoId;
    const title = video.snippet.title;
    const channel = video.snippet.channelTitle;
    const thumbnail = video.snippet.thumbnails.high.url;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const responseText = `
🎵 *YouTube Search Result* 🎵
────────────────────
🔹 *Title:* ${title}
🔹 *Channel:* ${channel}
🔹 *Link:* ${videoUrl}
🔹 *Download:* Use *.yta ${videoUrl}* for audio or *.ytv ${videoUrl}* for video.
────────────────────
🔥 Requested via: *${msg.pushName || 'User'}*
`.trim();

    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: thumbnail },
      caption: responseText
    });
  } catch (err) {
    console.error('[PLAY ERROR]', err.message || err);
    return sendReply(sock, msg, '⚠️ Error fetching video. Please try again later.');
  }
}
