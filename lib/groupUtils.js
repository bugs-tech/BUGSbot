/**
 * ✅ Check if a user is an admin in the group
 * @param {Array<Object>} participants - Group participants metadata
 * @param {string} userJid - The user JID to check
 * @returns {boolean}
 */
 export function isGroupAdmin(participants = [], userJid) {
    return participants.some(p => p.id === userJid && (p.admin === 'admin' || p.admin === 'superadmin'));
}

/**
 * ✅ Get all admin JIDs in the group
 * @param {Array<Object>} participants - Group participants metadata
 * @returns {Array<string>} - Array of admin JIDs
 */
export function getGroupAdmins(participants = []) {
    return participants
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id);
}

/**
 * ✅ Extract all mentioned JIDs from a message
 * @param {object} msg - WhatsApp message object
 * @returns {Array<string>}
 */
export function getMentionedJids(msg = {}) {
    return (
        msg?.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
        msg?.message?.conversation?.contextInfo?.mentionedJid ||
        []
    );
}

/**
 * ✅ Extract the clean user JID from a message object
 * @param {object} msg - WhatsApp message object
 * @returns {string}
 */
export function getSenderJid(msg = {}) {
    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    return isGroup ? (msg.key.participant || msg.participant) : msg.key.remoteJid;
}

/**
 * ✅ Check if the user is one of the owners
 * @param {string} userJid - JID of the user (e.g., 2376xxxxx@s.whatsapp.net)
 * @param {Array<string>} ownerNumbers - Owner numbers without '@s.whatsapp.net'
 * @returns {boolean}
 */
export function isBotOwner(userJid, ownerNumbers = []) {
    return ownerNumbers.some(number => userJid.startsWith(number));
}
