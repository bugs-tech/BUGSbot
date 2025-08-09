import axios from 'axios';
import { sendReply } from '../lib/sendReply.js';

export const name = 'facedl';
export const description = 'Download Facebook video using GiftedTech Facebookv2 API';
export const usage = '.facedl <facebook_video_url>';

export async function execute(sock, msg, args) {
  const videoUrl = args.join(' ').trim();
  if (!videoUrl) return sendReply(sock, msg, '❌ Usage: .facedl <Facebook video URL>');

  try {
    const apiUrl = `https://api.giftedtech.co.ke/api/download/facebookv2?apikey=gifted&url=${encodeURIComponent(videoUrl)}`;
    const { data } = await axios.get(apiUrl);

    console.log('Facebookv2 download API response:', JSON.stringify(data, null, 2));

    if (!data || !data.success || !data.result || !data.result.success) {
      return sendReply(sock, msg, '❌ Failed to fetch video data. Please check the URL and try again.');
    }

    const title = data.result.title || 'Facebook Video';
    const videos = data.result.videos || {};

    // Prefer HD if available, otherwise fallback to SD
    const videoDownloadUrl = videos.hd?.url || videos.sd?.url;

    if (!videoDownloadUrl) {
      return sendReply(sock, msg, '❌ Could not find downloadable video link in API response.');
    }

    // Compose blocked style message
    const blockedMsg = `
┌─❒ *Facebook Video Download*
│
├─ Title: ${title}
├─ URL: ${videoUrl}
├─ Quality: ${videos.hd ? 'HD' : 'SD'}
├─ Size: ${videos.hd?.size || videos.sd?.size || 'Unknown'}
│
└─ _Downloading video for you..._`;

    await sendReply(sock, msg, blockedMsg.trim());

    // Send the video file
    await sock.sendMessage(msg.key.remoteJid, {
      video: { url: videoDownloadUrl },
      mimetype: 'video/mp4',
      fileName: `${title.replace(/[\\/:*?"<>|]/g, '')}.mp4`, // remove invalid chars from filename
      caption: `🎥 ${title}`
    }, { quoted: msg });

  } catch (err) {
    console.error('[FACEDL ERROR]', err.response?.data || err.message || err);
    return sendReply(sock, msg, '⚠️ Failed to download Facebook video. Please try again later.');
  }
}
