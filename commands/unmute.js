// commands/unmute.js
import { getGroupAdmins } from '../lib/groupUtils.js';

export const name = 'unmute';
export const description = '🔊 Unmute the group (allow members to send messages)';
export const groupOnly = true;

export async function execute(sock, msg, args) {
    const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
    const admins = getGroupAdmins(groupMetadata.participants);
    const sender = msg.key.participant;

    if (!admins.includes(sender)) {
        await sock.sendMessage(msg.key.remoteJid, {
            text: '⛔ Only *group admins* can use this command!'
        });
        return;
    }

    await sock.groupSettingUpdate(msg.key.remoteJid, 'not_announcement');
    await sock.sendMessage(msg.key.remoteJid, {
        text: '🔊 *Group unmuted!*Members can now send messages.'
    });
}
