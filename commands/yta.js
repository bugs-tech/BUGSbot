import ytdl from 'ytdl-core';
import { sendReply } from '../lib/sendReply.js'; // Make sure this helper exists
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

export const name = 'yta';
export const description = 'Download YouTube audio (MP3)';
export const category = 'Downloader';
export const usage = '.yta <YouTube URL>';

export async function execute(sock, msg, args, context) {
  const { chat, isGroup, senderName } = context;
  const url = args[0];

  if (!url || !ytdl.validateURL(url)) {
    return sendReply(sock, msg, '❌ Please provide a valid YouTube URL.\nExample: `.yta https://youtu.be/xyz`');
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const duration = formatDuration(info.videoDetails.lengthSeconds);
    const author = info.videoDetails.author.name;
    const videoUrl = info.videoDetails.video_url;
    const thumbnail = info.videoDetails.thumbnails?.[info.videoDetails.thumbnails.length - 1]?.url || '';
    
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    const fileSizeMB = (audioFormat.contentLength / 1024 / 1024).toFixed(2);

    // Send info card
    const caption = `
🎵 *Title:* ${title}
🕒 *Duration:* ${duration}
👤 *Channel:* ${author}
📦 *Size:* ~${fileSizeMB} MB
🔗 *URL:* ${videoUrl}
`.trim();

    await sock.sendMessage(chat, {
      image: { url: thumbnail },
      caption
    });

    // Download and send MP3
    const tempPath = path.join('./temp', `${Date.now()}_audio.mp3`);
    const stream = ytdl(url, { filter: 'audioonly' }).pipe(fs.createWriteStream(tempPath));

    stream.on('finish', async () => {
      await sock.sendMessage(chat, {
        document: fs.readFileSync(tempPath),
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      });
      fs.unlinkSync(tempPath);
    });

  } catch (err) {
    console.error('Error in .yta:', err);
    return sendReply(sock, msg, '⚠️ Failed to process the YouTube link.');
  }
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
