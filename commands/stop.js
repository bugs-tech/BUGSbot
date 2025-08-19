import { stopAllSpams, stopSpamFor } from './spams.js';

export const name = 'stop';
export const description = 'Stop spam for a user or all';
export const category = 'fun';

export async function execute(sock, msg, args) {
    try {
        if (args[0] && args[0].toLowerCase() === 'all') {
            stopAllSpams();
            return sock.sendMessage(msg.key.remoteJid, { text: '🛑 All spams stopped.' }, { quoted: msg });
        }

        let target;
        if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            target = msg.message.extendedTextMessage.contextInfo.participant;
        } else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (args[0] && /^\d+$/.test(args[0].replace(/[^0-9]/g, ''))) {
            target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        }

        if (!target) {
            return sock.sendMessage(msg.key.remoteJid, { text: '❌ Please mention/reply/provide number.' }, { quoted: msg });
        }

        if (stopSpamFor(target)) {
            return sock.sendMessage(msg.key.remoteJid, { text: `🛑 Spam stopped for ${target}` }, { quoted: msg });
        } else {
            return sock.sendMessage(msg.key.remoteJid, { text: '⚠️ No spam running for this user.' }, { quoted: msg });
        }
    } catch (err) {
        console.error(err);
        sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }, { quoted: msg });
    }
}
