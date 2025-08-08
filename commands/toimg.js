// toimg.js

import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

export const name = 'toimg';
export const description = 'Convert sticker or view-once image to normal image';
export const category = 'tools';

export async function execute(sock, msg, args, context) {
  const quotedMsg =
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    msg.message?.viewOnceMessageV2?.message;

  if (!quotedMsg || (!quotedMsg.stickerMessage && !quotedMsg.imageMessage)) {
    return await context.sendReply('❌ Reply to a *sticker* or *view-once image* to convert to image.');
  }

  const mediaMessage =
    quotedMsg.stickerMessage ||
    quotedMsg.imageMessage;

  try {
    const buffer = await downloadMediaMessage(
      {
        key: msg.message.extendedTextMessage?.contextInfo?.quotedMessage
          ? msg.message.extendedTextMessage.contextInfo
          : msg,
        message: quotedMsg,
      },
      'buffer',
      {},
      { reuploadRequest: sock.updateMediaMessage }
    );

    const fileName = path.join(tmpdir(), `toimg_${Date.now()}.jpg`);
    fs.writeFileSync(fileName, buffer);

    await sock.sendMessage(msg.key.remoteJid, {
      image: fs.readFileSync(fileName),
      caption: '✅ Here is your image.',
    }, { quoted: msg });

    fs.unlinkSync(fileName);
  } catch (e) {
    console.error('❌ toimg error:', e);
    await context.sendReply('❌ Failed to convert to image.');
  }
}
