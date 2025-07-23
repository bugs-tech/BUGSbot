// promote.js
export const name = 'promote';
export const description = 'Promote a user to admin (group only, admin-only)';

export async function execute(sock, msg, args) {
    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!isGroup) {
        await sock.sendMessage(sender, { text: '❌ This command only works in groups.' });
        return;
    }

    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);
    const senderIsAdmin = admins.includes(sender);

    if (!senderIsAdmin) {
        await sock.sendMessage(sender, { text: '🚫 You must be an *admin* to use this command.' });
        return;
    }

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned || mentioned.length === 0) {
        await sock.sendMessage(sender, { text: '⚠️ Please mention a user to promote.\nExample: *.promote @user*' });
        return;
    }

    try {
        await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, 'promote');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ Successfully promoted ${mentioned.map(jid => `@${jid.split('@')[0]}`).join(', ')}`,
            mentions: mentioned
        });
    } catch (err) {
        console.error('❌ Promote error:', err);
        await sock.sendMessage(sender, { text: '⚠️ Failed to promote user. Bot might not be admin.' });
    }
}
