// lib/sendReply.js

/**
 * Send a reply message with optional footer tag
 * @param {object} sock - Baileys socket instance
 * @param {string} jid - Recipient JID
 * @param {string} text - Message text
 * @param {object} extra - Additional message options
 */
export async function sendReply(sock, msg, replyText, extra = {}) {
    try {
        const channelJid = "120363420892105577@newsletter"; // your channel JID
        const channelLink = "https://whatsapp.com/channel/0029Vb5p1DHI7Be7UmI7BW0f"; // your channel link

        // Get channel profile picture
        let profilePicUrl;
        try {
            profilePicUrl = await sock.profilePictureUrl(channelJid, "image");
        } catch {
            profilePicUrl = "https://whatsapp.com/channel/0029Vb5p1DHI7Be7UmI7BW0f"; // fallback
        }

        // Send reply with clickable "View channel"
        await sock.sendMessage(
            msg.key.remoteJid,
            {
                text: replyText,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    externalAdReply: {
                        title: "BUGS TECH | WhatsApp Channel",
                        body: "Click to follow our updates",
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        thumbnailUrl: profilePicUrl,
                        mediaUrl: channelLink,
                        sourceUrl: channelLink
                    }
                },
                ...extra
            },
            { quoted: msg }
        );

    } catch (err) {
        console.error("Error in sendReply:", err);
        // fallback
        return sock.sendMessage(
            msg.key.remoteJid,
            { text: replyText, ...extra },
            { quoted: msg }
        );
    }
}