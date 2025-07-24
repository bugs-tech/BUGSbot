// commands/removebg.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import settings from '../settings.js';

export const name = 'removebg';
export const description = 'Remove background from an image (requires remove.bg API key)';
export const category = 'Image';

export async function execute(sock, msg, args, { sendReply }) {
  const chatId = msg.key.remoteJid;

  // Your Remove.bg API key - recommend to keep it in settings.js or .env instead of hardcoding
  const apiKey = settings.removeBgApiKey || 'jVJVMhRN1kThMb1br7SLR3sr';

  if (!apiKey) {
    return sendReply(chatId, '⚠️ remove.bg API key is missing in settings.');
  }

  // Check if the message contains or quotes an image
  const media = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
  if (!media) {
    return sendReply(chatId, '❌ Please reply to an image or send an image with the `.removebg` command.');
  }

  try {
    // Download image buffer from the message
    const buffer = await sock.downloadMediaMessage(msg);

    // Prepare form data for remove.bg API
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    formData.append('image_file', buffer, 'image.png');
    formData.append('size', 'auto');

    // Send request to remove.bg
    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': apiKey,
      },
      responseType: 'arraybuffer'
    });

    if (response.status !== 200) {
      return sendReply(chatId, `⚠️ Failed to remove background. Status: ${response.status}`);
    }

    // Save the result temporarily
    const outputPath = path.join('temp', `removebg_${Date.now()}.png`);
    fs.writeFileSync(outputPath, response.data);

    // Send the image back to chat
    await sock.sendMessage(chatId, { image: fs.readFileSync(outputPath) });

    // Clean up temp file
    fs.unlinkSync(outputPath);
  } catch (error) {
    console.error('❌ Error in removebg command:', error);
    sendReply(chatId, `⚠️ Error removing background: ${error.message || error}`);
  }
}
