// commands/ytmp4.js

import ytdl from 'ytdl-core';
import settings from '../settings.js';

export const name = 'ytmp4';
export const description = 'Download video from YouTube as MP4';
export const category = 'Download';

export async function execute(sock, msg, args, context) {
  const { senderJid, sendReply } = context;
  const url = args[0];

  if (!url || !ytdl.validateURL(url)) {
    await sendReply(senderJid, '❌ Please provide a valid YouTube URL.\n\nUsage: `.ytmp4 <YouTube URL>`');
    return;
  }

  try {
    const info = await ytdl.getInfo(url);
    const durationSeconds = parseInt(info.videoDetails.lengthSeconds);
    const title = info.videoDetails.title;

    if (durationSeconds > 900) {
      await sendReply(senderJid, '⚠️ Video is too long. Please choose a video under 15 minutes.');
      return;
    }

    // Stream highest quality video + audio
    const stream = ytdl(url, { quality: 'highestvideo', filter: format => format.container === 'mp4' });

    await sock.sendMessage(senderJid, {
      video: stream,
      mimetype: 'video/mp4',
      fileName: `${title}.mp4`,
      caption: `🎥 *${title}*\n\n*From:* ${settings.botName}`,
    });

  } catch (error) {
    console.error('❌ ytmp4 error:', error);
    await sendReply(senderJid, `⚠️ Failed to download video.\nReason: ${error.message || 'Unknown error'}`);
  }
}
