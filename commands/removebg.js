// commands/removebg.js

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export const name = 'removebg';
export const description = 'Remove background from an image';
export const category = 'Image';

export async function execute(sock, msg, args, { sendReply }) {
  const chatId = msg.key.remoteJid;
  const imageMsg =
    msg.message?.imageMessage ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

  if (!imageMsg) {
    return sendReply(chatId, '❌ Please reply to or send an image.');
  }

  try {
    const buffer = await downloadMediaMessage({ message: { imageMessage: imageMsg } }, 'buffer');

    const apiKey = process.env.REMOVE_BG_KEY || 'your_removebg_api_key';
    const formData = new FormData();
    formData.append('image_file', new Blob([buffer]), 'input.jpg');
    formData.append('size', 'auto');

    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        ...formData.getHeaders?.(), // node-fetch/axios compatibility
        'X-Api-Key': apiKey,
      },
      responseType: 'arraybuffer'
    });

    const outputPath = path.join('temp', `no-bg-${Date.now()}.png`);
    fs.writeFileSync(outputPath, response.data);

    await sock.sendMessage(chatId, {
      image: fs.readFileSync(outputPath),
      caption: '🖼️ Background removed successfully!'
    });

    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error('❌ Error in removebg command:', error?.response?.data || error);
    sendReply(chatId, '⚠️ Failed to remove background. Make sure your API key is valid.');
  }
}
