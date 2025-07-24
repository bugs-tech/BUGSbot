// commands/rotate.js
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export const name = 'rotate';
export const description = 'Rotate an image by degrees (default 90)';
export const category = 'Image';

export async function execute(sock, msg, args, { sendReply }) {
  const chatId = msg.key.remoteJid;
  const degrees = args.length ? parseInt(args[0], 10) : 90;

  if (isNaN(degrees)) {
    return sendReply(chatId, '❌ Invalid degrees value. Please provide a number.\nExample: `.rotate 180`');
  }

  const media = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

  if (!media) {
    return sendReply(chatId, '❌ Please reply to an image or send an image with the `.rotate` command.');
  }

  try {
    const buffer = await sock.downloadMediaMessage(msg);
    const outputPath = path.join('temp', `rotate_${Date.now()}.jpg`);

    await sharp(buffer)
      .rotate(degrees)
      .toFile(outputPath);

    await sock.sendMessage(chatId, { image: fs.readFileSync(outputPath) });

    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error(error);
    sendReply(chatId, '⚠️ Failed to rotate the image.');
  }
}
