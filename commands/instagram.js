// commands/instagram.js

import axios from 'axios';
import settings from '../settings.js';

export const name = 'instagram';
export const description = 'Download video or photo from Instagram post';
export const category = 'Download';

export async function execute(sock, msg, args, context) {
  const { senderJid, sendReply } = context;
  const url = args[0];

  if (!url || !url.includes('instagram.com')) {
    await sendReply(senderJid, '❌ Please provide a valid Instagram URL.\n\nUsage: `.instagram <Instagram URL>`');
    return;
  }

  try {
    // Example third-party Instagram downloader API endpoint
    const apiUrl = `https://api.instagramdownloader.com/download?url=${encodeURIComponent(url)}`;

    const response = await axios.get(apiUrl);
    const media = response.data.media; // expecting { media: [{ url: '', type: 'image'|'video' }, ...] }

    if (!media || media.length === 0) {
      throw new Error('No media found at provided URL.');
    }

    // Send all media items one by one
    for (const item of media) {
      if (item.type === 'video') {
        await sock.sendMessage(senderJid, {
          video: { url: item.url },
          mimetype: 'video/mp4',
          caption: `📸 Instagram Video\n\n*From:* ${settings.botName}`,
        });
      } else if (item.type === 'image') {
        await sock.sendMessage(senderJid, {
          image: { url: item.url },
          caption: `📸 Instagram Image\n\n*From:* ${settings.botName}`,
        });
      }
    }

  } catch (error) {
    console.error('❌ instagram command error:', error);
    await sendReply(senderJid, `⚠️ Failed to download Instagram media.\nReason: ${error.message || 'Unknown error'}`);
  }
}
