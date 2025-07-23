// utils.js
export async function isGroupAdmin(sock, msg) {
    const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
    const participant = groupMetadata.participants.find(p => p.id === msg.key.participant);
    return participant?.admin === 'admin' || participant?.admin === 'superadmin';
}
