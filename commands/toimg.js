// commands/toimg.js
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export const name = 'toimg';
export const description = 'Convert a sticker (webp) to image (png)';
export const category = 'Image';

export async function execute(sock, msg, args, { sendReply }) {
  const chatId = msg.key.remoteJid;

  // Sticker is either directly sent or quoted
  const sticker = msg.message?.stickerMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;

  if (!sticker) {
    return sendReply(chatId, '❌ Please reply to a sticker or send a sticker with the `.toimg` command.');
  }

  try {
    const buffer = await sock.downloadMediaMessage(msg);
    const outputPath = path.join('temp', `toimg_${Date.now()}.png`);

    await sharp(buffer)
      .png()
      .toFile(outputPath);

    await sock.sendMessage(chatId, { image: fs.readFileSync(outputPath) });

    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error(error);
    sendReply(chatId, '⚠️ Failed to convert sticker to image.');
  }
}
