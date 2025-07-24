import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

export const name = 'yta';
export const description = 'Download YouTube audio (MP3)';
export const category = 'Downloader';
export const usage = '.yta <YouTube URL>';

export async function execute(sock, msg, args, context) {
  const { replyJid, sendReply } = context;
  const url = args[0];

  if (!url || !ytdl.validateURL(url)) {
    return sendReply(replyJid, '❌ Please provide a valid YouTube URL.\nExample: `.yta https://youtu.be/xyz`');
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;
    const duration = formatDuration(parseInt(info.videoDetails.lengthSeconds));
    const author = info.videoDetails.author.name;
    const videoUrl = info.videoDetails.video_url;
    const thumbnail = info.videoDetails.thumbnails?.[info.videoDetails.thumbnails.length - 1]?.url || '';

    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    const fileSizeMB = audioFormat.contentLength ? (audioFormat.contentLength / 1024 / 1024).toFixed(2) : 'Unknown';

    // Send info card with thumbnail
    await sock.sendMessage(replyJid, {
      image: { url: thumbnail },
      caption: `
🎵 *Title:* ${title}
🕒 *Duration:* ${duration}
👤 *Channel:* ${author}
📦 *Size:* ~${fileSizeMB} MB
🔗 *URL:* ${videoUrl}
      `.trim()
    });

    // Download audio to temp file
    const tempDir = './temp';
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const tempPath = path.join(tempDir, `${Date.now()}_audio.mp3`);

    const writeStream = fs.createWriteStream(tempPath);
    ytdl(url, { filter: 'audioonly' }).pipe(writeStream);

    // Wait for download to finish
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Send audio file
    await sock.sendMessage(replyJid, {
      document: fs.readFileSync(tempPath),
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    });

    // Cleanup temp file
    fs.unlinkSync(tempPath);

  } catch (err) {
    console.error('Error in .yta command:', err);
    return sendReply(replyJid, '⚠️ Failed to process the YouTube link.');
  }
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
