export const name = 'kick';
export const description = 'Remove a user from the group (admin only)';
export const category = 'Group';
export const usage = '.kick @user';

export async function execute(sock, msg, args, context) {
    const { senderJid, isGroup, replyJid, mentionedJid, sendReply } = context;

    if (!isGroup) {
        return sendReply(replyJid, '❌ This command only works in groups.');
    }

    const groupMetadata = await sock.groupMetadata(replyJid);
    const participants = groupMetadata.participants || [];

    const senderIsAdmin = participants.some(
        p => p.id === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
    );

    const botId = sock.user.id;
    const botIsAdmin = participants.some(
        p => p.id === botId && (p.admin === 'admin' || p.admin === 'superadmin')
    );

    if (!senderIsAdmin) {
        return sendReply(replyJid, '🚫 You must be an admin to use this command.');
    }

    if (!botIsAdmin) {
        return sendReply(replyJid, '❌ I need admin rights to kick members.');
    }

    if (!mentionedJid.length) {
        return sendReply(replyJid, '❗ Please mention the user you want to kick.\n\nExample: `.kick @user`');
    }

    const failed = [];

    for (const user of mentionedJid) {
        try {
            await sock.groupParticipantsUpdate(replyJid, [user], 'remove');
        } catch (err) {
            failed.push(user.split('@')[0]);
        }
    }

    if (failed.length === 0) {
        await sendReply(replyJid, '✅ User(s) removed successfully.');
    } else {
        await sendReply(replyJid, `⚠️ Could not remove: ${failed.map(u => `@${u}`).join(', ')}`, {
            mentions: failed.map(u => `${u}@s.whatsapp.net`)
        });
    }
}
