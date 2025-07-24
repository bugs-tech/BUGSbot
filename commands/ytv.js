import ytdl from 'ytdl-core';
import { sendReply } from '../lib/sendReply.js';
import fs from 'fs';
import path from 'path';

export const name = 'ytv';
export const description = 'Download YouTube video';
export const category = 'Downloader';
export const usage = '.ytv <YouTube URL>';

export async function execute(sock, msg, args, context) {
  const { chat } = context;
  const url = args[0];

  if (!url || !ytdl.validateURL(url)) {
    return sendReply(sock, msg, '❌ Please provide a valid YouTube URL.\nExample: `.ytv https://youtu.be/xyz`');
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const duration = formatDuration(info.videoDetails.lengthSeconds);
    const author = info.videoDetails.author.name;
    const videoUrl = info.videoDetails.video_url;
    const thumbnail = info.videoDetails.thumbnails?.slice(-1)?.[0]?.url;

    const videoFormat = ytdl.chooseFormat(info.formats, {
      quality: '18' // 360p (widely supported and small size)
    });

    const fileSizeMB = (videoFormat.contentLength / 1024 / 1024).toFixed(2);

    // Send video info card
    const caption = `
🎬 *Title:* ${title}
🕒 *Duration:* ${duration}
👤 *Channel:* ${author}
📦 *Size:* ~${fileSizeMB} MB
🔗 *URL:* ${videoUrl}
`.trim();

    await sock.sendMessage(chat, {
      image: { url: thumbnail },
      caption
    });

    // Download video
    const tempPath = path.join('./temp', `${Date.now()}_video.mp4`);
    const stream = ytdl(url, { quality: '18' }).pipe(fs.createWriteStream(tempPath));

    stream.on('finish', async () => {
      await sock.sendMessage(chat, {
        document: fs.readFileSync(tempPath),
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`
      });
      fs.unlinkSync(tempPath);
    });

  } catch (err) {
    console.error('❌ Error in .ytv:', err);
    return sendReply(sock, msg, '⚠️ Failed to download the YouTube video.');
  }
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
