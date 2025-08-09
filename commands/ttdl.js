import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'ttdl';
export const description = 'Download TikTok video and audio using GiftedTech TikTokDLv4 API';
export const usage = '.ttdl <tiktok_video_url>';

export async function execute(sock, msg, args) {
  const tiktokUrl = args.join(' ').trim();
  if (!tiktokUrl) return sendReply(sock, msg, '❌ Usage: .ttdl <TikTok video URL>');

  try {
    const apiUrl = `https://api.giftedtech.co.ke/api/download/tiktokdlv4?apikey=gifted&url=${encodeURIComponent(tiktokUrl)}`;
    const { data } = await axios.get(apiUrl);

    console.log('TikTokDL API response:', JSON.stringify(data, null, 2));

    if (!data?.success || !data.result) {
      return sendReply(sock, msg, '❌ Failed to fetch TikTok video data. Please check the URL and try again.');
    }

    const { username, title, thumbnailUrl, videoUrl, audioUrl } = data.result;

    if (!videoUrl || !audioUrl) {
      return sendReply(sock, msg, '❌ Could not find video or audio download links.');
    }

    // Boxed style message
    const boxedMsg = `
┌─❒ *TikTok Download*
│
├─ *User:* @${username}
├─ *Title:* ${title}
│
└─ _Downloading video and audio for you..._`.trim();

    await sendReply(sock, msg, boxedMsg);

    // Send video file
    await sock.sendMessage(msg.key.remoteJid, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      fileName: `${username}_video.mp4`,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: `@${username}`,
          mediaUrl: tiktokUrl,
          thumbnailUrl,
          sourceUrl: tiktokUrl,
          mediaType: 2
        }
      }
    }, { quoted: msg });

    // Send audio file
    await sock.sendMessage(msg.key.remoteJid, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${username}_audio.mp3`,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: `@${username}`,
          mediaUrl: tiktokUrl,
          thumbnailUrl,
          sourceUrl: tiktokUrl,
          mediaType: 2
        }
      }
    }, { quoted: msg });

  } catch (err) {
    console.error('[TTDL ERROR]', err.response?.data || err.message || err);
    return sendReply(sock, msg, '⚠️ Failed to download TikTok video/audio. Please try again later.');
  }
}
