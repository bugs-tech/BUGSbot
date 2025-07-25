// commands/sticker.js
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

export const name = 'sticker';
export const description = 'Convert image/video to sticker';
export const usage = '.sticker (send or reply to media)';
export const category = 'Media';

export async function execute(sock, msg, args, context) {
  const { replyJid, sendReply } = context;

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const mimeType = quoted
    ? Object.keys(quoted)[0]
    : Object.keys(msg.message || {})[0];

  const messageContent = quoted ? quoted : msg.message?.[mimeType];

  if (!messageContent || !/image|video/.test(mimeType)) {
    await sendReply(replyJid, '❌ Please send or reply to an image or video to convert it into a sticker.');
    return;
  }

  try {
    const buffer = await downloadMediaMessage(
      { message: quoted ? { [mimeType]: messageContent } : msg.message },
      'buffer',
      {},
      { logger: console }
    );

    const stickerOptions = {
      pack: 'BUGS-BOT',
      author: 'Sticker Maker',
    };

    await sock.sendMessage(replyJid, {
      sticker: buffer,
      ...stickerOptions,
    });
  } catch (err) {
    console.error('❌ Sticker conversion failed:', err);
    await sendReply(replyJid, '❌ Failed to convert media to sticker.');
  }
}
