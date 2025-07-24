// commands/blur.js

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export const name = 'blur';
export const description = 'Blur an image and return it';
export const category = 'Image';

export async function execute(sock, msg, args, { sendReply }) {
  const chatId = msg.key.remoteJid;
  const imageMsg =
    msg.message?.imageMessage ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

  if (!imageMsg) {
    return sendReply(chatId, '❌ Please reply to an image to blur it.');
  }

  try {
    const buffer = await downloadMediaMessage({ message: { imageMessage: imageMsg } }, 'buffer');

    const outputPath = path.join('temp', `blur_${Date.now()}.jpg`);
    await sharp(buffer).blur(20).toFile(outputPath);

    await sock.sendMessage(chatId, {
      image: fs.readFileSync(outputPath),
      caption: '✨ Here is your blurred image.'
    });

    fs.unlinkSync(outputPath);
  } catch (err) {
    console.error(err);
    sendReply(chatId, '⚠️ Failed to blur the image.');
  }
}
