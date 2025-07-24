// commands/greyscale.js
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export const name = 'greyscale';
export const description = 'Convert an image to greyscale';
export const category = 'Image';

export async function execute(sock, msg, args, { sendReply }) {
  const chatId = msg.key.remoteJid;
  const media = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

  if (!media) {
    return sendReply(chatId, '❌ Please reply to an image or send an image with the `.greyscale` command.');
  }

  try {
    const buffer = await sock.downloadMediaMessage(msg);
    const outputPath = path.join('temp', `greyscale_${Date.now()}.jpg`);

    await sharp(buffer)
      .grayscale()
      .toFile(outputPath);

    await sock.sendMessage(chatId, { image: fs.readFileSync(outputPath) });

    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error(error);
    sendReply(chatId, '⚠️ Failed to convert image to greyscale.');
  }
}
