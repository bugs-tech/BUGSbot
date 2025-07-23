// ban.js
import fs from 'fs';
const banFile = './data/banned.json';

export const name = 'ban';
export const description = 'Ban a user from using the bot (admin only)';

export async function execute(sock, msg, args) {
    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!isGroup) {
        await sock.sendMessage(sender, { text: '❌ This command is group-only.' });
        return;
    }

    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);
    const senderIsAdmin = admins.includes(sender);

    if (!senderIsAdmin) {
        await sock.sendMessage(sender, { text: '🚫 You must be an *admin* to ban users.' });
        return;
    }

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned || mentioned.length === 0) {
        await sock.sendMessage(sender, { text: '⚠️ Mention a user to ban.\nExample: *.ban @user*' });
        return;
    }

    let banned = [];
    if (fs.existsSync(banFile)) {
        banned = JSON.parse(fs.readFileSync(banFile));
    }

    for (const jid of mentioned) {
        if (!banned.includes(jid)) {
            banned.push(jid);
        }
    }

    fs.writeFileSync(banFile, JSON.stringify(banned, null, 2));
    await sock.sendMessage(msg.key.remoteJid, {
        text: `🚫 Banned ${mentioned.map(j => `@${j.split('@')[0]}`).join(', ')}`,
        mentions: mentioned
    });
}
