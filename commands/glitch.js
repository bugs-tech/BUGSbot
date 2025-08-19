// commands/glitch.js
export const name = 'glitch';
export const description = 'Send a demo lag payload (safe & educational). Only bot owner can use.';
export const category = 'Owner';

export async function execute(sock, msg, args, context) {
  const { isOwner, sendReply } = context;

  if (!isOwner) {
    return await sendReply('❌ Only the bot owner can use this command.', { quoted: msg });
  }

  if (!args[0]) {
    return await sendReply('⚠️ Provide a target number/JID/username.\nUsage: .glitch <target>', { quoted: msg });
  }

  let target = args[0];
  if (msg.mentionedJid && msg.mentionedJid.length > 0) {
    target = msg.mentionedJid[0];
  } else if (!target.includes('@')) {
    target = target.replace(/\D/g, '') + '@s.whatsapp.net';
  }

  // Smaller zero-width chunks to prevent timeout
  const chunk = '\u200B'.repeat(500); 
  const messages = 5; // number of messages to send
  try {
    for (let i = 0; i < messages; i++) {
      await sock.sendMessage(target, { text: `⚠ Glitch Demo Part ${i+1}\n${chunk}` });
    }
    await sendReply(`✅ Glitch demo sent safely to ${target}.`, { quoted: msg });
  } catch (err) {
    console.error('❌ Error sending glitch demo:', err);
    await sendReply('❌ Failed to send glitch demo.', { quoted: msg });
  }
}
