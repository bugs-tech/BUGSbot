// commands/ytmp3.js

import ytdl from 'ytdl-core';
import settings from '../settings.js';

export const name = 'ytmp3';
export const description = 'Download audio from YouTube video as MP3';
export const category = 'Download';

export async function execute(sock, msg, args, context) {
  const { senderJid, sendReply } = context;
  const url = args[0];

  if (!url || !ytdl.validateURL(url)) {
    await sendReply(senderJid, '❌ Please provide a valid YouTube URL.\n\nUsage: `.ytmp3 <YouTube URL>`');
    return;
  }

  try {
    // Get video info to check duration and title
    const info = await ytdl.getInfo(url);
    const durationSeconds = parseInt(info.videoDetails.lengthSeconds);
    const title = info.videoDetails.title;

    // Limit duration to e.g. 15 minutes (900s)
    if (durationSeconds > 900) {
      await sendReply(senderJid, '⚠️ Video is too long. Please choose a video under 15 minutes.');
      return;
    }

    // Stream audio only, highest quality
    const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });

    // Send audio with file name
    await sock.sendMessage(senderJid, {
      audio: stream,
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      caption: `🎵 *${title}*\n\n*From:* ${settings.botName}`,
    });

  } catch (error) {
    console.error('❌ ytmp3 error:', error);
    await sendReply(senderJid, `⚠️ Failed to download audio.\nReason: ${error.message || 'Unknown error'}`);
  }
}
