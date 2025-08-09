export const name = 'listonline';

export async function execute(sock, msg, args, context) {
  const { isGroup, sendReply, getName, presenceMap, replyJid } = context;

  if (!isGroup) {
    await sendReply('This command can only be used in groups.');
    return;
  }

  try {
    // Get group metadata
    const metadata = await sock.groupMetadata(replyJid);
    const participants = metadata.participants;

    // Filter participants by online presence
    // presenceMap stores presence by jid with a structure like { id: jid, type: "available" or "unavailable", lastKnownPresence: ... }
    // Adjust according to your presence update structure, assuming 'type' indicates online/offline

    const onlineUsers = participants.filter(p => {
      const presence = presenceMap.get(p.id || p.jid || p.user) || presenceMap.get(p.jid);
      // presence?.type === 'available' means user is online
      // Sometimes presence event can have 'lastKnownPresence' or 'presence' field — adjust if needed
      return presence && (presence.type === 'available' || presence.lastKnownPresence === 'available');
    });

    if (onlineUsers.length === 0) {
      await sendReply('No group members are online right now.');
      return;
    }

    // Build mention list and message text
    let message = `🟢 *Online Members (${onlineUsers.length}):*\n\n`;
    const mentions = [];

    for (const user of onlineUsers) {
      const userJid = user.id || user.jid || user.user;
      const name = await getName(userJid) || userJid.split('@')[0];
      message += `- @${userJid.split('@')[0]} (${name})\n`;
      mentions.push(userJid);
    }

    await sock.sendMessage(replyJid, { text: message, mentions });
  } catch (e) {
    console.error('❌ Error in listonline:', e);
    await sendReply('Failed to get online members.');
  }
}
