// commands/toimg.js
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export const command = {
  name: 'toimg',
  category: 'media',
  description: 'Converts sticker or image (even view-once) to a normal image.',

  async execute(m, { sock }) {
    try {
      const msg = m.quoted || m;
      const type = msg.mtype;

      if (!['imageMessage', 'stickerMessage'].includes(type)) {
        return sock.sendMessage(m.chat, {
          text: '❌ Reply to an image or sticker to convert it.',
        }, { quoted: m });
      }

      const mediaBuffer = await downloadMediaMessage(
        msg,
        'buffer',
        {},
        {
          logger: console,
          reuploadRequest: sock.updateMediaMessage
        }
      );

      if (!mediaBuffer) {
        return sock.sendMessage(m.chat, {
          text: '⚠️ Failed to download the media.',
        }, { quoted: m });
      }

      await sock.sendMessage(m.chat, {
        image: mediaBuffer,
        caption: '🖼️ Here is your image!',
      }, { quoted: m });

    } catch (err) {
      console.error('[toimg error]', err);
      await sock.sendMessage(m.chat, {
        text: '⚠️ Failed to convert. Make sure you replied to a valid sticker or image.',
      }, { quoted: m });
    }
  }
};
