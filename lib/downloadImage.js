// lib/downloadImage.js

import { downloadMediaMessage } from '@whiskeysockets/baileys';

/**
 * Downloads the image buffer from a message.
 * @param {Object} msg - The Baileys message object.
 * @returns {Promise<Buffer>} - A buffer of the downloaded image.
 */
export async function downloadImage(msg) {
  const imageMessage =
    msg.message?.imageMessage ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

  if (!imageMessage) {
    throw new Error('No image message found to download.');
  }

  const stream = await downloadMediaMessage(
    msg,
    'buffer',
    {},
    { reuploadRequest: msg.key }
  );

  return stream;
}
