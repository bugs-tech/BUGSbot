// commands/listonline.js
export const name = 'listonline';
export const description = 'List currently online members (admins only)';

export async function execute(sock, msg) {
    const groupId = msg.key.remoteJid;
    const isGroup = groupId.endsWith('@g.us');
    if (!isGroup) {
        await sock.sendMessage(groupId, { text: '❌ This command is for group use only.' });
        return;
    }

    const metadata = await sock.groupMetadata(groupId);
    const sender = msg.key.participant || msg.participant;
    const admins = metadata.participants.filter(p => p.admin).map(p => p.id);

    if (!admins.includes(sender)) {
        await sock.sendMessage(groupId, { text: '🚫 Only group admins can use this command.' });
        return;
    }

    const presence = sock.presence[groupId] || {};
    const onlineMembers = Object.entries(presence)
        .filter(([_, val]) => val?.lastKnownPresence === 'available')
        .map(([jid]) => `🟢 @${jid.split('@')[0]}`);

    if (onlineMembers.length === 0) {
        await sock.sendMessage(groupId, { text: '🕸 No members are currently online.' });
    } else {
        await sock.sendMessage(groupId, {
            text: `📶 *Online Members:*\n${onlineMembers.join('\n')}`,
            mentions: onlineMembers.map(j => j.replace('🟢 @', '') + '@s.whatsapp.net')
        });
    }
}
