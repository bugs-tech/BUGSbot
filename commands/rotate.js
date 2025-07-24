// commands/rotate.js

import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { downloadImage } from '../lib/downloadImage.js';

export const name = 'rotate';
export const description = 'Rotate an image 90 degrees';
export const category = 'Image';

export async function execute(sock, msg, args, { sendReply }) {
  const chatId = msg.key.remoteJid;
  const media = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

  if (!media) {
    return sendReply(chatId, '❌ Please reply to an image or send an image with the `.rotate` command.');
  }

  try {
    const buffer = await downloadImage(msg);

    const outputPath = path.join('temp', `rotate_${Date.now()}.jpg`);
    await sharp(buffer)
      .rotate(90)
      .jpeg()
      .toFile(outputPath);

    await sock.sendMessage(chatId, {
      image: fs.readFileSync(outputPath),
      caption: '✅ Image rotated 90 degrees.'
    });

    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error(error);
    sendReply(chatId, '⚠️ Failed to rotate the image.');
  }
}
