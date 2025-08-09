// commands/tagadmin.js

export const name = 'tagadmin';
export const description = 'Tag all admins in the group';
export const usage = '.tagadmin';
export const category = 'group';

export async function execute(sock, msg, args, context) {
  const { isGroup, replyJid, sendReply, getName } = context;

  if (!isGroup) {
    return sendReply('❌ This command can only be used in groups.');
  }

  try {
    const metadata = await sock.groupMetadata(replyJid);
    const admins = metadata.participants.filter(p => p.admin || p.admin === 'admin' || p.admin === 'superadmin');

    if (admins.length === 0) {
      return sendReply('⚠️ No admins found in this group.');
    }

    // Fetch names for all admins
    const mentions = [];
    const lines = [];

    for (const admin of admins) {
      const jid = admin.id;
      let name = await getName(jid);
      if (!name) name = jid.split('@')[0];

      mentions.push(jid);
      lines.push(`- @${name}`);
    }

    const text = `👑 *Group Admins:*\n\n${lines.join('\n')} \n\n - *BUGS-TECH* -`;

    await sock.sendMessage(replyJid, {
      text,
      mentions,
    });

  } catch (err) {
    console.error('❌ tagadmin command error:', err);
    await sendReply('⚠️ Failed to fetch group admins or send message.');
  }
}
