// commands/sticker.js
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export const name = 'sticker';
export const description = 'Convert an image to a WhatsApp sticker';
export const category = 'Image';

export async function execute(sock, msg, args, { sendReply }) {
  const chatId = msg.key.remoteJid;
  const media = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

  if (!media) {
    return sendReply(chatId, '❌ Please reply to an image or send an image with the `.sticker` command.');
  }

  try {
    // Download image buffer
    const buffer = await sock.downloadMediaMessage(msg);

    // Convert to webp sticker format
    const outputPath = path.join('temp', `sticker_${Date.now()}.webp`);
    await sharp(buffer)
      .resize(512, 512, { fit: 'inside' })
      .webp()
      .toFile(outputPath);

    // Send sticker
    await sock.sendMessage(chatId, { sticker: fs.readFileSync(outputPath) });

    // Cleanup
    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error(error);
    sendReply(chatId, '⚠️ Failed to create sticker.');
  }
}
