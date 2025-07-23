// commands/setwelcome.js

import fs from 'fs';

const welcomePath = './data/welcome.json';

export const name = 'setwelcome';
export const description = 'Set a custom welcome message for this group';

export async function execute(sock, msg, args) {
    const groupId = msg.key.remoteJid;

    // ✅ Ensure in group chat
    if (!groupId.endsWith('@g.us')) {
        await sock.sendMessage(groupId, { text: '❌ This command is for groups only.' });
        return;
    }

    // ✅ Ensure sender is admin
    const metadata = await sock.groupMetadata(groupId);
    const sender = msg.key.participant;
    const isAdmin = metadata.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));

    if (!isAdmin) {
        await sock.sendMessage(groupId, { text: '🚫 Only group admins can set the welcome message.' });
        return;
    }

    const customText = args.join(' ').trim();
    if (!customText) {
        await sock.sendMessage(groupId, {
            text: '✏️ Please provide a welcome message.\n\nExample:\n.setwelcome Hello @user, welcome to *Group Name*! 🎉'
        });
        return;
    }

    const welcomeData = fs.existsSync(welcomePath) ? JSON.parse(fs.readFileSync(welcomePath)) : {};
    welcomeData[groupId] = customText;
    fs.writeFileSync(welcomePath, JSON.stringify(welcomeData, null, 2));

    await sock.sendMessage(groupId, { text: '✅ Welcome message updated!' });
}
