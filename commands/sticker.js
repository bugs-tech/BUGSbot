import { downloadMediaMessage } from '@whiskeysockets/baileys';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import os from 'os';

export const name = 'sticker';
export const description = 'Convert image or short video (<3s) to sticker';
export const type = 'media';

export async function execute(sock, msg, args, context) {
  const { replyJid, sendReply } = context;

  const message = msg.message;
  const quoted = message?.extendedTextMessage?.contextInfo?.quotedMessage;

  const imageMsg = message?.imageMessage || quoted?.imageMessage;
  const videoMsg = message?.videoMessage || quoted?.videoMessage;

  if (!imageMsg && !videoMsg) {
    return sendReply(
      replyJid,
      '❌ Please send or reply to an *image* or a *short video (<3s)* to convert it to a sticker.\n\nUsage:\n• Send an image/video with `.sticker`\n• Or reply to an existing image/video with `.sticker`'
    );
  }

  try {
    // Image sticker
    if (imageMsg) {
      const buffer = await downloadMediaMessage({ message: { imageMessage: imageMsg } }, 'buffer', {});
      const stickerBuffer = await sharp(buffer)
        .resize(512, 512, { fit: 'cover' }) // circular effect removed, fit cover
        .webp({ quality: 90 })
        .toBuffer();

      return await sock.sendMessage(replyJid, { sticker: stickerBuffer });
    }

    // Video sticker
    if (videoMsg) {
      const buffer = await downloadMediaMessage({ message: { videoMessage: videoMsg } }, 'buffer', {});
      const tempVideoPath = path.join(os.tmpdir(), `temp_video_${Date.now()}.mp4`);
      const tempWebpPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);

      fs.writeFileSync(tempVideoPath, buffer);

      // Convert video to webp sticker using ffmpeg
      await new Promise((resolve, reject) => {
        const cmd = `ffmpeg -y -i "${tempVideoPath}" -vcodec libwebp -filter:v "fps=15,scale=512:512:flags=lanczos" -loop 0 -ss 0 -t 3 "${tempWebpPath}"`;
        exec(cmd, (err, stdout, stderr) => {
          if (err) reject(err);
          else resolve(stdout);
        });
      });

      const webpBuffer = fs.readFileSync(tempWebpPath);

      await sock.sendMessage(replyJid, { sticker: webpBuffer });

      fs.unlinkSync(tempVideoPath);
      fs.unlinkSync(tempWebpPath);
    }

  } catch (err) {
    console.error('❌ Sticker conversion failed:', err);
    return sendReply(replyJid, '❌ Failed to convert image/video to sticker.');
  }
}
