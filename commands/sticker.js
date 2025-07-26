import { downloadMediaMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';
import pkg from 'file-type';
const { fileTypeFromBuffer } = pkg;

export const name = 'sticker';
export const description = 'Convert image to sticker';
export const type = 'media';

export async function execute(sock, msg, args, context) {
  const { replyJid, sendReply } = context;

  let message = msg.message;
  let quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  let imageMsg = null;

  if (message?.imageMessage) {
    imageMsg = message.imageMessage;
  } else if (quoted?.imageMessage) {
    imageMsg = quoted.imageMessage;
  }

  if (!imageMsg) {
    return sendReply(replyJid, '❌ Please send or reply to an image to convert it to a sticker.');
  }

  try {
    const buffer = await downloadMediaMessage(
      { message: { imageMessage: imageMsg } },
      'buffer',
      {}
    );

    // Fix transparency and improve quality
    const stickerBuffer = await sharp(buffer)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .webp({ quality: 90 })
      .toBuffer();

    await sock.sendMessage(replyJid, {
      sticker: stickerBuffer,
    });

  } catch (err) {
    console.error('❌ Sticker conversion failed:', err);
    return sendReply(replyJid, '❌ Failed to convert image to sticker.');
  }
}
