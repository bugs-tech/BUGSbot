// commands/blur.js
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export const name = 'blur';
export const description = 'Apply blur effect to an image';
export const category = 'Image';

export async function execute(sock, msg, args, { sendReply }) {
  const chatId = msg.key.remoteJid;
  // Accept optional blur amount argument or default to 5
  const blurAmount = args.length ? parseFloat(args[0]) : 5;

  if (isNaN(blurAmount) || blurAmount <= 0) {
    return sendReply(chatId, '❌ Invalid blur amount. Please provide a positive number.\nExample: `.blur 10`');
  }

  const media = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

  if (!media) {
    return sendReply(chatId, '❌ Please reply to an image or send an image with the `.blur` command.');
  }

  try {
    const buffer = await sock.downloadMediaMessage(msg);
    const outputPath = path.join('temp', `blur_${Date.now()}.jpg`);

    await sharp(buffer)
      .blur(blurAmount)
      .toFile(outputPath);

    await sock.sendMessage(chatId, { image: fs.readFileSync(outputPath) });

    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error(error);
    sendReply(chatId, '⚠️ Failed to blur the image.');
  }
}
