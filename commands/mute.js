// commands/mute.js
import { getGroupAdmins } from '../lib/groupUtils.js';


export const name = 'mute';
export const description = 'Mute group (only admins can run this)';

export async function execute(sock, msg, args) {
    const groupId = msg.key.remoteJid;
    const sender = msg.key.participant;

    // Check if command is used in a group
    if (!groupId.endsWith('@g.us')) {
        await sock.sendMessage(groupId, { text: '❌ This command can only be used in groups.' });
        return;
    }

    // Get group metadata and check admin status
    const metadata = await sock.groupMetadata(groupId);
    const admins = getGroupAdmins(metadata.participants);

    if (!admins.includes(sender)) {
        await sock.sendMessage(groupId, { text: '❌ Only group admins can mute the group.' });
        return;
    }

    try {
        // Mute group by disabling messages from non-admins
        await sock.groupSettingUpdate(groupId, 'announcement');
        await sock.sendMessage(groupId, { text: '🔇 *Group has been muted.* Only admins can send messages now.' });
    } catch (err) {
        await sock.sendMessage(groupId, { text: '⚠️ Failed to mute the group. Make sure I have admin rights.' });
        console.error('Mute command error:', err);
    }
}
