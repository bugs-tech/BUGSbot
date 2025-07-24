// commands/invert.js

import { writeFileSync, unlinkSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

export const name = 'invert';
export const description = 'Invert the colors of an image';
export const category = 'Image';

export async function execute(sock, msg, args, { sendReply }) {
  const chatId = msg.key.remoteJid;
  const media = msg.message?.imageMessage;

  if (!media) {
    return sendReply(chatId, '❌ Please reply to an image with `.invert`');
  }

  try {
    const buffer = await sock.downloadMediaMessage(msg);
    const outputPath = path.join('temp', `invert_${Date.now()}.jpg`);

    await sharp(buffer)
      .negate()
      .toFile(outputPath);

    const image = { image: { url: outputPath } };
    await sock.sendMessage(chatId, image);

    unlinkSync(outputPath);
  } catch (err) {
    console.error(err);
    sendReply(chatId, '⚠️ Failed to invert the image.');
  }
}
