// commands/grouplock.js

export const name = 'grouplock';
export const description = 'Lock or unlock the group chat for non-admins';

export async function execute(sock, msg, args) {
    const groupId = msg.key.remoteJid;

    // 🔒 Ensure this runs only in group chats
    if (!groupId.endsWith('@g.us')) {
        await sock.sendMessage(groupId, { text: '❌ This command can only be used in groups.' });
        return;
    }

    // 🔐 Check if sender is an admin
    const metadata = await sock.groupMetadata(groupId);
    const sender = msg.key.participant;
    const isAdmin = metadata.participants.find(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
    if (!isAdmin) {
        await sock.sendMessage(groupId, { text: '🚫 Only group admins can use this command.' });
        return;
    }

    const mode = (args[0] || '').toLowerCase();
    if (mode !== 'on' && mode !== 'off') {
        await sock.sendMessage(groupId, { text: '⚠️ Usage: .grouplock on | .grouplock off' });
        return;
    }

    const locked = mode === 'on';

    await sock.groupSettingUpdate(groupId, locked ? 'announcement' : 'not_announcement');

    await sock.sendMessage(groupId, {
        text: locked
            ? '🔒 *Group Locked*\nOnly admins can send messages.'
            : '🔓 *Group Unlocked*\nEveryone can send messages now.'
    });
}
