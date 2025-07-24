// commands/broadcastgroup.js

let groupBroadcastState = {};

export const name = 'gcbroadcast';
export const description = 'Toggle group broadcast mode ON or OFF (for admins only)';

export async function execute(sock, msg, args, { isGroup, senderJid, replyJid, sendReply }) {
    if (!isGroup) {
        return sendReply(replyJid, '❌ This command can only be used in a group.');
    }

    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const senderIsAdmin = metadata.participants?.find(p =>
        p.id === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
    );

    if (!senderIsAdmin) {
        return sendReply(replyJid, '❌ Only group admins can toggle group broadcast mode.');
    }

    const groupId = msg.key.remoteJid;

    const action = (args[0] || '').toLowerCase();
    if (action !== 'on' && action !== 'off') {
        return sendReply(replyJid, `⚙️ Use *.gcbroadcast on* or *.gcbroadcast off*`);
    }

    groupBroadcastState[groupId] = (action === 'on');
    await sendReply(replyJid, `📣 Group Broadcast has been turned *${action.toUpperCase()}*.`);
}

// Getter to use in handler
export function isGroupBroadcastEnabled(groupId) {
    return !!groupBroadcastState[groupId];
}
