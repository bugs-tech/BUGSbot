import fetch from 'node-fetch';
import FormData from 'form-data';
import { downloadContentFromMessage } from '@whiskeysockets/baileys'; // Adjust import to your Baileys version

export const name = 'removebg';
export const description = 'Remove background from an image';
export const usage = '.removebg (reply to an image or send an image)';

const API_KEY = 'pFTmPLFXUpZRppt8ja8S3bvz';

async function getBufferFromMessage(sock, message) {
  const stream = await downloadContentFromMessage(message, 'image');
  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  return buffer;
}

export async function execute(sock, msg, args, { sendReply, replyJid }) {
  try {
    // Get imageMessage either from direct image or replied image
    let imageMessage = null;

    if (msg.message.imageMessage) {
      imageMessage = msg.message.imageMessage;
    } else if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
      imageMessage = msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
    }

    if (!imageMessage) {
      return sendReply('❌ Please send or reply to an image to remove its background.');
    }

    // Download image buffer
    const buffer = await getBufferFromMessage(sock, imageMessage);

    // Prepare form data for remove.bg
    const formData = new FormData();
    formData.append('image_file', buffer, 'image.png');
    formData.append('size', 'auto');

    // Call remove.bg API
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': API_KEY,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errorMsg = errorJson.errors ? errorJson.errors[0].title : 'Unknown error from remove.bg API';
      return sendReply(`❌ Failed to remove background: ${errorMsg}`);
    }

    const resultBuffer = await response.buffer();

    // Send back image with background removed
    await sock.sendMessage(replyJid, {
      image: resultBuffer,
      caption: '✅ Background removed successfully!'
    });

  } catch (error) {
    console.error('RemoveBG command error:', error);
    await sendReply('❌ An error occurred while processing your image.');
  }
}
