// kick.js
export const name = 'kick';
export const description = 'Kick a mentioned user from the group (admin only)';

export async function execute(sock, msg, args) {
    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!isGroup) {
        await sock.sendMessage(sender, { text: '❌ This command works only in groups.' });
        return;
    }

    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);
    const senderIsAdmin = admins.includes(sender);
    const botNumber = (await sock.state.legacy.user)?.id || (await sock.user.id);
    const botIsAdmin = admins.includes(botNumber);

    if (!senderIsAdmin) {
        await sock.sendMessage(sender, { text: '🚫 You need to be a *group admin* to use this command.' });
        return;
    }

    if (!botIsAdmin) {
        await sock.sendMessage(sender, { text: '⚠️ I need to be *admin* to kick members.' });
        return;
    }

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (!mentioned || mentioned.length === 0) {
        await sock.sendMessage(sender, { text: '⚠️ Please mention a user to kick.\nExample: *.kick @user*' });
        return;
    }

    try {
        await sock.groupParticipantsUpdate(msg.key.remoteJid, mentioned, 'remove');
        await sock.sendMessage(msg.key.remoteJid, {
            text: `👢 Kicked ${mentioned.map(jid => `@${jid.split('@')[0]}`).join(', ')}`,
            mentions: mentioned
        });
    } catch (err) {
        console.error('❌ Kick error:', err);
        await sock.sendMessage(sender, { text: '❌ Failed to kick user. Check permissions.' });
    }
}
