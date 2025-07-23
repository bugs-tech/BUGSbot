// demote.js
export const name = 'demote';

export async function execute(sock, msg, args) {
    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    if (!isGroup) {
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ This command only works in groups." });
        return;
    }

    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    const sender = msg.key.participant || msg.key.remoteJid;

    // Check if sender is admin
    const admins = metadata.participants
        .filter(p => p.admin !== null)
        .map(p => p.id);

    if (!admins.includes(sender)) {
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ Only group admins can use this command." });
        return;
    }

    // Get mentioned user or replied user to demote
    let target;

    // Prefer mentioned users
    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
        target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Else try replied user
    else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
        target = msg.message.extendedTextMessage.contextInfo.participant;
    } else {
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ Please mention or reply to the user you want to demote." });
        return;
    }

    // Check if target is admin (can only demote admins)
    if (!admins.includes(target)) {
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ The user is not an admin." });
        return;
    }

    try {
        // Demote the user by setting their admin role to null
        await sock.groupParticipantsUpdate(msg.key.remoteJid, [target], "demote");

        await sock.sendMessage(msg.key.remoteJid, { text: `✅ Successfully demoted <@${target.split('@')[0]}>.` , mentions: [target] });
    } catch (error) {
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ Failed to demote user." });
        console.error("Error demoting user:", error);
    }
}
