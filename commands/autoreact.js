import settings from '../settings.js';

export const name = 'autoreact';

const autoReactGroups = new Set();

export async function execute(sock, msg, args) {
    // Construct bot owner JID from number in settings
    const botOwnerJid = `${settings.botOwnerNumber}@s.whatsapp.net`;

    // Get sender JID
    const sender = msg.key.participant || msg.key.remoteJid;

    // Only bot owner can use this command
    if (sender !== botOwnerJid) {
        await sock.sendMessage(msg.key.remoteJid, { text: '❌ Only the bot owner can use this command.' }, { quoted: msg });
        return;
    }

    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    if (!isGroup) {
        await sock.sendMessage(msg.key.remoteJid, { text: '❌ This command works only in groups.' }, { quoted: msg });
        return;
    }

    const arg = args[0]?.toLowerCase();
    if (!['on', 'off'].includes(arg)) {
        await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: .autoreact on|off' }, { quoted: msg });
        return;
    }

    if (arg === 'on') {
        autoReactGroups.add(msg.key.remoteJid);
        await sock.sendMessage(msg.key.remoteJid, { text: '✅ Auto-react *enabled* in this group.' }, { quoted: msg });
    } else {
        autoReactGroups.delete(msg.key.remoteJid);
        await sock.sendMessage(msg.key.remoteJid, { text: '❌ Auto-react *disabled* in this group.' }, { quoted: msg });
    }
}

export { autoReactGroups };
