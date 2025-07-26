import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import { sendReply } from '../lib/sendReply.js';
import { sendAudio } from '../lib/sendAudio.js';

const TMP_FILE = './tmp/yta.mp3';

export const command = {
  name: 'yta',
  alias: [],
  description: 'Download audio from YouTube',
  category: 'media',
  use: '.yta <YouTube URL>',
  async execute(sock, m, args) {
    const url = args[0];

    if (!url || !ytdl.validateURL(url)) {
      return await sendReply(sock, m.chat, '❌ Please provide a valid YouTube URL.', { quoted: m });
    }

    try {
      const info = await ytdl.getInfo(url, {
        requestOptions: {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        }
      });

      const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
      const title = info.videoDetails.title;
      const duration = info.videoDetails.lengthSeconds;
      const channel = info.videoDetails.author.name;

      const msg = `🎵 *Title:* ${title}\n🕒 *Duration:* ${Math.floor(duration / 60)}:${duration % 60}\n📺 *Channel:* ${channel}`;
      await sendReply(sock, m.chat, msg, { quoted: m });

      // Download the audio stream to temp file
      const stream = ytdl.downloadFromInfo(info, {
        filter: 'audioonly',
        quality: 'highestaudio',
      });

      const fileStream = fs.createWriteStream(TMP_FILE);
      stream.pipe(fileStream);

      await new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      // Send audio
      await sendAudio(sock, m.chat, TMP_FILE, title, m);

      // Cleanup
      fs.unlinkSync(TMP_FILE);
    } catch (err) {
      console.error('❌ Error in .yta:', err);
      await sendReply(sock, m.chat, '⚠️ Failed to download audio.', { quoted: m });
    }
  }
};
