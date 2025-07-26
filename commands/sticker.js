import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import fileType from 'file-type'; // <-- FIXED
import { tmpdir } from 'os';

export const name = 'sticker';
export const description = 'Convert image or video to sticker';
export const category = 'Media';
export const usage = '.sticker (reply to image or video)';

export async function execute(sock, msg, args, { replyJid, sendReply }) {
    let mediaMessage;
    let quotedType;

    if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        quotedType = Object.keys(quoted)[0];
        if (quotedType === 'imageMessage' || quotedType === 'videoMessage') {
            mediaMessage = { message: quoted };
        }
    }

    // Fallback to normal message (if not replying)
    if (!mediaMessage && (msg.message?.imageMessage || msg.message?.videoMessage)) {
        const directType = Object.keys(msg.message)[0];
        mediaMessage = { message: { [directType]: msg.message[directType] } };
    }

    if (!mediaMessage) {
        return sendReply(replyJid, '❌ Please reply to an image or video, or send one directly with the command.');
    }

    try {
        const buffer = await downloadMediaMessage(
            mediaMessage,
            'buffer',
            {},
            { logger: console }
        );

        if (!buffer) {
            return sendReply(replyJid, '❌ Failed to download media. Try again.');
        }

        const type = await fileType.fromBuffer(buffer); // <-- FIXED
        const fileName = path.join(tmpdir(), `sticker-input.${type?.ext || 'tmp'}`);
        await writeFile(fileName, buffer);

        await sock.sendMessage(replyJid, {
            sticker: buffer
        });

        fs.unlinkSync(fileName); // cleanup
    } catch (err) {
        console.error('❌ Sticker conversion failed:', err);
        await sendReply(replyJid, '❌ Failed to convert media to sticker.');
    }
}
