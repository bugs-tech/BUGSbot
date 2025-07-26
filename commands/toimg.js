import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: 'toimg',
  alias: ['img', 'toimage'],
  category: 'converter',
  desc: 'Convert sticker to image',
  async execute(sock, msg, args, sendReply) {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage 
                || msg.message?.ephemeralMessage?.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    const isSticker = quoted?.stickerMessage;

    if (!quoted || !isSticker) {
      return sendReply('⚠️ Please reply to a sticker to convert it to image.');
    }

    try {
      const mediaBuffer = await downloadMediaMessage(
        { key: msg.message.extendedTextMessage.contextInfo.stanzaId ? msg.message.extendedTextMessage.contextInfo : msg.key, message: quoted },
        'buffer',
        {},
        { logger: sock.logger }
      );

      const imgPath = path.join(__dirname, '../temp', `img-${Date.now()}.png`);
      await sharp(mediaBuffer)
        .png()
        .toFile(imgPath);

      await sock.sendMessage(msg.key.remoteJid, {
        image: fs.readFileSync(imgPath),
        caption: '🖼️ Converted from sticker!',
      }, { quoted: msg });

      fs.unlinkSync(imgPath);
    } catch (err) {
      console.error('❌ toimg error:', err);
      sendReply('⚠️ Failed to convert sticker to image.');
    }
  }
};
