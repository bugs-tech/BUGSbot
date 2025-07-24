// commands/sticker.js

import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { downloadMediaMessage } from '@whiskeysockets/baileys'; // ✅ required import

export const name = 'sticker';
export const description = 'Convert an image to a WhatsApp sticker';
export const category = 'Image';

export async function execute(sock, msg, args, { sendReply }) {
  const chatId = msg.key.remoteJid;
  const isQuoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imageMsg =
    msg.message?.imageMessage ||
    isQuoted?.imageMessage;

  if (!imageMsg) {
    return sendReply(chatId, '❌ Please reply to an image or send an image with the `.sticker` command.');
  }

  try {
    // ✅ download media correctly from quoted or sent image
    const buffer = await downloadMediaMessage(
      { message: imageMsg }, // wrap it in a "message" object
      'buffer'
    );

    // Convert to webp
    const outputPath = path.join('temp', `sticker_${Date.now()}.webp`);
    await sharp(buffer)
      .resize(512, 512, { fit: 'inside' })
      .webp()
      .toFile(outputPath);

    const webpBuffer = fs.readFileSync(outputPath);
    await sock.sendMessage(chatId, { sticker: webpBuffer });

    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error(error);
    sendReply(chatId, '⚠️ Failed to create sticker.');
  }
}
