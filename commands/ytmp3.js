import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'ytmp3';
export const description = 'Download YouTube video as MP3';
export const usage = '.ytmp3 <YouTube URL>';

export async function execute(sock, msg, args) {
  const url = args[0]?.trim();
  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    return sendReply(
      sock,
      msg,
      '❌ Please provide a valid YouTube link.\n\n📌 Example:\n.ytmp3 https://youtube.com/watch?v=XXXX'
    );
  }

  try {
    const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(apiUrl);

    if (!data?.result?.downloadUrl) {
      console.error('ytmp3 API error:', data);
      return sendReply(sock, msg, '❌ Failed to fetch download link.');
    }

    const {
      title,
      image: thumbnail,
      downloadUrl: audioUrl
    } = data.result;

    const caption = `🎶 *Title:* ${title}
📥 *Quality:* Unknown
🎧 *Type:* MP3 Audio`;

    // Send video info with thumbnail
    await sock.sendMessage(
      msg.key.remoteJid,
      {
        image: { url: thumbnail },
        caption
      },
      { quoted: msg }
    );

    // Send the audio file
    await sock.sendMessage(
      msg.key.remoteJid,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mp4'
      },
      { quoted: msg }
    );

  } catch (err) {
    console.error('ytmp3 error:', err.response?.data || err.message);
    return sendReply(sock, msg, '❌ An error occurred while downloading MP3.\n\n— *BUGS-BOT support tech*');
  }
}
