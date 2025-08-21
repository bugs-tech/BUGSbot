export const name = 'listonline';

export async function execute(sock, msg, args, context) {
  const { isGroup, sendReply, getName, presenceMap, replyJid } = context;

  if (!isGroup) {
    await sendReply('❌ This command can only be used in groups.');
    return;
  }

  try {
    // Get group metadata
    const metadata = await sock.groupMetadata(replyJid);
    const participants = metadata.participants;

    // Collect online + recently online
    const onlineUsers = [];
    const recentUsers = [];
    const now = Date.now();

    for (const p of participants) {
      const userJid = p.id || p.jid || p.user;
      const presence = presenceMap.get(userJid);

      if (!presence) continue;

      // Mark as online if actively available
      if (
        presence.lastKnownPresence === 'available' ||
        presence.lastKnownPresence === 'composing' ||
        presence.lastKnownPresence === 'recording'
      ) {
        onlineUsers.push(userJid);
        presence.lastOnline = now; // update last seen
        presenceMap.set(userJid, presence);
      } else if (presence.lastOnline && now - presence.lastOnline < 120000) {
        // Seen within 2 mins
        recentUsers.push(userJid);
      }
    }

    if (onlineUsers.length === 0 && recentUsers.length === 0) {
      await sendReply('😴 No group members are active right now.');
      return;
    }

    // Build output message
    let message = `📡 *Online/Recently Active Members*\n\n`;

    if (onlineUsers.length > 0) {
      message += `🟢 *Currently Online (${onlineUsers.length}):*\n`;
      for (const jid of onlineUsers) {
        const name = await getName(jid) || jid.split('@')[0];
        message += `- @${jid.split('@')[0]} (${name})\n`;
      }
      message += `\n`;
    }

    if (recentUsers.length > 0) {
      message += `🕒 *Recently Online (last 2 min) (${recentUsers.length}):*\n`;
      for (const jid of recentUsers) {
        const name = await getName(jid) || jid.split('@')[0];
        message += `- @${jid.split('@')[0]} (${name})\n`;
      }
    }

    // Send with mentions
    await sock.sendMessage(replyJid, {
      text: message,
      mentions: [...onlineUsers, ...recentUsers],
    });

  } catch (e) {
    console.error('❌ Error in listonline:', e);
    await sendReply('⚠️ Failed to get online members.');
  }
}
